import { SimpleStack } from "../../collection/simple-stack";
import { Block } from "../../formattedtext/ast/block";
import { BlockType } from "../../formattedtext/ast/block-type";
import { Line } from "../../formattedtext/ast/line";
import { TypedBlock } from "../../formattedtext/ast/typed-block";
import { StringWalker } from "../string-walker";
import { isWhitespace, isDigit } from "../character-check";

import { ParsingParameters } from "./parsing-parameters";
import { FragmentParser } from "./fragment-parser";

/**
 * Parser for a text with markup.
 */
export class BlockParser
{
	private static readonly orderedListDigit = '0';

	private walker: StringWalker;
	private parsingParameters: ParsingParameters;
	private document = new TypedBlock(BlockType.Document);
	private stack = new SimpleStack<TypedBlock>();
	private inCodeBlock: boolean;

	private constructor(walker: StringWalker, parsingParameters: ParsingParameters)
	{
		this.walker = walker;
		this.parsingParameters = parsingParameters;
	}

	static parse(walker: StringWalker, parsingParameters = new ParsingParameters()): Block
	{
		if (walker == undefined || !walker.atLineStart)
			throw Error("Parsing must start at the beginning of a line");

		const parser = new BlockParser(walker, parsingParameters);
		return parser.parse();
	}

	private parse(): Block
	{
		while (this.walker.hasMore())
		{
			if (this.walker.match(this.parsingParameters.codeBlockSign))
			{
				this.handleCodeBlockSign();
				continue;
			}
			if (this.inCodeBlock)
			{
				this.addCurrentLine();
				continue;
			}

			this.walker.skipSpaces();
			if (this.walker.atLineEnd)
			{
				this.handleEmptyLine();
			}
			else
			{
				this.handleLine();
			}
		}
		this.popAllStackToDocument();

		return this.document;
	}

	private popStackToDocument(): void
	{
		const block = this.stack.pop();
		if (block)
		{
			this.document.add(block);
		}
	}

	private popAllStackToDocument(): void
	{
		while (!this.stack.isEmpty)
		{
			this.popStackToDocument();
		}
	}

	private isTitleBlock(blockType: BlockType): boolean
	{
		return blockType == BlockType.Title1 || blockType == BlockType.Title2 || blockType == BlockType.Title3;
	}
	private isSameTitle(blockType: BlockType, previousType: BlockType): boolean
	{
		return this.isTitleBlock(blockType) && this.isTitleBlock(previousType) && blockType == previousType;
	}

	/**
	 * Raw add, for code blocks.
	 */
	private addCurrentLine(): void
	{
		let builder = [];
		do
		{
			if (!this.walker.atLineEnd)
			{
				builder.push(this.walker.current);
			}
			this.walker.forward();
		} while (!this.walker.atLineStart && this.walker.hasMore());
		const line = new Line(builder.join());
		this.addLine(line);
	}

	private addLine(line: Line): void
	{
		const block = this.stack.peek();
		if (!block)
		{
			this.addParagraph(line);
		}
		else
		{
			block.add(line);
		}
	}

	private addParagraph(line: Line): void
	{
		const block = new TypedBlock(BlockType.Paragraph, line);
		this.stack.push(block);
	}

	private popPreviousBlockIfNeeded(blockType: BlockType): void
	{
		const previousType  = this.getPreviousType();
		if (previousType == BlockType.None)
			return;

		if (this.isTitleBlock(previousType) && blockType != previousType)
		{
			// We don't support sub-blocks in titles
			this.popStackToDocument();
		}
		else if (previousType == BlockType.Paragraph && blockType != BlockType.Paragraph)
		{
			// We don't accept other blocks in paragraphs
			this.popStackToDocument();
		}
		else if ((previousType == BlockType.UnorderedList || previousType == BlockType.OrderedList) &&
				(blockType != BlockType.ListItemBullet && blockType != BlockType.ListItemNumber))
		{
			// Currently, we don't put blocks in list items
			this.popStackToDocument();
		}
	}

	private getPreviousType()
	{
		const previousBlock = this.stack.peek();
		if (!previousBlock)
			return BlockType.None;
		const previousType = previousBlock.type;
		return previousType;
	}

	private handleCodeBlockSign(): void
	{
		this.inCodeBlock = !this.inCodeBlock;
		if (this.inCodeBlock)
		{
			this.popPreviousBlockIfNeeded(BlockType.Code);
			this.stack.push(new TypedBlock(BlockType.Code));
		}
		else
		{
			this.popStackToDocument();
		}
		this.walker.goToNextLine();
	}

	private handleEmptyLine(): void
	{
		const block = this.stack.peek();
		if (block)
		{
			// End of current block
			this.popStackToDocument();
		}
		// Skip it
		this.walker.forward();
	}

	private handleLine(): void
	{
		const blockType = this.checkBlockSignWithEscape();
		const line = FragmentParser.parse(this.walker, this.parsingParameters);
		if (blockType == BlockType.None)
		{
			// Plain line
		}
	}
	private checkBlockSignWithEscape(): BlockType
	{
		if (this.walker.current == this.parsingParameters.escapeSign)
		{
			const blockSign = this.checkBlockSign(1);
			if (blockSign != undefined || this.walker.next == this.parsingParameters.escapeSign)
			{
				// Skip this escape (really escaping something)
				this.walker.forward();
			}
			// Otherwise, the escape sign is kept literally
			// And we are not on a block sign
			return BlockType.None;
		}

		const blockSign = this.checkBlockSign(0);
		const blockType = this.processBlockSign(blockSign);
		return blockType;
	}

	private checkBlockSign(offset: number): string | undefined
	{
		for (const blockSign of ParsingParameters.blockTypeSigns)
		{
			if (this.walker.matchAt(offset, blockSign))
			{
				if (isWhitespace(this.walker.charAt(offset + blockSign.length)))
					return blockSign;
			}
		}
		return this.checkNumberedListItem(offset);
	}

	private checkNumberedListItem(offset: number): string | undefined
	{
		if (!isDigit(this.walker.charAt(offset)))
			return undefined;

		const digits = [ BlockParser.orderedListDigit ];
		let dn = 1;
		while (isDigit(this.walker.charAt(offset + dn)))
		{
			dn++;
			digits.push(BlockParser.orderedListDigit);
		}
		digits.push(".");
		if (this.parsingParameters.isOrderedListSuffix(this.walker.charAt(offset + dn)) &&
				isWhitespace(this.walker.charAt(offset + dn + 1)))
			return digits.join();

		return undefined;
	}

	private processBlockSign(blockSign: string | undefined): BlockType
	{
		if (blockSign == undefined)
			return BlockType.None;

		const blockType = blockSign.startsWith(
				BlockParser.orderedListDigit) ? BlockType.ListItemNumber : this.parsingParameters.getBlockType(blockSign);
		this.walker.forward(blockSign.length + 1); // +1 for mandatory whitespace after the sign
		this.walker.skipSpaces();
		return blockType;
	}
}

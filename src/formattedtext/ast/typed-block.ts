import { Block } from "./block";
import { BlockType } from "./block-type";
import { Line } from "./line";

/**
 * A typed block has a type (header, list, etc.) that applies to all the blocks it contains.<br>
 * These blocks can be typed too, nesting these types.
 */
export class TypedBlock implements Block
{
	private type: BlockType;
	private blocks: Block[] = [];

	constructor(type: BlockType, block?: Block)
	{
		this.type = type;
		if (block)
		{
			this.add(block);
		}
	}

	add(textOrBlock: string | Block): void
	{
		if (typeof textOrBlock == 'string')
		{
			this.blocks.push(new Line(textOrBlock));
		}
		else
		{
			this.blocks.push(textOrBlock);
		}
	}

	getType(): BlockType
	{
		return this.type;
	}
	getBlocks(): Block[]
	{
		return this.blocks;
	}
}

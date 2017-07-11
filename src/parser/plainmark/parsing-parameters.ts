import { FragmentDecoration } from "../../formattedtext/ast/fragment-decoration";
import { BlockType } from "../../formattedtext/ast/block-type";
import { isAlphanumerical } from "../character-check";

interface Dictionary<T> { [K: string]: T }

export class ParsingParameters
{
	static readonly strongSign = '*';
	static readonly emphasisSign = '_';
	static readonly deleteSign = '-';
	static readonly codeFragmentSign = '`'; // Back-tick

	static readonly linkStartSign = '[';
	static readonly linkEndSign = ']';
	static readonly urlStartSign = '(';
	static readonly urlEndSign = ')';

	private static readonly orderedListSuffix = '.';

	static readonly defaultUrlPrefixes =
	[
		"http://", "https://", "ftp://", "ftps://", "sftp://",
	];

	// http://stackoverflow.com/questions/1856785/characters-allowed-in-a-url
	private static readonly validUrlChars =
		"-._~" + // unreserved (with alpha-num, of course)
		":/?#[]@" + // reserved, gen-delims
		"!$&'()*+,;=" + // reserved, sub-delims
		"%"; // escape

	private static readonly decorations =
	{
		[ParsingParameters.strongSign]: FragmentDecoration.Strong,
		[ParsingParameters.emphasisSign]: FragmentDecoration.Emphasis,
		[ParsingParameters.deleteSign]: FragmentDecoration.Delete,
		[ParsingParameters.codeFragmentSign]: FragmentDecoration.Code,
	};
	private static readonly blockTypesPerSign: Dictionary<BlockType> =
	{
		'#': BlockType.Title1,
		'##': BlockType.Title2,
		'###': BlockType.Title3,
		'*': BlockType.ListItemBullet,
		'-': BlockType.ListItemBullet,
		'+': BlockType.ListItemBullet,
	};
	static readonly blockTypeSigns = [ '#', '##', '###', '*', '-', '+', ];

	// These are public, they can be changed.
	escapeSign = "~";
	codeBlockSign = "```"; // 3 back-ticks, like GitHub

	maxLinkLength = 30;
	ellipsis = "\u2026";

	urlPrefixes = ParsingParameters.defaultUrlPrefixes.slice(); // Copy to be able to edit it

	getFragmentDecoration(sign: string): FragmentDecoration
	{
		return ParsingParameters.decorations[sign];
	}
	getBlockType(blockSign: string): BlockType
	{
		return ParsingParameters.blockTypesPerSign[blockSign];
	}
	isOrderedListSuffix(c: string): boolean
	{
		// Encapsulated because maybe someday we can have alternatives
		return c == ParsingParameters.orderedListSuffix;
	}
	isValidUrlChar(c: string): boolean
	{
		return isAlphanumerical(c) || ParsingParameters.validUrlChars.includes(c);
	}
}

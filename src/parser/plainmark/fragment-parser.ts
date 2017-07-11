import { Line } from "../../formattedtext/ast/line";
import { StringWalker } from "../string-walker";
import { isWhitespace, isDigit } from "../character-check";

import { ParsingParameters } from "./parsing-parameters";

export class FragmentParser
{
	static parse(walker: StringWalker, parsingParameters = new ParsingParameters()): Line
	{
		return new Line("");
	}

}

import { Fragment } from "./fragment";
import { FragmentDecoration } from "./fragment-decoration";

/**
 * A fragment with only plain text in it.
 * <p>
 * Leaf of a tree of decorated fragments.
 */
export class TextFragment implements Fragment
{
	readonly decoration = FragmentDecoration.None;
	readonly fragments = [];
	text: string = "";

	constructor(text: string)
	{
		this.text = text;
	}

	add(text: string | Fragment): void
	{
		this.text += text;
	}
}

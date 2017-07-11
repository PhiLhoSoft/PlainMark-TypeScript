import { Block } from "./block";
import { Fragment } from "./fragment";
import { FragmentDecoration } from "./fragment-decoration";
import { TextFragment } from "./text-fragment";

/**
 * A line is created each time the parser finds a start of line.
 * <p>
 * It contains a series of fragments, each with their own decoration, if any.<br>
 * It is a bridge between fragments (it is a fragment grouping other fragments) and blocks (it is a leaf / base unit of block hierarchy).
 */
export class Line implements Block, Fragment
{
	fragments: Fragment[] = [];

	constructor(textOrFragment: string | Fragment)
	{
		this.add(textOrFragment);
	}

	add(textOrFragment: string | Fragment): void
	{
		if (typeof textOrFragment == 'string')
		{
			this.fragments.push(new TextFragment(textOrFragment));
		}
		else
		{
			this.fragments.push(textOrFragment);
		}
	}

	getFragments(): Fragment[]
	{
		return this.fragments;
	}

	getDecoration(): FragmentDecoration
	{
		return FragmentDecoration.None;
	}
}
import { Fragment } from "./fragment";
import { FragmentDecoration } from "./fragment-decoration";
import { TextFragment } from "./text-fragment";

/**
 * A decorated fragment
 */
export class DecoratedFragment implements Fragment
{
	readonly decoration: FragmentDecoration;
	readonly fragments: Fragment[] = [];

	constructor(decoration: FragmentDecoration, firstText?: string | Fragment)
	{
		this.decoration = decoration;
		if (firstText != undefined)
		{
			this.add(firstText);
		}
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
}

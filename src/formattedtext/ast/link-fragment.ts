import { Fragment } from "./fragment";
import { FragmentDecoration } from "./fragment-decoration";
import { TextFragment } from "./text-fragment";

/**
 * Fragment representing a link with a text and a URL.
 * <p>
 * The text is a list of decorated or plain text fragments.<br>
 * The URL is just a string.
 */
export class LinkFragment implements Fragment
{
	readonly decoration = FragmentDecoration.Link;
	readonly fragments: Fragment[] = [];
	readonly url: string = ""; // destination anchor

	constructor(text?: string, url?: string)
	{
		if (text != undefined)
		{
			this.add(text);
		}
		if (url != undefined)
		{
			this.url = url;
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

import { MarkedText } from "./marked-text";
import { FragmentDecoration } from "./fragment-decoration";

/**
 * Fragment of text, decorated or not.
 * <p>
 * A fragment can be plain text or a list of other fragments, with a given style, allowing nesting of styles
 * (emphasis text inside strong text, for example).<br>
 * A fragment doesn't extend over line breaks.
 */
export interface Fragment extends MarkedText
{
	getDecoration(): FragmentDecoration;

	add(text: string): void;
	add(fragment: Fragment): void;

	getFragments(): Fragment[];
}
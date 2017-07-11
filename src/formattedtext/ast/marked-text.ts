import { MarkupVisitor } from "./markup-visitor";

/**
 * Text with, or without decoration / type, organized in fragments of line, lines, grouped in blocks.
 */
export interface MarkedText
{
	add(text: string): void;

//	accept<T>(visitor: MarkupVisitor<T>, output: T): void;
}

//import { DecoratedFragment } from "./";
//import { LinkFragment } from "./";
//import { TextFragment } from "./";
//import { TypedBlock } from "./";
//import { Line } from "./";

export interface MarkupVisitor<T>
{
	dummy(): void;
	/*
	visit(fragment: DecoratedFragment, context: T): void;
	visit(fragment: LinkFragment, context: T): void;
	visit(fragment: TextFragment, context: T): void;
	visit(typedBlock: TypedBlock, context: T): void;
	visit(line: Line, context: T): void;
	*/
}

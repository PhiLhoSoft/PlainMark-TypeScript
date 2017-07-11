/*
 * Various character checking functions.
 */


export function isAlphanumerical(c: string): boolean
{
	return c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' || c >= '0' && c <= '9';
}
export function isDigit(c: string): boolean
{
	return c >= '0' && c <= '9';
}
export function isLineTerminator(c: string): boolean
{
	return c == '\n' || c == '\r' || c == '\u0085' || c == '\u2028' || c == '\u2029';
}
/**
 * Only whitespace, not line terminators.
 */
export function isWhitespace(c: string): boolean
{
	return c == ' ' || c == '\t';
}

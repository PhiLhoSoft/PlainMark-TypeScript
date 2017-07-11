import { isLineTerminator, isWhitespace } from "./character-check";

/**
 * Allows to "walk" through a string, character by character, always forward but keeping an eye on the immediate past (and future!).
 * <p>
 * Intended to be used by a parser, abstracting the concept of end-of-line (EOL): the current character is always only newline on a line break,
 * Windows line breaks are seen as only one char.
 */
export class StringWalker
{
	private readonly placeholderChar = '\0';

	private walked: string;
	private cursor: number;
	/**
	 * True if we are no an end-of-line character<br>
	 * (classical CR and LF, but also Unicode EOL code points).
	 */
	atLineStart: boolean;
	/**
	 * True if we are at the start of a line (just after an EOL).
	 */
	atLineEnd: boolean;

	/**
	 * The current character, if any (space otherwise).
	 */
	current = this.placeholderChar;
	/**
	 * The previous character, if any (space otherwise).
	 */
	previous = this.placeholderChar;
	/**
	 * The next character, if any (space otherwise).
	 */
	next = this.placeholderChar;

	constructor(toWalk: string)
	{
		this.walked = toWalk;
		this.atLineStart = true;
		this.cursor = -1;
		this.fetchNextCharacter();
		this.current = this.next;
		this.cursor++;
		this.fetchNextCharacter();
		this.updateAtLineEnd();
	}

	/**
	 * True if there are more characters to walk through.
	 */
	hasMore(): boolean
	{
		return this.cursor < this.walked.length;
	}
	/**
	 * Advance by one (default) or more characters (two if these are a Windows line-ending CR+LF pair).
	 */
	forward(n = 1): void
	{
		for (let i = 0; i < n; i++)
		{
			if (this.hasMore())
			{
				this.atLineStart = this.atLineEnd;
				this.cursor++;
				this.previous = this.current;
				this.current = this.next;
				this.updateAtLineEnd();
				this.fetchNextCharacter();
			}
			else
			{
				this.atLineStart = false;
				this.atLineEnd = true;
				this.previous = this.current = this.next = this.placeholderChar;
				break;
			}
		}
	}

	/**
	 * Goes forward, skipping whitespace characters (space & tab only).
	 *
	 * @return the number of whitespace characters that has been skipped
	 */
	skipSpaces(): number
	{
		let counter = 0;
		while (isWhitespace(this.current))
		{
			this.forward();
			counter++;
		}
		return counter;
	}

	goToNextLine(): void
	{
		do
		{
			this.forward();
		} while (!this.atLineStart && this.hasMore());
	}


	/**
	 * If the argument is a string, returns true if the string at the current position matches the given string.
	 * Otherwise, it is a single character ; returns true if the current character is the given one,
	 * or if two chars are given, returns true if both the current and the next characters are the given ones.
	 */
	match(c: string, cc?: string): boolean
	{
		if (c.length > 1)
			return this.matchString(c);

		return c == this.current && (cc ? cc == this.next : true);
	}
	private matchString(s: string): boolean
	{
		if (s.charAt(0) != this.current)
			return false;
		if (s.charAt(1) != this.next)
			return false;
		if (s.length == 2)
			return true;
		for (let i = 2; i < s.length; i++)
		{
			if (s.charAt(i) != this.safeCharAt(this.cursor + i, this.placeholderChar))
				return false;
		}
		return true;
	}
	/**
	 * match() with forward offset relative to the position of the cursor.
	 */
	matchAt(offset: number, s: string): boolean
	{
		if (s == undefined || s == '')
			return false; // Whatever...
		// Same algo without the quick exits
		for (let i = 0; i < s.length; i++)
		{
			if (s.charAt(i) != this.safeCharAt(offset + this.cursor + i, this.placeholderChar))
				return false;
		}
		return true;
	}

	/**
	 * Returns the character at the given offset from the current character.
	 * Can check with {@link StringWalker#isValid(char)} if the character is a valid one
	 * (position outside the range of the string to walk).
	 * Note: can return a CR or LF character if going over the line boundary.
	 *
	 * @param pos  the position / index of the character to fetch
	 *
	 * @return the fetched character
	 */
	charAt(position: number): string
	{
		let pos = position + this.cursor;
		if (pos >= 0 && pos < this.walked.length)
			return this.walked.charAt(pos);

		return this.placeholderChar;
	}

	/**
	 * Tells if the given character is a valid one.
	 * "Valid" applies only to return values of {@link StringWalker#previous()}, {@link StringWalker#current()},
	 * {@link StringWalker#next()} or {@link StringWalker#charAt(int)}.
	 * These values are invalid if the corresponding position in the string is invalid (beyond its bounds).
	 *
	 * @param c  the character to check
	 * @return true if the character is valid, false otherwise
	 */
	isValid(c: string): boolean
	{
		return c != this.placeholderChar;
	}

	private fetchNextCharacter(): void
	{
		this.next = this.safeCharAt(this.cursor + 1, this.placeholderChar);
		if (this.current == '\r' && this.next == '\n')
		{
			// Skip the carriage return we have in Windows line breaks, so we standardize on the newline char.
			// Don't take in account old Mac (pre-OSX) end-of-line (carriage return only).
			this.next = this.safeCharAt(++this.cursor + 1, this.placeholderChar);
		}
	}
	/**
	 * Returns the character at the given position.
	 * If the position is outside the range of the string to walk, returns the given default character.
	 *
	 * @param pos  the position / index of the character to fetch
	 * @param defaultChar  the character to return if the position is invalid
	 * @return the fetched character or the default one
	 */
	private safeCharAt(position: number, defaultChar: string): string
	{
		if (position >= 0 && position < this.walked.length)
			return this.walked.charAt(position);

		return defaultChar;
	}

	private updateAtLineEnd(): void
	{
		this.atLineEnd = isLineTerminator(this.current) || !this.hasMore();
	}
}

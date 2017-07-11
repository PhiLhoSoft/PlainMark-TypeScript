import { StringWalker } from "../../src/parser/string-walker";

describe("StringWalker", () =>
{
    it("tests simple / base things", () =>
    {
		const s = "Simple";
		const walker = new StringWalker(s);

		// Poking, no cursor move
        expect(walker.charAt(0)).toBe('S');
        expect(walker.charAt(5)).toBe('e');
        expect(walker.charAt(7)).toBe('\0');
        expect(walker.charAt(-1)).toBe('\0');

		expect(walker.hasMore()).toBe(true);
		expect(walker.atLineEnd).toBe(false);
		expect(walker.atLineStart).toBe(true);

		expect(walker.previous).toBe('\0');
		expect(walker.current).toBe('S');
		expect(walker.next).toBe('i');
		expect(walker.isValid(walker.previous)).toBe(false);
		expect(walker.isValid(walker.current)).toBe(true);
		expect(walker.isValid(walker.next)).toBe(true);

		expect(walker.match('S')).toBe(true);
		expect(walker.match('s')).toBe(false);
		expect(walker.match('S', 'i')).toBe(true);
		expect(walker.match('S', 'I')).toBe(false);
		expect(walker.match('Simple')).toBe(true);
		expect(walker.matchAt(3, 'ple')).toBe(true);
		expect(walker.match('Sample')).toBe(false);
		expect(walker.matchAt(3, 'tuple')).toBe(false);

		walker.forward();

		expect(walker.hasMore()).toBe(true);
		expect(walker.atLineEnd).toBe(false);
		expect(walker.atLineStart).toBe(false);

		expect(walker.previous).toBe('S');
		expect(walker.current).toBe('i');
		expect(walker.next).toBe('m');
		expect(walker.isValid(walker.previous)).toBe(true);
		expect(walker.isValid(walker.current)).toBe(true);
		expect(walker.isValid(walker.next)).toBe(true);

		expect(walker.match('i')).toBe(true);
		expect(walker.match('S')).toBe(false);
		expect(walker.match('i', 'm')).toBe(true);
		expect(walker.match('i', 'x')).toBe(false);
		expect(walker.match('impl')).toBe(true);
		expect(walker.matchAt(2, 'ple')).toBe(true);
		expect(walker.match('mple')).toBe(false);
		expect(walker.matchAt(2, 'ample')).toBe(false);

		walker.forward(3);

		expect(walker.hasMore()).toBe(true);
		expect(walker.atLineEnd).toBe(false);
		expect(walker.atLineStart).toBe(false);

		expect(walker.previous).toBe('p');
		expect(walker.current).toBe('l');
		expect(walker.next).toBe('e');

		expect(walker.match('l')).toBe(true);
		expect(walker.match('x')).toBe(false);
		expect(walker.match('l', 'e')).toBe(true);
		expect(walker.match('x', 'x')).toBe(false);
		expect(walker.match('le')).toBe(true);
		expect(walker.matchAt(0, 'le')).toBe(true);
		expect(walker.match('le ')).toBe(false);
		expect(walker.match('leet')).toBe(false);
		expect(walker.matchAt(1, 'le')).toBe(false);

		expect(walker.charAt(-1)).toBe('p');
		expect(walker.charAt(0)).toBe('l');
		expect(walker.charAt(1)).toBe('e');
		expect(walker.charAt(2)).toBe('\0');
		expect(walker.charAt(-12)).toBe('\0');

		walker.forward(2);

		expect(walker.hasMore()).toBe(false);
		expect(walker.atLineEnd).toBe(true);
		expect(walker.atLineStart).toBe(false);

		expect(walker.previous).toBe('e');
		expect(walker.current).toBe('\0');
		expect(walker.next).toBe('\0');
		expect(walker.isValid(walker.previous)).toBe(true);
		expect(walker.isValid(walker.current)).toBe(false);
		expect(walker.isValid(walker.next)).toBe(false);

		expect(walker.match('x')).toBe(false);
		expect(walker.match('x', 'x')).toBe(false);
		expect(walker.match('meet')).toBe(false);
		expect(walker.matchAt(10, 'beet')).toBe(false);

		walker.forward();

		expect(walker.hasMore()).toBe(false);
		expect(walker.atLineEnd).toBe(true);
		expect(walker.atLineStart).toBe(false);

		expect(walker.previous).toBe('\0');
		expect(walker.current).toBe('\0');
		expect(walker.next).toBe('\0');
		expect(walker.isValid(walker.previous)).toBe(false);
		expect(walker.isValid(walker.current)).toBe(false);
		expect(walker.isValid(walker.next)).toBe(false);

		expect(walker.match('x')).toBe(false);
		expect(walker.match('x', 'x')).toBe(false);
		expect(walker.match('me')).toBe(false);
		expect(walker.matchAt(7, 'bee')).toBe(false);
    });

	it("test iteratively simple things", () =>
	{
		const s = "Simple";
		const walker = new StringWalker(s);

		let c = 0;
		while (walker.hasMore())
		{
			expect(walker.atLineStart).toBe(c == 0);
			expect(walker.atLineEnd).toBe(c == s.length);

			expect(walker.previous).toBe(c == 0 ? '\0' : s.charAt(c - 1));
			expect(walker.current).toBe(s.charAt(c));
			expect(walker.next).toBe(c == s.length - 1 ? '\0' : s.charAt(c + 1));

			walker.forward();
			c++;
		}
		expect(c).toBe(s.length);
	});

	it("test Unix new line", () =>
	{
		const s = "Line\nBreak";
		const walker = new StringWalker(s);

		expect(walker.charAt(0)).toBe('L');
		expect(walker.charAt(3)).toBe('e');
		expect(walker.charAt(4)).toBe('\n');
		expect(walker.charAt(5)).toBe('B');
		expect(walker.charAt(9)).toBe('k');
		expect(walker.charAt(12)).toBe('\0');
		expect(walker.charAt(-1)).toBe('\0');

		walker.forward(3);

		expect(walker.hasMore()).toBe(true);
		expect(walker.atLineEnd).toBe(false);
		expect(walker.atLineStart).toBe(false);

		expect(walker.previous).toBe('n');
		expect(walker.current).toBe('e');
		expect(walker.next).toBe('\n');

		expect(walker.match('e', 'e')).toBe(false);
		expect(walker.match("en")).toBe(false);

		expect(walker.charAt(-1)).toBe('n');
		expect(walker.charAt(0)).toBe('e');
		expect(walker.charAt(1)).toBe('\n');
		expect(walker.charAt(2)).toBe('B');
		expect(walker.charAt(12)).toBe('\0');
		expect(walker.charAt(-12)).toBe('\0');

		walker.forward();

		expect(walker.hasMore()).toBe(true);
		expect(walker.atLineEnd).toBe(true);
		expect(walker.atLineStart).toBe(false);

		expect(walker.previous).toBe('e');
		expect(walker.current).toBe('\n');
		expect(walker.next).toBe('B');

		walker.forward();

		expect(walker.hasMore()).toBe(true);
		expect(walker.atLineEnd).toBe(false);
		expect(walker.atLineStart).toBe(true);

		expect(walker.previous).toBe('\n');
		expect(walker.current).toBe('B');
		expect(walker.next).toBe('r');
	});

	it("test Windows new line", () =>
	{
		const s = "Line\r\nBreak";
		const walker = new StringWalker(s);

		walker.forward(3);

		expect(walker.hasMore()).toBe(true);
		expect(walker.atLineEnd).toBe(false);
		expect(walker.atLineStart).toBe(false);

		expect(walker.previous).toBe('n');
		expect(walker.current).toBe('e');
		expect(walker.next).toBe('\r');

		expect(walker.match('e', 'e')).toBe(false);
		expect(walker.match("en")).toBe(false);

		walker.forward();

		expect(walker.hasMore()).toBe(true);
		expect(walker.atLineEnd).toBe(true);
		expect(walker.atLineStart).toBe(false);

		expect(walker.previous).toBe('e');
		expect(walker.current).toBe('\r');
		expect(walker.next).toBe('B');

		walker.forward();

		expect(walker.hasMore()).toBe(true);
		expect(walker.atLineEnd).toBe(false);
		expect(walker.atLineStart).toBe(true);

		expect(walker.previous).toBe('\r');
		expect(walker.current).toBe('B');
		expect(walker.next).toBe('r');
	});

	it("test start with new line", () =>
	{
		const s = "\nLine Break";
		const walker = new StringWalker(s);

		expect(walker.hasMore()).toBe(true);
		expect(walker.atLineEnd).toBe(true);
		expect(walker.atLineStart).toBe(true);

		walker.forward();

		expect(walker.hasMore()).toBe(true);
		expect(walker.atLineEnd).toBe(false);
		expect(walker.atLineStart).toBe(true);
	});

	it("test skip line", () =>
	{
		const s = "// Comment\nand new line";
		const walker = new StringWalker(s);

		expect(walker.match("//")).toBe(true);

		walker.goToNextLine();

		expect(walker.hasMore()).toBe(true);
		expect(walker.atLineEnd).toBe(false);
		expect(walker.atLineStart).toBe(true);
		expect(walker.current).toBe('a');

		walker.forward();

		expect(walker.hasMore()).toBe(true);
		expect(walker.atLineEnd).toBe(false);
		expect(walker.atLineStart).toBe(false);
		expect(walker.current).toBe('n');

		walker.goToNextLine();

		expect(walker.hasMore()).toBe(false);
		expect(walker.atLineEnd).toBe(true);
		expect(walker.atLineStart).toBe(false);
	});

	it("test skip spaces", () =>
	{
		const s = "  // Comment\n        test()";
		const walker = new StringWalker(s);

		expect(walker.match(' ')).toBe(true);

		expect(walker.skipSpaces()).toBe(2);

		expect(walker.match("//")).toBe(true);

		walker.goToNextLine();

		expect(walker.match(' ')).toBe(true);

		expect(walker.skipSpaces()).toBe(8);

		expect(walker.match("test")).toBe(true);
	});
});

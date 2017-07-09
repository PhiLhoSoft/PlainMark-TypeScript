import { Dummy } from "./dummy";

describe("Test suite", () =>
{
    it("should be true", () =>
    {
        expect(true).toBe(true); // Shouldn't fail...
        var dummy = new Dummy("True");
        expect(dummy.name).toBe("True");
    });
});

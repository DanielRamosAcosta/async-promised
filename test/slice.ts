import slice from "../lib/internal/slice";

describe("slice", () => {
  it("should slice arrays", () => {
    const arr = ["foo", "bar", "baz"];
    const result = slice(arr, 2);
    expect(arr).toEqual(["foo", "bar", "baz"]);
    expect(result).toEqual(["baz"]);
  });

  it("should handle ArrayLike objects", () => {
    const args = { 0: "foo", 1: "bar", 2: "baz", length: 3 };
    const result = slice(args, 1);
    expect(result).toBeInstanceOf(Array);
    expect(result).toEqual(["bar", "baz"]);
  });

  it("should handle arguments", () => {
    const foo = (...args) => slice(args, 1);
    const result = foo(...["foo", "bar", "baz"]);
    expect(result).toBeInstanceOf(Array);
    expect(result).toEqual(["bar", "baz"]);
  });

  it("should return an empty array on an invalid start", () => {
    const result = slice(["foo", "bar", "baz"], 10);
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(0);
  });
});

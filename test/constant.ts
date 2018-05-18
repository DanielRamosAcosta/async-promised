import * as async from "../lib";

describe("constant", () => {
  it("basic usage", () => {
    const f = async.constant(42, 1, 2, 3);

    return f().then(([value, a, b, c]) => {
      expect(value).toEqual(42);
      expect(a).toEqual(1);
      expect(b).toEqual(2);
      expect(c).toEqual(3);
    });
  });

  it("called with multiple arguments", () => {
    const f = async.constant(42, 1, 2, 3);

    return f("argument to ignore", "another argument").then(([value, a]) => {
      expect(value).toEqual(42);
      expect(a).toEqual(1);
    });
  });
});

import * as assert from "assert";
import * as async from "async";

/**
 * This tests doesn't exist in caloan/async
 */

describe("reflect", () => {
  it("without error", done => {
    const reflectedFn = async.reflect(cb => {
      cb(null, "ok");
    });

    reflectedFn((err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual({ value: "ok" });
      done();
    });
  });

  it("with error", done => {
    const reflectedFn = async.reflect(cb => {
      cb(new Error("fail"));
    });

    reflectedFn((err, result) => {
      expect(err).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toEqual("fail");
      done();
    });
  });
});

import * as assert from "assert";
import * as async from "../lib";

/**
 * This tests doesn't exist in caloan/async
 */

describe("reflect", () => {
  it("without error", () => {
    const reflectedFn = async.reflect(async () => {
      return "ok";
    });

    return reflectedFn().then(result => {
      expect(result).toEqual({ value: "ok" });
    });
  });

  it("with error", () => {
    const reflectedFn = async.reflect(async () => {
      throw new Error("fail");
    });

    return reflectedFn().then(result => {
      if ("error" in result) {
        expect(result.error).toEqual(new Error("fail"));
      } else {
        assert(false, "Expected result to have key 'error'");
      }
    });
  });

  it("multiple args", () => {
    const reflectedFn = async.reflect(async (arg1: string, arg2: number) => {
      return `${arg1} = ${arg2}`;
    });

    return reflectedFn("1 + 1", 2).then(result => {
      expect(result).toEqual({ value: "1 + 1 = 2" });
    });
  });
});

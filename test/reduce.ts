import * as assert from "assert";
import * as async from "../lib";
import reduce from "../lib/reduce";
import sleep from "./support/sleep";

describe("reduce", () => {
  it("reduce", () => {
    const callOrder = [];
    return async
      .reduce([1, 2, 3], 0, async (a, x) => {
        callOrder.push(x);
        return a + x;
      })
      .then(result => {
        expect(result).toEqual(6);
        expect(callOrder).toEqual([1, 2, 3]);
      });
  });

  it("reduce async with non-reference memo", () => {
    return async
      .reduce([1, 3, 2], 0, async (a, x) => {
        await sleep(Math.random() * 100);
        return a + x;
      })
      .then(result => {
        expect(result).toEqual(6);
      });
  });

  it("reduce error", () => {
    return async
      .reduce([1, 2, 3], 0, async (a, x) => {
        throw new Error("error");
      })
      .catch(err => err)
      .then(err => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual("error");
      });
  });

  it("inject alias", done => {
    expect(async.inject).toEqual(async.reduce);
    done();
  });

  it("foldl alias", done => {
    expect(async.foldl).toEqual(async.reduce);
    done();
  });

  it("reduceRight", () => {
    const callOrder = [];
    const a = [1, 2, 3];
    return async
      .reduceRight(a, 0, async (a, x) => {
        callOrder.push(x);
        return a + x;
      })
      .then(result => {
        expect(result).toEqual(6);
        expect(callOrder).toEqual([3, 2, 1]);
        expect(a).toEqual([1, 2, 3]);
      });
  });

  it("foldr alias", done => {
    expect(async.foldr).toEqual(async.reduceRight);
    done();
  });
});

import assert from "assert";
import * as async from "../lib";
import sleep from "./support/sleep";

describe("seq", () => {
  it("seq", () => {
    const add2 = async (n: number) => {
      expect(n).toEqual(3);
      await sleep(50);
      return n + 2;
    };
    const mul3 = async (n: number) => {
      expect(n).toEqual(5);
      await sleep(15);
      return n * 3;
    };
    const add1 = async (n: number) => {
      expect(n).toEqual(15);
      await sleep(100);
      return n + 1;
    };

    const add2mul3add1 = async.seq(add2, mul3, add1);

    return add2mul3add1(3).then(result => {
      expect(result).toEqual(16);
    });
  });

  it("seq error", () => {
    const testerr = new Error("test");

    const add2 = async (n: number) => {
      expect(n).toEqual(3);
      await sleep(50);
      return n + 2;
    };
    const mul3 = async (n: number) => {
      expect(n).toEqual(5);
      await sleep(15);
      throw testerr;
    };
    const add1 = async (n: number) => {
      assert(false, "add1 should not get called");
      await sleep(100);
      return n + 1;
    };
    const add2mul3add1 = async.seq(add2, mul3, add1);
    return add2mul3add1(3)
      .catch(err => err)
      .then(err => {
        expect(err).toEqual(testerr);
      });
  });

  it("seq binding", () => {
    const testcontext = { name: "foo" };

    const add2 = async function(this: typeof testcontext, n: number) {
      expect(this).toEqual(testcontext);
      await sleep(50);
      return n + 2;
    };
    const mul3 = async function(this: typeof testcontext, n: number) {
      expect(this).toEqual(testcontext);
      await sleep(15);
      return n * 3;
    };

    const add2mul3 = async.seq(add2, mul3);
    return add2mul3.call(testcontext, 3).then(result => {
      expect(result).toEqual(15);
    });
  });

  // Removed 'seq without callback', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/mocha_test/seq.js#L91
});

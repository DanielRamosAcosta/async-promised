import * as assert from "assert";
import * as async from "../lib";
import sleep from "./support/sleep";

describe("memoize", () => {
  it("memoize", () => {
    const callOrder = [];

    const fn = async (arg1: number, arg2: number): Promise<number> => {
      await async.setImmediate();
      callOrder.push(["fn", arg1, arg2]);
      return arg1 + arg2;
    };

    const fn2 = async.memoize(fn);

    return Promise.resolve()
      .then(() => fn2(1, 2))
      .then(result => {
        expect(result).toEqual(3);
      })
      .then(() => fn2(1, 2))
      .then(result => {
        expect(result).toEqual(3);
      })
      .then(() => fn2(2, 2))
      .then(result => {
        expect(result).toEqual(4);
      });
  });

  it("maintains asynchrony", () => {
    const callOrder = [];

    const fn = async (arg1: number, arg2: number): Promise<number> => {
      callOrder.push(["fn", arg1, arg2]);
      await async.setImmediate();
      callOrder.push(["cb", arg1, arg2]);
      return arg1 + arg2;
    };

    const fn2 = async.memoize(fn);

    const p1 = fn2(1, 2).then(resultP1 => {
      expect(resultP1).toEqual(3);

      const p2 = fn2(1, 2).then(resultP2 => {
        expect(resultP2).toEqual(3);
        const p3 = async.nextTick().then(() => {
          const asyncCallOrder = [
            ["fn", 1, 2], // initial async call
            "tick1", // async caller
            ["cb", 1, 2], // async callback
            //  ['fn',1,2], // memoized // memoized async body
            "tick2", // handler for first async call
            //  ['cb',1,2], // memoized // memoized async response body
            "tick3" // handler for memoized async call
          ];
          expect(callOrder).toEqual(asyncCallOrder);
        });
        callOrder.push("tick3");
        return p3;
      });
      callOrder.push("tick2");
      return p2;
    });
    callOrder.push("tick1");
    return p1;
  });

  it("unmemoize", () => {
    const callOrder = [];

    const fn = async (arg1: number, arg2: number): Promise<number> => {
      await async.setImmediate();
      callOrder.push(["fn", arg1, arg2]);
      return arg1 + arg2;
    };

    const fn2 = async.memoize(fn);
    const fn3 = async.unmemoize(fn2);

    return Promise.resolve()
      .then(() => fn3(1, 2))
      .then(result => {
        expect(result).toEqual(3);
      })
      .then(() => fn3(1, 2))
      .then(result => {
        expect(result).toEqual(3);
      })
      .then(() => fn3(2, 2))
      .then(result => {
        expect(result).toEqual(4);
        expect(callOrder).toEqual([["fn", 1, 2], ["fn", 1, 2], ["fn", 2, 2]]);
      });
  });

  it("unmemoize a not memoized function", () => {
    const fn = async (arg1, arg2) => {
      return arg1 + arg2;
    };

    const fn2 = async.unmemoize(fn);

    return fn2(1, 2).then(result => {
      expect(result).toEqual(3);
    });
  });

  it("error", () => {
    const fn = async (arg1: number, arg2: number): Promise<number> => {
      throw new Error("fail");
    };
    const mfn = async.memoize(fn);

    return mfn(1, 2)
      .catch(err => err)
      .then(err => {
        expect(err).toEqual(new Error("fail"));
      });
  });

  it("multiple calls", async () => {
    const fn = async (arg1: number, arg2: number): Promise<number> => {
      assert(true);
      await sleep(10);
      return arg1;
    };
    const fn2 = async.memoize(fn);

    await fn2(1, 2).then(result => {
      expect(result).toEqual(1);
    });

    await fn2(1, 2).then(result => {
      expect(result).toEqual(1);
    });
  });

  it("custom hash function", () => {
    const testerr = new Error("test");

    const fn = async (arg1: number, arg2: number) => {
      return arg1 + arg2;
    };

    const fn2 = async.memoize(fn, () => "custom hash");

    return Promise.resolve()
      .then(() => fn2(1, 2))
      .then(result => {
        expect(result).toEqual(3);
      })
      .then(() => fn2(2, 2))
      .then(result => {
        expect(result).toEqual(3);
      });
  });

  it("manually added memo value", () => {
    const fn = async.memoize(async (s: string) => {
      throw new Error("Function should never be called");
    });
    fn.memo.foo = ["bar"];
    return fn("foo")
      .catch(err => err)
      .then(err => {
        expect(err).toEqual("bar");
      });
  });

  it("avoid constructor key return undefined", () => {
    const fn = async.memoize(
      async (name: string): Promise<string> => {
        await sleep(100);
        return name;
      }
    );

    return fn("constructor").then(results => {
      expect(results).toEqual("constructor");
    });
  });

  it("avoid __proto__ key return undefined", () => {
    // Skip test if there is a Object.create bug (node 0.10 and some Chrome 30x versions)
    const x = Object.create(null);
    /* jshint proto: true */
    x.__proto__ = "foo";
    if (x.__proto__ !== "foo") {
      return;
    }

    const fn = async.memoize(async (name: string) => {
      await sleep(100);
      return name;
    });

    return fn("__proto__").then(results => {
      expect(results).toEqual("__proto__");
    });
  });

  it("allow hasOwnProperty as key", () => {
    const fn = async.memoize(async (name: string) => {
      await sleep(100);
      return name;
    });

    return fn("hasOwnProperty").then(results => {
      expect(results).toEqual("hasOwnProperty");
    });
  });
});

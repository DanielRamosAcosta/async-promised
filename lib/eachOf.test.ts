import assert from "assert";
import * as async from ".";
import sleep from "./support/sleep";

describe("eachOf", () => {
  const forEachOfIterateeAsync = (args: Array<number | string>) => async (
    value: any,
    key: any
  ) => {
    await sleep(value * 25);
    args.push(key, value);
  };

  it("eachOf alias", () => {
    expect(async.eachOf).toEqual(async.forEachOf);
  });

  it("eachOfLimit alias", () => {
    expect(async.eachOfLimit).toEqual(async.forEachOfLimit);
  });

  it("eachOfSeries alias", () => {
    expect(async.eachOfSeries).toEqual(async.forEachOfSeries);
  });

  it("forEachOf", () => {
    const args: Array<number | string> = [];
    return async
      .forEachOf({ a: 1, b: 2 }, forEachOfIterateeAsync(args))
      .then(() => {
        expect(args).toEqual(["a", 1, "b", 2]);
      });
  });

  it("forEachOf - instant resolver", () => {
    const args: Array<number | string> = [];

    return async
      .forEachOf({ a: 1, b: 2 }, async (value, key) => {
        args.push(key, value);
      })
      .then(() => {
        // ensures done callback isn't called before all items iterated
        expect(args).toEqual(["a", 1, "b", 2]);
      });
  });

  it("forEachOf empty object", () => {
    return async
      .forEachOf({}, async () => {
        assert(false, "iteratee should not be called");
      })
      .then(() => {
        assert(true, "should call callback");
      });
  });

  it("forEachOf empty array", () => {
    return async
      .forEachOf([], async () => {
        assert(false, "iteratee should not be called");
      })
      .then(() => {
        assert(true, "should call callback");
      });
  });

  it("forEachOf error", () => {
    return async
      .forEachOf({ a: 1, b: 2 }, async () => {
        throw new Error("error");
      })
      .catch(err => err)
      .then(err => {
        expect(err).toEqual(new Error("error"));
      });
  });

  // Removed 'forEachOf no callback', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/test/eachOf.js#L113

  it("forEachOf with array", () => {
    const args: Array<number | string> = [];
    return async
      .forEachOf<string>(["a", "b"], forEachOfIterateeAsync(args))
      .then(() => {
        expect(args).toEqual([0, "a", 1, "b"]);
      });
  });

  it("forEachOf with Set (iterators)", () => {
    if (typeof Set !== "function") {
      return;
    }

    const args: Array<number | string> = [];
    const set = new Set();
    set.add("a");
    set.add("b");

    return async.forEachOf(set, forEachOfIterateeAsync(args)).then(() => {
      expect(args).toEqual([0, "a", 1, "b"]);
    });
  });

  it("forEachOf with Map (iterators)", () => {
    if (typeof Map !== "function") {
      return;
    }

    const args: Array<number | string> = [];
    const map = new Map();
    map.set(1, "a");
    map.set(2, "b");

    return async.forEachOf(map, forEachOfIterateeAsync(args)).then(() => {
      expect(args).toEqual([0, [1, "a"], 1, [2, "b"]]);
    });
  });

  it("forEachOfSeries", () => {
    const args: Array<number | string> = [];
    return async
      .forEachOfSeries({ a: 1, b: 2 }, forEachOfIterateeAsync(args))
      .then(() => {
        expect(args).toEqual(["a", 1, "b", 2]);
      });
  });

  it("forEachOfSeries empty object", () => {
    return async
      .forEachOfSeries({}, async () => {
        assert(false, "iteratee should not be called");
      })
      .then(() => {
        assert(true, "should call callback");
      });
  });

  it("forEachOfSeries error", () => {
    const callOrder: any[] = [];

    return async
      .forEachOfSeries({ a: 1, b: 2 }, async (value, key) => {
        callOrder.push(value, key);
        throw new Error("error");
      })
      .catch(err => err)
      .then(err => {
        expect(callOrder).toEqual([1, "a"]);
        expect(err).toEqual(new Error("error"));
      });
  });

  // Removed 'forEachOfSeries no callback', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/test/eachOf.js#L213

  it("forEachOfSeries with array", () => {
    const args: Array<number | string> = [];

    return async
      .forEachOfSeries(["a", "b"], forEachOfIterateeAsync(args))
      .then(() => {
        expect(args).toEqual([0, "a", 1, "b"]);
      });
  });

  it("forEachOfSeries with Set (iterators)", () => {
    if (typeof Set !== "function") {
      return;
    }

    const args: Array<number | string> = [];
    const set = new Set();
    set.add("a");
    set.add("b");
    return async.forEachOfSeries(set, forEachOfIterateeAsync(args)).then(() => {
      expect(args).toEqual([0, "a", 1, "b"]);
    });
  });

  it("forEachOfSeries with Map (iterators)", () => {
    if (typeof Map !== "function") {
      return;
    }

    const args: any[] = [];
    const map = new Map();
    map.set(1, "a");
    map.set(2, "b");
    return async.forEachOfSeries(map, forEachOfIterateeAsync(args)).then(() => {
      expect(args).toEqual([0, [1, "a"], 1, [2, "b"]]);
    });
  });

  it("forEachOfLimit", () => {
    const args: Array<number | string> = [];
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    return async
      .forEachOfLimit(obj, 2, async (value, key) => {
        await sleep(value * 5);
        args.push(value, key);
      })
      .then(() => {
        expect(args).toEqual([1, "a", 2, "b", 3, "c", 4, "d"]);
      });
  });

  it("forEachOfLimit empty object", () => {
    return async
      .forEachOfLimit({}, 2, async () => {
        assert(false, "iteratee should not be called");
      })
      .then(() => {
        assert(true, "should call callback");
      });
  });

  it("forEachOfLimit limit exceeds size", () => {
    const args: Array<number | string> = [];
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    return async
      .forEachOfLimit(obj, 10, forEachOfIterateeAsync(args))
      .then(() => {
        expect(args).toEqual(["a", 1, "b", 2, "c", 3, "d", 4, "e", 5]);
      });
  });

  it("forEachOfLimit limit equal size", () => {
    const args: Array<number | string> = [];
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    return async
      .forEachOfLimit(obj, 5, forEachOfIterateeAsync(args))
      .then(err => {
        expect(args).toEqual(["a", 1, "b", 2, "c", 3, "d", 4, "e", 5]);
      });
  });

  it("forEachOfLimit zero limit", () => {
    return async
      .forEachOfLimit({ a: 1, b: 2 }, 0, async () => {
        assert(false, "iteratee should not be called");
      })
      .then(() => {
        assert(true, "should call callback");
      });
  });

  it("forEachOfLimit no limit", () => {
    let count = 0;
    return async
      .forEachOfLimit(Array.from({ length: 100 }), Infinity, async () => {
        count++;
      })
      .then(() => {
        expect(count).toEqual(100);
      });
  });

  it("forEachOfLimit error", () => {
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    const callOrder: Array<number | string> = [];

    return async
      .forEachOfLimit(obj, 3, async (value, key) => {
        if (value === 2) {
          throw new Error("error");
        }
        callOrder.push(value, key);
        await sleep(10);
      })
      .catch(err => err)
      .then(err => {
        expect(callOrder).toEqual([1, "a", 3, "c"]);
        expect(err).toEqual(new Error("error"));
      });
  });

  // Removed 'forEachOfLimit no callback', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/test/eachOf.js#L353

  it("forEachOfLimit synchronous", () => {
    const args: Array<number | string> = [];
    const obj = { a: 1, b: 2 };
    return async
      .forEachOfLimit(obj, 5, forEachOfIterateeAsync(args))
      .then(() => {
        expect(args).toEqual(["a", 1, "b", 2]);
      });
  });

  it("forEachOfLimit with array", () => {
    const args: Array<number | string> = [];
    const arr = ["a", "b"];

    return async
      .forEachOfLimit(arr, 1, forEachOfIterateeAsync(args))
      .then(() => {
        expect(args).toEqual([0, "a", 1, "b"]);
      });
  });

  it("forEachOfLimit with Set (iterators)", () => {
    if (typeof Set !== "function") {
      return;
    }

    const args: Array<number | string> = [];
    const set = new Set();
    set.add("a");
    set.add("b");
    return async
      .forEachOfLimit(set, 1, forEachOfIterateeAsync(args))
      .then(() => {
        expect(args).toEqual([0, "a", 1, "b"]);
      });
  });

  it("forEachOfLimit with Map (iterators)", () => {
    if (typeof Map !== "function") {
      return;
    }

    const args: Array<number | string> = [];
    const map = new Map();
    map.set(1, "a");
    map.set(2, "b");

    return async
      .forEachOfLimit(map, 1, forEachOfIterateeAsync(args))
      .then(() => {
        expect(args).toEqual([0, [1, "a"], 1, [2, "b"]]);
      });
  });
});

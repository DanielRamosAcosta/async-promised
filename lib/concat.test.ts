import assert from "assert";
import * as async from ".";
import sleep from "./support/sleep";

describe("concat", () => {
  async function concatIteratee(callOrder, val, next) {
    await sleep(val * 25);
    callOrder.push(val);
    next(null, [val, val + 1]);
    return [val, val + 1];
  }

  const createConcatIteratee = callOrder => async val => {
    await sleep(val * 25);
    callOrder.push(val);
    return [val, val + 1];
  };

  describe("concat", () => {
    it("basics", () => {
      const callOrder = [];
      const concatIterateee = createConcatIteratee(callOrder);
      return async.concat([1, 3, 2], concatIterateee).then(result => {
        expect(result).toEqual([1, 2, 3, 4, 2, 3]);
      });
    });

    it("error", () => {
      return async
        .concat([1, 3, 2], async val => {
          if (val === 3) {
            throw new Error("fail");
          }
          return [val, val + 1];
        })
        .catch(err => err)
        .then(err => {
          expect(err.message).toEqual("fail");
        });
    });

    it("original untouched", () => {
      const arr = ["foo", "bar", "baz"];
      return async
        .concat(arr, async val => {
          return [val, val];
        })
        .then(result => {
          expect(arr).toEqual(["foo", "bar", "baz"]);
          expect(result).toEqual(["foo", "foo", "bar", "bar", "baz", "baz"]);
        });
    });

    it("empty results", () => {
      const arr = ["foo", "bar", "baz"];
      return async
        .concat(arr, async val => {})
        .then(result => {
          expect(result).toBeInstanceOf(Array);
          expect(result).toHaveLength(0);
        });
    });

    it("empty arrays", () => {
      const arr = ["foo", "bar", "baz"];

      return async
        .concat(arr, async val => {
          return [];
        })
        .then(result => {
          expect(result).toBeInstanceOf(Array);
          expect(result).toHaveLength(0);
        });
    });

    it("handles empty object", () => {
      return async
        .concat({}, async val => {
          assert(false, "iteratee should not be called");
        })
        .then(result => {
          expect(result).toBeInstanceOf(Array);
          expect(result).toHaveLength(0);
        });
    });

    // Removed 'variadic', doesn't make sense with promises. Promises only have
    // one parameter for resolution.
    // https://github.com/caolan/async/blob/master/mocha_test/concat.js#L83

    it("flattens arrays", () => {
      const arr = ["foo", "bar"];

      return async
        .concat(arr, async val => {
          return [val, [val]];
        })
        .then(result => {
          expect(result).toEqual(["foo", ["foo"], "bar", ["bar"]]);
        });
    });

    // TODO: Fix falsy checks. Is there any what to check when a promise
    // was fulfilled with a falsy value or it had zero arguments?
    xit("handles fasly values", () => {
      const falsy = [null, undefined, 0, ""];

      return async
        .concat(falsy, async val => {
          return val;
        })
        .then(result => {
          expect(result).toEqual(falsy);
        });
    });

    it("handles objects", () => {
      const obj = { a: "foo", b: "bar", c: "baz" };
      return async
        .concat(obj, async val => val)
        .then(result => {
          expect(result).toEqual(["foo", "bar", "baz"]);
        });
    });

    // Removed 'main callback optional', doesn't make sense with promises.
    // https://github.com/caolan/async/blob/master/mocha_test/concat.js#L127

    // Removed 'iteratee callback is only called once', doesn't make sense with
    // promises.
    // https://github.com/caolan/async/blob/master/mocha_test/concat.js#L143

    it("preserves order", () => {
      const arr = [30, 15];

      return async
        .concat(arr, async x => {
          await sleep(x);
          return x;
        })
        .then(result => {
          expect(result).toEqual(arr);
        });
    });

    it("handles Map", () => {
      if (typeof Map !== "function") {
        return;
      }

      const map = new Map([
        ["a", "b"],
        ["b", "c"],
        ["c", "d"]
      ]);

      return async
        .concat(map, async val => {
          return val;
        })
        .then(result => {
          expect(result).toEqual(["a", "b", "b", "c", "c", "d"]);
        });
    });

    it("handles sparse results", () => {
      const arr = [1, 2, 3, 4];

      return async
        .concat(arr, async val => {
          if (val === 1 || val === 3) {
            return val + 1;
          } else if (val === 2) {
            await sleep(10);
            return val + 1;
          } else {
            throw new Error("error");
          }
        })
        .catch(err => err)
        .then(err => {
          expect(err).toBeInstanceOf(Error);
        });
    });
  });

  describe("concatLimit", () => {
    it("basics", () => {
      const arr = ["foo", "bar", "baz"];
      let running = 0;
      const concurrency = { foo: 2, bar: 2, baz: 1 };

      return async
        .concatLimit(arr, 2, async val => {
          running++;
          if (val === "foo") {
            await sleep(0);
          } else {
            await sleep(5);
          }
          expect(concurrency[val]).toEqual(running);
          running--;
          return [val, val];
        })
        .then(result => {
          expect(running).toEqual(0);
          expect(result).toEqual(["foo", "foo", "bar", "bar", "baz", "baz"]);
        });
    });

    it("error", () => {
      const arr = ["foo", "bar", "baz"];
      return async
        .concatLimit(arr, 1, async val => {
          if (val === "bar") {
            throw new Error("fail");
          }
          return val;
        })
        .catch(err => err)
        .then(err => {
          expect(err).toBeInstanceOf(Error);
        });
    });

    it("handles objects", () => {
      return async
        .concatLimit({ foo: 1, bar: 2, baz: 3 }, 2, async val => {
          return val + 1;
        })
        .then(result => {
          expect(result).toEqual([2, 3, 4]);
        });
    });

    it("handles empty object", () => {
      return async
        .concatLimit({}, 2, async val => {
          assert(false, "iteratee should not be called");
        })
        .then(result => {
          expect(result).toBeInstanceOf(Array);
          expect(result).toHaveLength(0);
        });
    });

    it("handles undefined", () => {
      return async
        .concatLimit(undefined, 2, async val => {
          assert(false, "iteratee should not be called");
        })
        .then(result => {
          expect(result).toBeInstanceOf(Array);
          expect(result).toHaveLength(0);
        });
    });

    it("limit exceeds size", () => {
      const callOrder = [];
      const concatIterateee = createConcatIteratee(callOrder);

      return async
        .concatLimit([3, 2, 2, 1], 10, concatIterateee)
        .then(result => {
          expect(result).toEqual([3, 4, 2, 3, 2, 3, 1, 2]);
          expect(callOrder).toEqual([1, 2, 2, 3]);
        });
    });

    it("limit equal size", () => {
      const callOrder = [];
      const concatIterateee = createConcatIteratee(callOrder);
      return async
        .concatLimit([3, 2, 2, 1], 4, concatIterateee)
        .then(result => {
          expect(result).toEqual([3, 4, 2, 3, 2, 3, 1, 2]);
          expect(callOrder).toEqual([1, 2, 2, 3]);
        });
    });

    it("zero limit", () => {
      return async
        .concatLimit([3, 2, 2, 1], 0, async val => {
          assert(false, "iteratee should not be called");
        })
        .then(result => {
          expect(result).toBeInstanceOf(Array);
          expect(result).toHaveLength(0);
        });
    });

    it("does not continue replenishing after error", () => {
      let started = 0;
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const limit = 3;
      const step = 0;
      const maxSteps = arr.length;

      return async
        .concatLimit(arr, limit, async val => {
          started++;
          if (started === 3) {
            throw new Error("fail");
          }
        })
        .catch(err => err)
        .then(err => {
          expect(err).toBeInstanceOf(Error);
        });
    });
  });

  describe("concatSeries", () => {
    it("basics", () => {
      const callOrder = [];
      let running = 0;
      const iteratee = async x => {
        running++;
        await sleep(x * 25);
        expect(running).toEqual(1);
        running--;
        callOrder.push(x);
        const r = [];
        while (x > 0) {
          r.push(x);
          x--;
        }
        return r;
      };
      return async.concatSeries([1, 3, 2], iteratee).then(results => {
        expect(results).toEqual([1, 3, 2, 1, 2, 1]);
        expect(running).toEqual(0);
        expect(callOrder).toEqual([1, 3, 2]);
      });
    });

    it("error", () => {
      return async
        .concatSeries(["foo", "bar", "baz"], async val => {
          if (val === "bar") {
            throw new Error("fail");
          }
          return [val, val];
        })
        .catch(err => err)
        .then(err => {
          expect(err).toBeInstanceOf(Error);
        });
    });

    it("handles objects", () => {
      return async
        .concatSeries({ foo: 1, bar: 2, baz: 3 }, async val => [val, val + 1])
        .then(result => {
          expect(result).toEqual([1, 2, 2, 3, 3, 4]);
        });
    });

    it("handles empty object", () => {
      return async
        .concatSeries({}, async val => {
          assert(false, "iteratee should not be called");
        })
        .then(result => {
          expect(result).toBeInstanceOf(Array);
          expect(result).toHaveLength(0);
        });
    });

    it("handles undefined", () => {
      return async
        .concatSeries(undefined, async val => {
          assert(false, "iteratee should not be called");
        })
        .then(result => {
          expect(result).toBeInstanceOf(Array);
          expect(result).toHaveLength(0);
        });
    });
  });
});

import assert from "assert";
import * as pasync from "../lib";
import sleep from "./support/sleep";

describe("groupBy", () => {
  const groupByIterateeAsync = (callOrder: number[]) => async (val: number) => {
    await sleep(val * 25);
    callOrder.push(val);
    return val + 1;
  };

  describe("groupBy", () => {
    it("basics", () => {
      const callOrder: number[] = [];
      return pasync
        .groupBy([1, 3, 2], groupByIterateeAsync(callOrder))
        .then(result => {
          expect(callOrder).toEqual([1, 2, 3]);
          expect(result).toEqual({ 2: [1], 3: [2], 4: [3] });
        });
    });

    it("error", () => {
      return pasync
        .groupBy([1, 3, 2], async val => {
          if (val === 3) {
            throw new Error("fail");
          }
          return val + 1;
        })
        .catch(err => err)
        .then(err => {
          expect(err).toEqual(new Error("fail"));
        });
    });

    it("original untouched", () => {
      const obj = { a: "b", b: "c", c: "d" };
      return pasync
        .groupBy(obj, async val => {
          return val;
        })
        .then(result => {
          expect(obj).toEqual({ a: "b", b: "c", c: "d" });
          expect(result).toEqual({ b: ["b"], c: ["c"], d: ["d"] });
        });
    });

    it("handles multiple matches", () => {
      const callOrder: number[] = [];
      return pasync
        .groupBy([1, 3, 2, 2], groupByIterateeAsync(callOrder))
        .then(result => {
          expect(callOrder).toEqual([1, 2, 2, 3]);
          expect(result).toEqual({ 2: [1], 3: [2, 2], 4: [3] });
        });
    });

    it("handles objects", () => {
      const obj = { a: "b", b: "c", c: "d" };
      const concurrency = { b: 3, c: 2, d: 1 };
      let running = 0;
      return pasync
        .groupBy(obj, async val => {
          running++;
          await sleep(5);
          expect(running).toEqual(concurrency[val]);
          running--;
          return val;
        })
        .then(result => {
          expect(running).toEqual(0);
          expect(result).toEqual({ b: ["b"], c: ["c"], d: ["d"] });
        });
    });

    it("handles undefined", () => {
      return pasync
        .groupBy(undefined, async () => {
          assert(false, "iteratee should not be called");
        })
        .then(result => {
          expect(result).toEqual({});
        });
    });

    it("handles empty object", () => {
      return pasync
        .groupBy({}, async () => {
          assert(false, "iteratee should not be called");
          return "foo";
        })
        .then(result => {
          expect(result).toEqual({});
        });
    });

    // Removed 'main callback optional', doesn't make sense with promises
    // https://github.com/caolan/async/blob/master/test/groupBy.js#L119

    // Removed 'iteratee callback is only called once', doesn't make sense with promises
    // https://github.com/caolan/async/blob/master/test/groupBy.js#L135

    it("handles Map", () => {
      if (typeof Map !== "function") {
        return;
      }

      const map = new Map([
        ["a", "a"],
        ["b", "b"],
        ["c", "a"]
      ]);

      return pasync
        .groupBy(map, async val => {
          return val[1] + 1;
        })
        .then(result => {
          expect(result).toEqual({
            a1: [
              ["a", "a"],
              ["c", "a"]
            ],
            b1: [["b", "b"]]
          });
        });
    });

    it("handles sparse results", () => {
      const arr = [1, 2, 3];
      return pasync
        .groupBy(arr, async val => {
          if (val === 1) {
            return val + 1;
          } else if (val === 2) {
            await sleep(0);
            return val + 1;
          } else {
            await sleep(10);
            return val + 1;
          }
        })
        .then(err => {
          expect(err).toEqual({ 2: [1], 3: [2], 4: [3] });
        });
    });

    it("handles sparse results", () => {
      const arr = [1, 2, 3];
      return pasync
        .groupBy(arr, async val => {
          if (val === 1) {
            return val + 1;
          } else if (val === 2) {
            await sleep(0);
            return val + 1;
          } else {
            throw new Error("error");
          }
        })
        .catch(err => err)
        .then(err => {
          expect(err).toEqual(new Error("error"));
        });
    });
  });

  describe("groupByLimit", () => {
    const obj = { a: "b", b: "c", c: "d" };

    it("basics", () => {
      let running = 0;
      const concurrency = { b: 2, c: 2, d: 1 };

      return pasync
        .groupByLimit(obj, 2, async val => {
          running++;
          await sleep(500);
          expect(running).toEqual(concurrency[val]);
          running--;
          return val;
        })
        .then(result => {
          expect(running).toEqual(0);
          expect(result).toEqual({ b: ["b"], c: ["c"], d: ["d"] });
        });
    });

    it("error", () => {
      return pasync
        .groupByLimit(obj, 1, async val => {
          if (val === "c") {
            throw new Error("fail");
          }
          return val;
        })
        .catch(err => err)
        .then(err => {
          expect(err).toEqual(new Error("fail"));
        });
    });

    it("handles empty object", () => {
      return pasync
        .groupByLimit({}, 2, async () => {
          assert(false, "iteratee should not be called");
          return 0;
        })
        .then(result => {
          expect(result).toEqual({});
        });
    });

    it("handles undefined", () => {
      return pasync
        .groupByLimit(undefined, 2, async () => {
          assert(false, "iteratee should not be called");
        })
        .then(result => {
          expect(result).toEqual({});
        });
    });

    it("limit exceeds size", () => {
      const callOrder: number[] = [];

      return pasync
        .groupByLimit([3, 2, 2, 1], 10, groupByIterateeAsync(callOrder))
        .then(result => {
          expect(result).toEqual({ 2: [1], 3: [2, 2], 4: [3] });
          expect(callOrder).toEqual([1, 2, 2, 3]);
        });
    });

    it("limit equal size", () => {
      const callOrder: number[] = [];

      return pasync
        .groupByLimit([3, 2, 2, 1], 4, groupByIterateeAsync(callOrder))
        .then(result => {
          expect(result).toEqual({ 2: [1], 3: [2, 2], 4: [3] });
          expect(callOrder).toEqual([1, 2, 2, 3]);
        });
    });

    it("zero limit", () => {
      return pasync
        .groupByLimit([3, 2, 2, 1], 0, async val => {
          assert(false, "iteratee should not be called");
          return 0;
        })
        .then(result => {
          expect(result).toEqual({});
        });
    });

    it("does not continue replenishing after error", () => {
      let started = 0;
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const delay = 10;
      const limit = 3;
      const maxTime = 10 * arr.length;

      return pasync
        .groupByLimit(arr, limit, async () => {
          started++;
          if (started === 3) {
            throw new Error("fail");
          }

          await sleep(delay);
        })
        .catch(err => err)
        .then(async err => {
          await sleep(100);
          expect(err).toEqual(new Error("fail"));
          expect(started).toEqual(3);
        });
    });
  });

  describe("groupBySeries", () => {
    const obj = { a: "b", b: "c", c: "d" };
    it("basics", () => {
      let running = 0;
      const concurrency = { b: 1, c: 1, d: 1 };
      return pasync
        .groupBySeries(obj, async val => {
          running++;
          await sleep(0);
          expect(running).toEqual(concurrency[val]);
          running--;
          return val;
        })
        .then(result => {
          expect(running).toEqual(0);
          expect(result).toEqual({ b: ["b"], c: ["c"], d: ["d"] });
        });
    });

    it("error", () => {
      return pasync
        .groupBySeries(obj, async val => {
          if (val === "c") {
            throw new Error("fail");
          }
          return val;
        })
        .catch(err => err)
        .then(err => {
          expect(err).toEqual(new Error("fail"));
        });
    });

    it("handles arrays", () => {
      return pasync
        .groupBySeries(["a", "a", "b"], async val => {
          return val;
        })
        .then(result => {
          expect(result).toEqual({ a: ["a", "a"], b: ["b"] });
        });
    });

    it("handles empty object", () => {
      return pasync
        .groupBySeries({}, async () => {
          assert(false, "iteratee should not be called");
        })
        .then(result => {
          expect(result).toEqual({});
        });
    });

    it("handles undefined", () => {
      return pasync
        .groupBySeries(undefined, async () => {
          assert(false, "iteratee should not be called");
        })
        .then(result => {
          expect(result).toEqual({});
        });
    });
  });
});

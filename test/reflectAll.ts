import * as assert from "assert";
import * as async from "async";

/**
 * This tests doesn't exist in caloan/async
 */

describe("reflectAll", () => {
  it("with an object", done => {
    const tasks = {
      one: cb => {
        setTimeout(() => {
          cb(null, "one");
        }, 200);
      },
      two: cb => {
        cb("two");
      },
      three: cb => {
        setTimeout(() => {
          cb(null, "three");
        }, 100);
      }
    };

    const reflectedFns = async.reflectAll(tasks);

    async.auto(reflectedFns, (err, results) => {
      expect(err).toBeNull();
      expect(results).toEqual({
        one: { value: "one" },
        two: { error: "two" },
        three: { value: "three" }
      });
      done();
    });
  });
  it("with an array", done => {
    const tasks = [
      cb => {
        setTimeout(() => {
          cb(null, "one");
        }, 200);
      },
      cb => {
        cb("two");
      },
      cb => {
        setTimeout(() => {
          cb(null, "three");
        }, 100);
      }
    ];

    const reflectedFns = async.reflectAll(tasks);

    async.auto(reflectedFns, (err, results) => {
      expect(err).toBeNull();
      expect(results).toEqual({
        0: { value: "one" },
        1: { error: "two" },
        2: { value: "three" }
      });
      done();
    });
  });
});

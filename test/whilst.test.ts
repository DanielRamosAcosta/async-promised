import assert from "assert";
import * as async from "../lib";

describe("whilst", () => {
  it("whilst", () => {
    const callOrder = [];

    let count = 0;
    return async
      .whilst(
        c => {
          expect(c).toEqual(undefined);
          callOrder.push(["test", count]);
          return count < 5;
        },
        async () => {
          callOrder.push(["iteratee", count]);
          count++;
          return count;
        }
      )
      .then(result => {
        expect(result).toEqual(5);
        expect(callOrder).toEqual([
          ["test", 0],
          ["iteratee", 0],
          ["test", 1],
          ["iteratee", 1],
          ["test", 2],
          ["iteratee", 2],
          ["test", 3],
          ["iteratee", 3],
          ["test", 4],
          ["iteratee", 4],
          ["test", 5]
        ]);
        expect(count).toEqual(5);
      });
  });

  // Removed 'whilst optional callback', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/mocha_test/whilst.js#L38

  it("doWhilst", () => {
    const callOrder = [];

    let count = 0;
    return async
      .doWhilst(
        async () => {
          callOrder.push(["iteratee", count]);
          count++;
          return count;
        },
        c => {
          expect(c).toEqual(count);
          callOrder.push(["test", count]);
          return count < 5;
        }
      )
      .then(result => {
        expect(result).toEqual(5);
        expect(callOrder).toEqual([
          ["iteratee", 0],
          ["test", 1],
          ["iteratee", 1],
          ["test", 2],
          ["iteratee", 2],
          ["test", 3],
          ["iteratee", 3],
          ["test", 4],
          ["iteratee", 4],
          ["test", 5]
        ]);
        expect(count).toEqual(5);
      });
  });

  it("doWhilst callback params", () => {
    const callOrder = [];
    let count = 0;
    async
      .doWhilst(
        async () => {
          callOrder.push(["iteratee", count]);
          count++;
          return count;
        },
        c => {
          callOrder.push(["test", c]);
          return c < 5;
        }
      )
      .then(result => {
        expect(result).toEqual(5);
        expect(callOrder).toEqual([
          ["iteratee", 0],
          ["test", 1],
          ["iteratee", 1],
          ["test", 2],
          ["iteratee", 2],
          ["test", 3],
          ["iteratee", 3],
          ["test", 4],
          ["iteratee", 4],
          ["test", 5]
        ]);
        expect(count).toEqual(5);
      });
  });

  it("doWhilst - error", () => {
    const error = new Error("asdas");

    return async
      .doWhilst(
        async () => {
          throw error;
        },
        () => {
          return true;
        }
      )
      .catch(err => err)
      .then(err => {
        expect(err).toEqual(error);
      });
  });
});

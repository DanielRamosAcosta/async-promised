import assert from "assert";
import * as async from "../lib";

describe("until", () => {
  it("until", () => {
    const callOrder = [];
    let count = 0;
    return async
      .until(
        c => {
          expect(c).toEqual(undefined);
          callOrder.push(["test", count]);
          return count === 5;
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

  it("doUntil", () => {
    const callOrder = [];
    let count = 0;
    return async
      .doUntil(
        async () => {
          callOrder.push(["iteratee", count]);
          count++;
          return count;
        },
        c => {
          expect(c).toEqual(count);
          callOrder.push(["test", count]);
          return count === 5;
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

  it("doUntil callback params", () => {
    const callOrder = [];
    let count = 0;
    return async
      .doUntil(
        async () => {
          callOrder.push(["iteratee", count]);
          count++;
          return count;
        },
        c => {
          callOrder.push(["test", c]);
          return c === 5;
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
});

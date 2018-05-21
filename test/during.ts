import * as assert from "assert";
import * as async from "../lib";

describe("during", () => {
  it("during", () => {
    const callOrder = [];

    let count = 0;
    return async
      .during(
        async () => {
          callOrder.push(["test", count]);
          return count < 5;
        },
        async () => {
          callOrder.push(["iteratee", count]);
          count++;
        }
      )
      .then(() => {
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

  it("doDuring", () => {
    const callOrder = [];

    let count = 0;
    return async
      .doDuring(
        async () => {
          callOrder.push(["iteratee", count]);
          count++;
          return count;
        },
        async c => {
          expect(c).toEqual(count);
          callOrder.push(["test", count]);
          return count < 5;
        }
      )
      .then(() => {
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

  it("doDuring - error test", () => {
    const error = new Error("asdas");

    return async
      .doDuring(
        async () => {
          throw error;
        },
        async () => {
          return true;
        }
      )
      .catch(err => err)
      .then(err => {
        expect(err).toEqual(error);
      });
  });

  it("doDuring - error iteratee", () => {
    const error = new Error("asdas");

    return async
      .doDuring(
        async () => {
          return null;
        },
        async () => {
          throw error;
        }
      )
      .catch(err => err)
      .then(err => {
        expect(err).toEqual(error);
      });
  });
});

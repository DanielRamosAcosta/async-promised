import * as assert from "assert";
import * as async from "async";

describe("until", () => {
  it("until", done => {
    const call_order = [];
    let count = 0;
    async.until(
      c => {
        expect(c).toEqual(undefined);
        call_order.push(["test", count]);
        return count === 5;
      },
      cb => {
        call_order.push(["iteratee", count]);
        count++;
        cb(null, count);
      },
      (err, result) => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(result).toEqual(5, "last result passed through");
        expect(call_order).toEqual([
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
        done();
      }
    );
  });

  it("doUntil", done => {
    const call_order = [];
    let count = 0;
    async.doUntil(
      cb => {
        call_order.push(["iteratee", count]);
        count++;
        cb(null, count);
      },
      c => {
        expect(c).toEqual(count);
        call_order.push(["test", count]);
        return count === 5;
      },
      (err, result) => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(result).toEqual(5, "last result passed through");
        expect(call_order).toEqual([
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
        done();
      }
    );
  });

  it("doUntil callback params", done => {
    const call_order = [];
    let count = 0;
    async.doUntil(
      cb => {
        call_order.push(["iteratee", count]);
        count++;
        cb(null, count);
      },
      c => {
        call_order.push(["test", c]);
        return c === 5;
      },
      (err, result) => {
        if (err) throw err;
        expect(result).toEqual(5, "last result passed through");
        expect(call_order).toEqual([
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
        done();
      }
    );
  });
});

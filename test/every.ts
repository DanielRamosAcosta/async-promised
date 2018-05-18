import * as async from "async";
import * as _ from "lodash";

describe("every", () => {
  it("everyLimit true", done => {
    async.everyLimit(
      [3, 1, 2],
      1,
      (x, callback) => {
        setTimeout(() => {
          callback(null, x >= 1);
        }, 0);
      },
      (err, result) => {
        expect(err).toEqual(null);
        expect(result).toEqual(true);
        done();
      }
    );
  });

  it("everyLimit false", done => {
    async.everyLimit(
      [3, 1, 2],
      2,
      (x, callback) => {
        setTimeout(() => {
          callback(null, x === 2);
        }, 0);
      },
      (err, result) => {
        expect(err).toEqual(null);
        expect(result).toEqual(false);
        done();
      }
    );
  });

  it("everyLimit short-circuit", done => {
    let calls = 0;
    async.everyLimit(
      [3, 1, 2],
      1,
      (x, callback) => {
        calls++;
        callback(null, x === 1);
      },
      (err, result) => {
        expect(err).toEqual(null);
        expect(result).toEqual(false);
        expect(calls).toEqual(1);
        done();
      }
    );
  });

  it("true", done => {
    async.every(
      [1, 2, 3],
      (x, callback) => {
        setTimeout(() => {
          callback(null, true);
        }, 0);
      },
      (err, result) => {
        expect(err).toEqual(null);
        expect(result).toEqual(true);
        done();
      }
    );
  });

  it("false", done => {
    async.every(
      [1, 2, 3],
      (x, callback) => {
        setTimeout(() => {
          callback(null, x % 2);
        }, 0);
      },
      (err, result) => {
        expect(err).toEqual(null);
        expect(result).toEqual(false);
        done();
      }
    );
  });

  it("early return", done => {
    const call_order = [];
    async.every(
      [1, 2, 3],
      (x, callback) => {
        setTimeout(() => {
          call_order.push(x);
          callback(null, x === 1);
        }, x * 5);
      },
      () => {
        call_order.push("callback");
      }
    );
    setTimeout(() => {
      expect(call_order).toEqual([1, 2, "callback", 3]);
      done();
    }, 25);
  });

  it("error", done => {
    async.every(
      [1, 2, 3],
      (x, callback) => {
        setTimeout(() => {
          callback("error");
        }, 0);
      },
      (err, result) => {
        expect(err).toEqual("error");
        expect(result).toBeUndefined();
        done();
      }
    );
  });

  it("everySeries doesn't cause stack overflow (#1293)", done => {
    const arr = _.range(10000);
    let calls = 0;
    async.everySeries(
      arr,
      (data, cb) => {
        calls += 1;
        async.setImmediate(_.partial(cb, null, false));
      },
      err => {
        expect(err).toEqual(null);
        expect(calls).toEqual(1);
        done();
      }
    );
  });

  it("everyLimit doesn't cause stack overflow (#1293)", done => {
    const arr = _.range(10000);
    let calls = 0;
    async.everyLimit(
      arr,
      100,
      (data, cb) => {
        calls += 1;
        async.setImmediate(_.partial(cb, null, false));
      },
      err => {
        expect(err).toEqual(null);
        expect(calls).toEqual(100);
        done();
      }
    );
  });

  it("all alias", () => {
    expect(async.all).toEqual(async.every);
  });

  it("allLimit alias", () => {
    expect(async.allLimit).toEqual(async.everyLimit);
  });

  it("allSeries alias", () => {
    expect(async.allSeries).toBeInstanceOf(Function);
    expect(async.allSeries).toEqual(async.everySeries);
  });
});

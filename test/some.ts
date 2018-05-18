import * as async from "async";
import * as _ from "lodash";

describe("some", () => {
  it("some true", done => {
    async.some(
      [3, 1, 2],
      (x, callback) => {
        setTimeout(() => {
          callback(null, x === 1);
        }, 0);
      },
      (err, result) => {
        expect(err).toEqual(null);
        expect(result).toEqual(true);
        done();
      }
    );
  });

  it("some false", done => {
    async.some(
      [3, 1, 2],
      (x, callback) => {
        setTimeout(() => {
          callback(null, x === 10);
        }, 0);
      },
      (err, result) => {
        expect(err).toEqual(null);
        expect(result).toEqual(false);
        done();
      }
    );
  });

  it("some early return", done => {
    const call_order = [];
    async.some(
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
      expect(call_order).toEqual([1, "callback", 2, 3]);
      done();
    }, 25);
  });

  it("some error", done => {
    async.some(
      [3, 1, 2],
      (x, callback) => {
        setTimeout(() => {
          callback("error");
        }, 0);
      },
      (err, result) => {
        expect(err).toEqual("error");
        expect(result).toBeFalsy();
        done();
      }
    );
  });

  it("some no callback", done => {
    const calls = [];

    async.some([1, 2, 3], (val, cb) => {
      calls.push(val);
      cb();
    });

    setTimeout(() => {
      expect(calls).toEqual([1, 2, 3]);
      done();
    }, 10);
  });

  it("someLimit true", done => {
    async.someLimit(
      [3, 1, 2],
      2,
      (x, callback) => {
        setTimeout(() => {
          callback(null, x === 2);
        }, 0);
      },
      (err, result) => {
        expect(err).toEqual(null);
        expect(result).toEqual(true);
        done();
      }
    );
  });

  it("someLimit false", done => {
    async.someLimit(
      [3, 1, 2],
      2,
      (x, callback) => {
        setTimeout(() => {
          callback(null, x === 10);
        }, 0);
      },
      (err, result) => {
        expect(err).toEqual(null);
        expect(result).toEqual(false);
        done();
      }
    );
  });

  it("someLimit short-circuit", done => {
    let calls = 0;
    async.someLimit(
      [3, 1, 2],
      1,
      (x, callback) => {
        calls++;
        callback(null, x === 1);
      },
      (err, result) => {
        expect(err).toEqual(null);
        expect(result).toEqual(true);
        expect(calls).toEqual(2);
        done();
      }
    );
  });

  it("someSeries doesn't cause stack overflow (#1293)", done => {
    const arr = _.range(10000);
    let calls = 0;
    async.someSeries(
      arr,
      (data, cb) => {
        calls += 1;
        async.setImmediate(_.partial(cb, null, true));
      },
      err => {
        expect(err).toEqual(null);
        expect(calls).toEqual(1);
        done();
      }
    );
  });

  it("someLimit doesn't cause stack overflow (#1293)", done => {
    const arr = _.range(10000);
    let calls = 0;
    async.someLimit(
      arr,
      100,
      (data, cb) => {
        calls += 1;
        async.setImmediate(_.partial(cb, null, true));
      },
      err => {
        expect(err).toEqual(null);
        expect(calls).toEqual(100);
        done();
      }
    );
  });

  it("any alias", () => {
    expect(async.any).toEqual(async.some);
  });

  it("anyLimit alias", () => {
    expect(async.anyLimit).toEqual(async.someLimit);
  });

  it("anySeries alias", () => {
    expect(async.anySeries).toBeInstanceOf(Function);
    expect(async.anySeries).toEqual(async.someSeries);
  });
});

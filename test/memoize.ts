import * as assert from "assert";
import * as async from "async";

describe("memoize", () => {
  it("memoize", done => {
    const callOrder = [];

    const fn = (arg1, arg2, callback) => {
      async.setImmediate(() => {
        callOrder.push(["fn", arg1, arg2]);
        callback(null, arg1 + arg2);
      });
    };

    const fn2 = async.memoize(fn);
    fn2(1, 2, (err, result) => {
      assert(err === null, `${err} passed instead of 'null'`);
      expect(result).toEqual(3);
      fn2(1, 2, (err, result) => {
        expect(result).toEqual(3);
        fn2(2, 2, (err, result) => {
          expect(result).toEqual(4);
          expect(callOrder).toEqual([["fn", 1, 2], ["fn", 2, 2]]);
          done();
        });
      });
    });
  });

  it("maintains asynchrony", done => {
    const callOrder = [];

    const fn = (arg1, arg2, callback) => {
      callOrder.push(["fn", arg1, arg2]);
      async.setImmediate(() => {
        callOrder.push(["cb", arg1, arg2]);
        callback(null, arg1 + arg2);
      });
    };

    const fn2 = async.memoize(fn);
    fn2(1, 2, (err, result) => {
      expect(result).toEqual(3);
      fn2(1, 2, (err, result) => {
        expect(result).toEqual(3);
        async.nextTick(memoize_done);
        callOrder.push("tick3");
      });
      callOrder.push("tick2");
    });
    callOrder.push("tick1");

    function memoize_done() {
      const asyncCallOrder = [
        ["fn", 1, 2], // initial async call
        "tick1", // async caller
        ["cb", 1, 2], // async callback
        //  ['fn',1,2], // memoized // memoized async body
        "tick2", // handler for first async call
        //  ['cb',1,2], // memoized // memoized async response body
        "tick3" // handler for memoized async call
      ];
      expect(callOrder).toEqual(asyncCallOrder);
      done();
    }
  });

  it("unmemoize", done => {
    const callOrder = [];

    const fn = (arg1, arg2, callback) => {
      callOrder.push(["fn", arg1, arg2]);
      async.setImmediate(() => {
        callback(null, arg1 + arg2);
      });
    };

    const fn2 = async.memoize(fn);
    const fn3 = async.unmemoize(fn2);
    fn3(1, 2, (err, result) => {
      expect(result).toEqual(3);
      fn3(1, 2, (err, result) => {
        expect(result).toEqual(3);
        fn3(2, 2, (err, result) => {
          expect(result).toEqual(4);
          expect(callOrder).toEqual([["fn", 1, 2], ["fn", 1, 2], ["fn", 2, 2]]);
          done();
        });
      });
    });
  });

  it("unmemoize a not memoized function", done => {
    const fn = (arg1, arg2, callback) => {
      callback(null, arg1 + arg2);
    };

    const fn2 = async.unmemoize(fn);
    fn2(1, 2, (err, result) => {
      expect(result).toEqual(3);
    });

    done();
  });

  it("error", done => {
    const testerr = new Error("test");
    const fn = (arg1, arg2, callback) => {
      callback(testerr, arg1 + arg2);
    };
    async.memoize(fn)(1, 2, err => {
      expect(err).toEqual(testerr);
    });
    done();
  });

  it("multiple calls", done => {
    const fn = (arg1, arg2, callback) => {
      assert(true);
      setTimeout(() => {
        callback(null, arg1, arg2);
      }, 10);
    };
    const fn2 = async.memoize(fn);
    fn2(1, 2, (err, result) => {
      expect(result).toEqual(1, 2);
    });
    fn2(1, 2, (err, result) => {
      expect(result).toEqual(1, 2);
      done();
    });
  });

  it("custom hash function", done => {
    const testerr = new Error("test");

    const fn = (arg1, arg2, callback) => {
      callback(testerr, arg1 + arg2);
    };
    const fn2 = async.memoize(fn, () => "custom hash");
    fn2(1, 2, (err, result) => {
      expect(result).toEqual(3);
      fn2(2, 2, (err, result) => {
        expect(result).toEqual(3);
        done();
      });
    });
  });

  it("manually added memo value", done => {
    const fn = async.memoize(() => {
      throw new Error("Function should never be called");
    });
    fn.memo.foo = ["bar"];
    fn("foo", val => {
      expect(val).toEqual("bar");
      done();
    });
  });

  it("avoid constructor key return undefined", done => {
    const fn = async.memoize((name, callback) => {
      setTimeout(() => {
        callback(null, name);
      }, 100);
    });
    fn("constructor", (error, results) => {
      expect(results).toEqual("constructor");
      done();
    });
  });

  it("avoid __proto__ key return undefined", done => {
    // Skip test if there is a Object.create bug (node 0.10 and some Chrome 30x versions)
    const x = Object.create(null);
    /* jshint proto: true */
    x.__proto__ = "foo";
    if (x.__proto__ !== "foo") {
      return done();
    }

    const fn = async.memoize((name, callback) => {
      setTimeout(() => {
        callback(null, name);
      }, 100);
    });
    fn("__proto__", (error, results) => {
      expect(results).toEqual("__proto__");
      done();
    });
  });

  it("allow hasOwnProperty as key", done => {
    const fn = async.memoize((name, callback) => {
      setTimeout(() => {
        callback(null, name);
      }, 100);
    });
    fn("hasOwnProperty", (error, results) => {
      expect(results).toEqual("hasOwnProperty");
      done();
    });
  });
});

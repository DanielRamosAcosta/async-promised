import * as assert from "assert";
import * as async from "async";
import getFunctionsObject from "./support/get-function-object";

describe("series", () => {
  it("series", done => {
    const callOrder = [];
    async.series(
      [
        callback => {
          setTimeout(() => {
            callOrder.push(1);
            callback(null, 1);
          }, 25);
        },
        callback => {
          setTimeout(() => {
            callOrder.push(2);
            callback(null, 2);
          }, 50);
        },
        callback => {
          setTimeout(() => {
            callOrder.push(3);
            callback(null, 3, 3);
          }, 15);
        }
      ],
      (err, results) => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(results).toEqual([1, 2, [3, 3]]);
        expect(callOrder).toEqual([1, 2, 3]);
        done();
      }
    );
  });

  it("with reflect", done => {
    const callOrder = [];
    async.series(
      [
        async.reflect(callback => {
          setTimeout(() => {
            callOrder.push(1);
            callback(null, 1);
          }, 25);
        }),
        async.reflect(callback => {
          setTimeout(() => {
            callOrder.push(2);
            callback(null, 2);
          }, 50);
        }),
        async.reflect(callback => {
          setTimeout(() => {
            callOrder.push(3);
            callback(null, 3, 3);
          }, 15);
        })
      ],
      (err, results) => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(results).toEqual([
          { value: 1 },
          { value: 2 },
          { value: [3, 3] }
        ]);
        expect(callOrder).toEqual([1, 2, 3]);
        done();
      }
    );
  });

  it("empty array", done => {
    async.series([], (err, results) => {
      expect(err).toEqual(null);
      expect(results).toEqual([]);
      done();
    });
  });

  it("error", done => {
    async.series(
      [
        callback => {
          callback("error", 1);
        },
        callback => {
          assert(false, "should not be called");
          callback("error2", 2);
        }
      ],
      err => {
        expect(err).toEqual("error");
      }
    );
    setTimeout(done, 100);
  });

  it("error with reflect", done => {
    async.series(
      [
        async.reflect(callback => {
          callback("error", 1);
        }),
        async.reflect(callback => {
          callback("error2", 2);
        }),
        async.reflect(callback => {
          callback(null, 1);
        })
      ],
      (err, results) => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(results).toEqual([
          { error: "error" },
          { error: "error2" },
          { value: 1 }
        ]);
        done();
      }
    );
  });

  it("no callback", done => {
    async.series([
      callback => {
        callback();
      },
      callback => {
        callback();
        done();
      }
    ]);
  });

  it("object", done => {
    const callOrder = [];
    async.series(getFunctionsObject(callOrder), (err, results) => {
      expect(err).toEqual(null);
      expect(results).toEqual({
        one: 1,
        two: 2,
        three: [3, 3]
      });
      expect(callOrder).toEqual([1, 2, 3]);
      done();
    });
  });

  it("call in another context @nycinvalid @nodeonly", done => {
    const vm = require("vm");
    const sandbox = {
      async,
      done
    };

    const fn =
      "(" +
      function() {
        async.series(
          [
            function(callback) {
              callback();
            }
          ],
          function(err) {
            if (err) {
              return done(err);
            }
            done();
          }
        );
      }.toString() +
      "())";

    vm.runInNewContext(fn, sandbox);
  });

  // Issue 10 on github: https://github.com/caolan/async/issues#issue/10
  it("falsy return values", done => {
    function taskFalse(callback) {
      async.nextTick(() => {
        callback(null, false);
      });
    }
    function taskUndefined(callback) {
      async.nextTick(() => {
        callback(null, undefined);
      });
    }
    function taskEmpty(callback) {
      async.nextTick(() => {
        callback(null);
      });
    }
    function taskNull(callback) {
      async.nextTick(() => {
        callback(null, null);
      });
    }
    async.series(
      [taskFalse, taskUndefined, taskEmpty, taskNull],
      (err, results) => {
        expect(results.length).toEqual(4);
        assert.strictEqual(results[0], false);
        assert.strictEqual(results[1], undefined);
        assert.strictEqual(results[2], undefined);
        assert.strictEqual(results[3], null);
        done();
      }
    );
  });
});

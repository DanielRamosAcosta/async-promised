import * as assert from "assert";
import * as async from "async";
import { expect } from "chai";
import getFunctionsObject from "./support/get-function-object";

describe("parallel", () => {
  it("parallel", done => {
    const call_order = [];
    async.parallel(
      [
        callback => {
          setTimeout(() => {
            call_order.push(1);
            callback(null, 1);
          }, 50);
        },
        callback => {
          setTimeout(() => {
            call_order.push(2);
            callback(null, 2);
          }, 100);
        },
        callback => {
          setTimeout(() => {
            call_order.push(3);
            callback(null, 3, 3);
          }, 25);
        }
      ],
      (err, results) => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(call_order).to.eql([3, 1, 2]);
        expect(results).to.eql([1, 2, [3, 3]]);
        done();
      }
    );
  });

  it("parallel empty array", done => {
    async.parallel([], (err, results) => {
      assert(err === null, `${err} passed instead of 'null'`);
      expect(results).to.eql([]);
      done();
    });
  });

  it("parallel error", done => {
    async.parallel(
      [
        callback => {
          callback("error", 1);
        },
        callback => {
          callback("error2", 2);
        }
      ],
      err => {
        expect(err).to.equal("error");
      }
    );
    setTimeout(done, 100);
  });

  it("parallel no callback", done => {
    async.parallel([
      callback => {
        callback();
      },
      callback => {
        callback();
        done();
      }
    ]);
  });

  it("parallel object", done => {
    const call_order = [];
    async.parallel(getFunctionsObject(call_order), (err, results) => {
      expect(err).to.equal(null);
      expect(call_order).to.eql([3, 1, 2]);
      expect(results).to.eql({
        one: 1,
        two: 2,
        three: [3, 3]
      });
      done();
    });
  });

  // Issue 10 on github: https://github.com/caolan/async/issues#issue/10
  it("paralel falsy return values", done => {
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
    async.parallel(
      [taskFalse, taskUndefined, taskEmpty, taskNull],
      (err, results) => {
        expect(results.length).to.equal(4);
        assert.strictEqual(results[0], false);
        assert.strictEqual(results[1], undefined);
        assert.strictEqual(results[2], undefined);
        assert.strictEqual(results[3], null);
        done();
      }
    );
  });

  it("parallel limit", done => {
    const call_order = [];
    async.parallelLimit(
      [
        callback => {
          setTimeout(() => {
            call_order.push(1);
            callback(null, 1);
          }, 50);
        },
        callback => {
          setTimeout(() => {
            call_order.push(2);
            callback(null, 2);
          }, 100);
        },
        callback => {
          setTimeout(() => {
            call_order.push(3);
            callback(null, 3, 3);
          }, 25);
        }
      ],
      2,
      (err, results) => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(call_order).to.eql([1, 3, 2]);
        expect(results).to.eql([1, 2, [3, 3]]);
        done();
      }
    );
  });

  it("parallel limit empty array", done => {
    async.parallelLimit([], 2, (err, results) => {
      assert(err === null, `${err} passed instead of 'null'`);
      expect(results).to.eql([]);
      done();
    });
  });

  it("parallel limit error", done => {
    async.parallelLimit(
      [
        callback => {
          callback("error", 1);
        },
        callback => {
          callback("error2", 2);
        }
      ],
      1,
      err => {
        expect(err).to.equal("error");
      }
    );
    setTimeout(done, 100);
  });

  it("parallel limit no callback", done => {
    async.parallelLimit(
      [
        callback => {
          callback();
        },
        callback => {
          callback();
          done();
        }
      ],
      1
    );
  });

  it("parallel limit object", done => {
    const call_order = [];
    async.parallelLimit(getFunctionsObject(call_order), 2, (err, results) => {
      expect(err).to.equal(null);
      expect(call_order).to.eql([1, 3, 2]);
      expect(results).to.eql({
        one: 1,
        two: 2,
        three: [3, 3]
      });
      done();
    });
  });

  it("parallel call in another context @nycinvalid @nodeonly", done => {
    const vm = require("vm");
    const sandbox = {
      async,
      done
    };

    const fn =
      "(" +
      function() {
        async.parallel(
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

  it("parallel error with reflect", done => {
    async.parallel(
      [
        async.reflect(callback => {
          callback("error", 1);
        }),
        async.reflect(callback => {
          callback("error2", 2);
        }),
        async.reflect(callback => {
          callback(null, 2);
        })
      ],
      (err, results) => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(results).to.eql([
          { error: "error" },
          { error: "error2" },
          { value: 2 }
        ]);
        done();
      }
    );
  });

  it("parallel object with reflect all (values and errors)", done => {
    const tasks = {
      one(callback) {
        setTimeout(() => {
          callback(null, "one");
        }, 200);
      },
      two(callback) {
        callback("two");
      },
      three(callback) {
        setTimeout(() => {
          callback(null, "three");
        }, 100);
      }
    };

    async.parallel(async.reflectAll(tasks), (err, results) => {
      expect(results).to.eql({
        one: { value: "one" },
        two: { error: "two" },
        three: { value: "three" }
      });
      done();
    });
  });

  it("parallel empty object with reflect all", done => {
    const tasks = {};

    async.parallel(async.reflectAll(tasks), (err, results) => {
      expect(results).to.eql({});
      done();
    });
  });

  it("parallel empty object with reflect all (errors)", done => {
    const tasks = {
      one(callback) {
        callback("one");
      },
      two(callback) {
        callback("two");
      },
      three(callback) {
        callback("three");
      }
    };

    async.parallel(async.reflectAll(tasks), (err, results) => {
      expect(results).to.eql({
        one: { error: "one" },
        two: { error: "two" },
        three: { error: "three" }
      });
      done();
    });
  });

  it("parallel empty object with reflect all (values)", done => {
    const tasks = {
      one(callback) {
        callback(null, "one");
      },
      two(callback) {
        callback(null, "two");
      },
      three(callback) {
        callback(null, "three");
      }
    };

    async.parallel(async.reflectAll(tasks), (err, results) => {
      expect(results).to.eql({
        one: { value: "one" },
        two: { value: "two" },
        three: { value: "three" }
      });
      done();
    });
  });

  it("parallel does not continue replenishing after error", done => {
    let started = 0;
    const arr = [
      funcToCall,
      funcToCall,
      funcToCall,
      funcToCall,
      funcToCall,
      funcToCall,
      funcToCall,
      funcToCall,
      funcToCall
    ];
    const delay = 10;
    const limit = 3;
    const maxTime = 10 * arr.length;
    function funcToCall(callback) {
      started++;
      if (started === 3) {
        return callback(new Error("Test Error"));
      }
      setTimeout(() => {
        callback();
      }, delay);
    }

    async.parallelLimit(arr, limit, () => {});

    setTimeout(() => {
      expect(started).to.equal(3);
      done();
    }, maxTime);
  });
});

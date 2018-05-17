import * as assert from "assert";
import * as async from "async";
import { expect } from "chai";
import * as _ from "lodash";

describe("retry", () => {
  // Issue 306 on github: https://github.com/caolan/async/issues/306
  it("retry when attempt succeeds", done => {
    let failed = 3;
    let callCount = 0;
    const expectedResult = "success";
    function fn(callback) {
      callCount++;
      failed--;
      if (!failed) callback(null, expectedResult);
      else callback(true); // respond with error
    }
    async.retry(fn, (err, result) => {
      assert(err === null, `${err} passed instead of 'null'`);
      assert.equal(callCount, 3, "did not retry the correct number of times");
      assert.equal(
        result,
        expectedResult,
        "did not return the expected result"
      );
      done();
    });
  });

  it("retry when all attempts fail", done => {
    const times = 3;
    let callCount = 0;
    const error = "ERROR";
    const erroredResult = "RESULT";
    function fn(callback) {
      callCount++;
      callback(error + callCount, erroredResult + callCount); // respond with indexed values
    }
    async.retry(times, fn, (err, result) => {
      assert.equal(callCount, 3, "did not retry the correct number of times");
      assert.equal(err, error + times, "Incorrect error was returned");
      assert.equal(
        result,
        erroredResult + times,
        "Incorrect result was returned"
      );
      done();
    });
  });

  it("retry fails with invalid arguments", done => {
    expect(() => {
      async.retry("");
    }).to.throw();
    expect(() => {
      async.retry();
    }).to.throw();
    expect(() => {
      async.retry(() => {}, 2, () => {});
    }).to.throw();
    done();
  });

  it("retry with interval when all attempts fail", function(done) {
    // TODO: this.retries(3); // this test is flakey due to timing issues

    const times = 3;
    const interval = 50;
    let callCount = 0;
    const error = "ERROR";
    const erroredResult = "RESULT";
    function fn(callback) {
      callCount++;
      callback(error + callCount, erroredResult + callCount); // respond with indexed values
    }
    const start = Date.now();
    async.retry({ times, interval }, fn, (err, result) => {
      const duration = Date.now() - start;
      expect(duration).to.be.above(interval * (times - 1) - times);
      assert.equal(callCount, 3, "did not retry the correct number of times");
      assert.equal(err, error + times, "Incorrect error was returned");
      assert.equal(
        result,
        erroredResult + times,
        "Incorrect result was returned"
      );
      done();
    });
  });

  it("retry with custom interval when all attempts fail", done => {
    const times = 3;
    const intervalFunc = retryCount => retryCount * 100;
    let callCount = 0;
    const error = "ERROR";
    const erroredResult = "RESULT";
    function fn(callback) {
      callCount++;
      callback(error + callCount, erroredResult + callCount); // respond with indexed values
    }
    const start = Date.now();
    async.retry({ times, interval: intervalFunc }, fn, (err, result) => {
      const duration = Date.now() - start;
      expect(duration).to.be.above(300 - times);
      assert.equal(callCount, 3, "did not retry the correct number of times");
      assert.equal(err, error + times, "Incorrect error was returned");
      assert.equal(
        result,
        erroredResult + times,
        "Incorrect result was returned"
      );
      done();
    });
  });

  it("should not require a callback", done => {
    let called = false;
    async.retry(3, cb => {
      called = true;
      cb();
    });
    setTimeout(() => {
      assert(called);
      done();
    }, 10);
  });

  it("should not require a callback and use the default times", done => {
    let calls = 0;
    async.retry(cb => {
      calls++;
      cb("fail");
    });
    setTimeout(() => {
      expect(calls).to.equal(5);
      done();
    }, 50);
  });

  it("retry does not precompute the intervals (#1226)", done => {
    const callTimes = [];
    function intervalFunc() {
      callTimes.push(Date.now());
      return 100;
    }
    function fn(callback) {
      callback({}); // respond with indexed values
    }
    async.retry({ times: 4, interval: intervalFunc }, fn, () => {
      expect(callTimes[1] - callTimes[0]).to.be.above(90);
      expect(callTimes[2] - callTimes[1]).to.be.above(90);
      done();
    });
  });

  it("retry passes all resolve arguments to callback", done => {
    function fn(callback) {
      callback(null, 1, 2, 3); // respond with indexed values
    }
    async.retry(
      5,
      fn,
      _.rest(args => {
        expect(args).to.be.eql([null, 1, 2, 3]);
        done();
      })
    );
  });

  // note this is a synchronous test ensuring retry is synchrnous in the fastest (most straightforward) case
  it("retry calls fn immediately and will call callback if successful", () => {
    function fn(callback) {
      callback(null, { a: 1 });
    }
    async.retry(5, fn, (err, result) => {
      expect(result).to.be.eql({ a: 1 });
    });
  });

  it("retry when all attempts fail and error continue test returns true", done => {
    const times = 3;
    let callCount = 0;
    const error = "ERROR";
    const special = "SPECIAL_ERROR";
    const erroredResult = "RESULT";
    function fn(callback) {
      callCount++;
      callback(error + callCount, erroredResult + callCount);
    }
    function errorTest(err) {
      return err && err !== special;
    }
    const options = {
      times,
      errorFilter: errorTest
    };
    async.retry(options, fn, (err, result) => {
      assert.equal(callCount, 3, "did not retry the correct number of times");
      assert.equal(err, error + times, "Incorrect error was returned");
      assert.equal(
        result,
        erroredResult + times,
        "Incorrect result was returned"
      );
      done();
    });
  });

  it("retry when some attempts fail and error test returns false at some invokation", done => {
    let callCount = 0;
    const error = "ERROR";
    const special = "SPECIAL_ERROR";
    const erroredResult = "RESULT";
    function fn(callback) {
      callCount++;
      const err = callCount === 2 ? special : error + callCount;
      callback(err, erroredResult + callCount);
    }
    function errorTest(err) {
      return err && err === error + callCount; // just a different pattern
    }
    const options = {
      errorFilter: errorTest
    };
    async.retry(options, fn, (err, result) => {
      assert.equal(callCount, 2, "did not retry the correct number of times");
      assert.equal(err, special, "Incorrect error was returned");
      assert.equal(result, erroredResult + 2, "Incorrect result was returned");
      done();
    });
  });

  it("retry with interval when some attempts fail and error test returns false at some invokation", function(done) {
    // TODO: this.retries(3); // flakey test

    const interval = 50;
    let callCount = 0;
    const error = "ERROR";
    const erroredResult = "RESULT";
    const special = "SPECIAL_ERROR";
    const specialCount = 3;
    function fn(callback) {
      callCount++;
      const err = callCount === specialCount ? special : error + callCount;
      callback(err, erroredResult + callCount);
    }
    function errorTest(err) {
      return err && err !== special;
    }
    const start = Date.now();
    async.retry({ interval, errorFilter: errorTest }, fn, (err, result) => {
      const duration = Date.now() - start;
      expect(duration).to.be.above(
        interval * (specialCount - 1) - specialCount
      );
      assert.equal(
        callCount,
        specialCount,
        "did not retry the correct number of times"
      );
      assert.equal(err, special, "Incorrect error was returned");
      assert.equal(
        result,
        erroredResult + specialCount,
        "Incorrect result was returned"
      );
      done();
    });
  });

  it("retry when first attempt succeeds and error test should not be called", done => {
    let callCount = 0;
    const error = "ERROR";
    const erroredResult = "RESULT";
    let continueTestCalled = false;
    function fn(callback) {
      callCount++;
      callback(null, erroredResult + callCount);
    }
    function errorTest(err) {
      continueTestCalled = true;
      return err && err === error;
    }
    const options = {
      errorFilter: errorTest
    };
    async.retry(
      options,
      fn,
      _.rest(args => {
        assert.equal(callCount, 1, "did not retry the correct number of times");
        expect(args).to.be.eql([null, erroredResult + callCount]);
        assert.equal(
          continueTestCalled,
          false,
          "error test function was called"
        );
        done();
      })
    );
  });
});

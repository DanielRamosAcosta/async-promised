import assert from "assert";
import * as async from "../lib";

describe("retry", () => {
  // Issue 306 on github: https://github.com/caolan/async/issues/306
  it("retry when attempt succeeds", () => {
    let failed = 3;
    let callCount = 0;
    const expectedResult = "success";
    async function fn() {
      callCount++;
      failed--;
      if (failed) {
        throw new Error("fail");
      }
      return expectedResult;
    }

    return async.retry(fn).then(result => {
      expect(callCount).toEqual(3);
      expect(result).toEqual(expectedResult);
    });
  });

  it("retry when all attempts fail", () => {
    const times = 3;
    let callCount = 0;
    async function fn() {
      callCount++;
      // respond with indexed values
      throw new Error(`Error: ${callCount}`);
    }

    return async
      .retry(times, fn)
      .catch(err => err)
      .then(err => {
        expect(callCount).toEqual(3);
        expect(err).toEqual(new Error(`Error: ${times}`));
      });
  });

  it("retry fails with invalid arguments", async () => {
    await expect(async.retry("")).rejects.toEqual(
      new Error("Invalid arguments for async.retry")
    );
    await expect(async.retry()).rejects.toEqual(
      new Error("Invalid arguments for async.retry")
    );
    await expect(async.retry(() => {}, 2, () => {})).rejects.toEqual(
      new Error("Invalid arguments for async.retry")
    );
  });

  it("retry with interval when all attempts fail", () => {
    // TODO: this.retries(3); // this test is flakey due to timing issues

    const times = 3;
    const interval = 50;
    let callCount = 0;
    const error = "ERROR";

    async function fn2() {
      callCount++;
      throw new Error(error + callCount);
    }
    const start = Date.now();

    return async
      .retry({ interval, times }, fn2)
      .catch(err => err)
      .then(err => {
        const duration = Date.now() - start;
        expect(duration).toBeGreaterThan(interval * (times - 1) - times);

        assert.equal(
          err.message,
          error + times,
          "Incorrect error was returned"
        );
      });
  });

  it("retry with custom interval when all attempts fail", () => {
    const times = 3;
    const intervalFunc = (retryCount: number) => retryCount * 100;
    let callCount = 0;
    const error = "ERROR";
    async function fn2() {
      callCount++;
      throw new Error(error + callCount);
    }

    const start = Date.now();
    return async
      .retry({ times, interval: intervalFunc }, fn2)
      .catch(err => err)
      .then(err => {
        const duration = Date.now() - start;
        expect(duration).toBeGreaterThan(300 - times);
        assert.equal(callCount, 3, "did not retry the correct number of times");
        assert.equal(
          err.message,
          error + times,
          "Incorrect error was returned"
        );
      });
  });

  // Removed 'should not require a callback', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/test/retry.js#L101

  // Removed 'should not require a callback and use the default times', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/test/retry.js#L113

  it("retry does not precompute the intervals (#1226)", done => {
    const callTimes: number[] = [];
    function intervalFunc() {
      callTimes.push(Date.now());
      return 100;
    }
    async function fn() {
      throw new Error("error");
    }
    async
      .retry({ times: 4, interval: intervalFunc }, fn)
      .catch(err => err)
      .then(() => {
        expect(callTimes[1] - callTimes[0]).toBeGreaterThan(90);
        expect(callTimes[2] - callTimes[1]).toBeGreaterThan(90);
        done();
      });
  });

  // Removed 'retry passes all resolve arguments to callback', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/test/retry.js#L153

  // note this is a synchronous test ensuring retry is synchrnous in the fastest (most straightforward) case
  it("retry calls fn immediately and will call callback if successful", () => {
    async function fn() {
      return { a: 1 };
    }
    async.retry(5, fn).then(result => {
      expect(result).toEqual({ a: 1 });
    });
  });

  it("retry when all attempts fail and error continue test returns true", () => {
    const times = 3;
    let callCount = 0;
    const error = "ERROR";
    const special = "SPECIAL_ERROR";

    async function fn() {
      callCount++;
      throw new Error(error + callCount);
    }
    function errorTest(err: Error) {
      return err && err.message !== special;
    }
    const options = {
      errorFilter: errorTest,
      times
    };

    return async
      .retry(options, fn)
      .catch(err => err)
      .then(err => {
        assert.equal(callCount, 3, "did not retry the correct number of times");
        assert.equal(
          err.message,
          error + times,
          "Incorrect error was returned"
        );
      });
  });

  it("retry when some attempts fail and error test returns false at some invokation", () => {
    let callCount = 0;
    const error = "ERROR";
    const special = "SPECIAL_ERROR";
    const erroredResult = "RESULT";

    async function fn() {
      callCount++;
      const err = callCount === 2 ? special : error + callCount;
      throw new Error(err);
    }

    function errorTest(err: Error) {
      return err && err.message === error + callCount; // just a different pattern
    }

    const options = {
      errorFilter: errorTest
    };

    return async
      .retry(options, fn)
      .catch(err => err)
      .then(err => {
        assert.equal(callCount, 2, "did not retry the correct number of times");
        assert.equal(err.message, special, "Incorrect error was returned");
      });
  });

  it("retry with interval when some attempts fail and error test returns false at some invokation", () => {
    // TODO: this.retries(3); // flakey test

    const interval = 50;
    let callCount = 0;
    const error = "ERROR";
    const special = "SPECIAL_ERROR";
    const specialCount = 3;
    async function fn() {
      callCount++;
      const err = callCount === specialCount ? special : error + callCount;
      throw new Error(err);
    }
    function errorTest(err: Error) {
      return err && err.message !== special;
    }
    const start = Date.now();

    return async
      .retry({ interval, errorFilter: errorTest }, fn)
      .catch(err => err)
      .then(err => {
        const duration = Date.now() - start;
        expect(duration).toBeGreaterThan(
          interval * (specialCount - 1) - specialCount
        );
        assert.equal(
          callCount,
          specialCount,
          "did not retry the correct number of times"
        );
        assert.equal(err.message, special, "Incorrect error was returned");
      });
  });

  it("retry when first attempt succeeds and error test should not be called", () => {
    let callCount = 0;
    const error = "ERROR";
    const erroredResult = "RESULT";
    let continueTestCalled = false;
    async function fn() {
      callCount++;
      return erroredResult + callCount;
    }
    function errorTest(err: Error) {
      continueTestCalled = true;
      return err && err.message === error;
    }
    const options = {
      errorFilter: errorTest
    };

    return async.retry(options, fn).then(value => {
      assert.equal(callCount, 1, "did not retry the correct number of times");
      expect(value).toEqual(erroredResult + callCount);
      assert.equal(continueTestCalled, false, "error test function was called");
    });
  });
});

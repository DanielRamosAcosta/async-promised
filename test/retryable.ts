import * as assert from "assert";
import * as async from "async";

describe("retryable", () => {
  it("basics", done => {
    let calls = 0;
    const retryableTask = async.retryable(3, (arg, cb) => {
      calls++;
      expect(arg).toEqual(42);
      cb("fail");
    });

    retryableTask(42, err => {
      expect(err).toEqual("fail");
      expect(calls).toEqual(3);
      done();
    });
  });

  it("basics with error test function", done => {
    let calls = 0;
    const special = "special";
    const opts = {
      errorFilter(err) {
        return err === special;
      }
    };
    const retryableTask = async.retryable(opts, (arg, cb) => {
      calls++;
      expect(arg).toEqual(42);
      cb(calls === 3 ? "fail" : special);
    });

    retryableTask(42, err => {
      expect(err).toEqual("fail");
      expect(calls).toEqual(3);
      done();
    });
  });

  it("should work as an embedded task", done => {
    const retryResult = "RETRY";
    let fooResults;
    let retryResults;

    async.auto(
      {
        dep: async.constant("dep"),
        foo: [
          "dep",
          (results, callback) => {
            fooResults = results;
            callback(null, "FOO");
          }
        ],
        retry: [
          "dep",
          async.retryable((results, callback) => {
            retryResults = results;
            callback(null, retryResult);
          })
        ]
      },
      (err, results) => {
        assert.equal(
          results.retry,
          retryResult,
          "Incorrect result was returned from retry function"
        );
        assert.equal(
          fooResults,
          retryResults,
          "Incorrect results were passed to retry function"
        );
        done();
      }
    );
  });

  it("should work as an embedded task with interval", done => {
    const start = new Date().getTime();
    const opts = { times: 5, interval: 20 };

    async.auto(
      {
        foo(callback) {
          callback(null, "FOO");
        },
        retry: async.retryable(opts, callback => {
          callback("err");
        })
      },
      () => {
        const duration = new Date().getTime() - start;
        const expectedMinimumDuration = (opts.times - 1) * opts.interval;
        assert(
          duration >= expectedMinimumDuration,
          `The duration should have been greater than ${expectedMinimumDuration}, but was ${duration}`
        );
        done();
      }
    );
  });
});

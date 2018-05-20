import * as assert from "assert";
import auto from "../lib/auto";
import constant from "../lib/constant";
// import * as async from "async";
import retryable from "../lib/retryable";

const async = { retryable, auto, constant };

describe("retryable", () => {
  it("basics", () => {
    let calls = 0;
    const retryableTask = async.retryable(3, async (arg: number) => {
      calls++;
      expect(arg).toEqual(42);
      throw new Error("fail");
    });

    return retryableTask(42)
      .catch(err => err)
      .then(err => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual("fail");
        expect(calls).toEqual(3);
      });
  });

  it("basics with error test function", () => {
    let calls = 0;
    const special = new Error("special");
    const opts = {
      errorFilter(err) {
        return err === special;
      }
    };
    const retryableTask = async.retryable(opts, async arg => {
      calls++;
      expect(arg).toEqual(42);
      if (calls === 3) {
        throw new Error("fail");
      }
      throw special;
    });

    return retryableTask(42)
      .catch(err => err)
      .then(err => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual("fail");
      });
  });

  it("should work as an embedded task", () => {
    const retryResult = "RETRY";
    let fooResults;
    let retryResults;

    return async
      .auto({
        dep: async.constant("dep"),
        foo: [
          "dep",
          async results => {
            fooResults = results;
            return "FOO";
          }
        ],
        retry: [
          "dep",
          async.retryable(async results => {
            retryResults = results;
            return retryResult;
          })
        ]
      })
      .then(results => {
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
      });
  });

  it("should work as an embedded task with interval", done => {
    const start = new Date().getTime();
    const opts = { times: 5, interval: 20 };

    return async
      .auto({
        async foo() {
          return "FOO";
        },
        retry: async.retryable(opts, async () => {
          throw new Error("err");
        })
      })
      .catch(err => err)
      .then(() => {
        const duration = new Date().getTime() - start;
        const expectedMinimumDuration = (opts.times - 1) * opts.interval;
        assert(
          duration >= expectedMinimumDuration,
          `The duration should have been greater than ${expectedMinimumDuration}, but was ${duration}`
        );
        done();
      });
  });
});

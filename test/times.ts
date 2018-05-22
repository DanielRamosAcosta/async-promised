import * as assert from "assert";
import * as async from "../lib";
import sleep from "./support/sleep";

describe("times", () => {
  it("times", () => {
    return async
      .times(5, async n => {
        return n;
      })
      .then(results => {
        expect(results).toEqual([0, 1, 2, 3, 4]);
      });
  });

  it("times 3", () => {
    const args = [];
    return async
      .times(3, async n => {
        await sleep(n * 25);
        args.push(n);
      })
      .then(() => {
        expect(args).toEqual([0, 1, 2]);
      });
  });

  it("times 0", () => {
    return async
      .times(0, async n => {
        assert(false, "iteratee should not be called");
      })
      .then(() => {
        assert(true, "should call callback");
      });
  });

  it("times error", () => {
    return async
      .times(3, async n => {
        throw new Error("error");
      })
      .catch(err => err)
      .then(err => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual("error");
      });
  });

  it("timesSeries", () => {
    const callOrder = [];
    return async
      .timesSeries(5, async n => {
        await sleep(100 - n * 10);
        callOrder.push(n);
        return n;
      })
      .then(results => {
        expect(callOrder).toEqual([0, 1, 2, 3, 4]);
        expect(results).toEqual([0, 1, 2, 3, 4]);
      });
  });

  it("timesSeries error", () => {
    return async
      .timesSeries(5, async n => {
        throw new Error("error");
      })
      .catch(err => err)
      .then(err => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual("error");
      });
  });

  it("timesLimit", () => {
    const limit = 2;
    let running = 0;
    return async
      .timesLimit(5, limit, async i => {
        running++;
        assert(running <= limit && running > 0, running);
        await sleep((3 - i) * 10);
        running--;
        return i * 2;
      })
      .then(results => {
        expect(results).toEqual([0, 2, 4, 6, 8]);
      });
  });
});

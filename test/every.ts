import * as async from "../lib";
import sleep from "./support/sleep";

describe("every", () => {
  it("everyLimit true", () => {
    return async
      .everyLimit([3, 1, 2], 1, async x => {
        await sleep(0);
        return x >= 1;
      })
      .then(result => {
        expect(result).toEqual(true);
      });
  });

  it("everyLimit false", () => {
    return async
      .everyLimit([3, 1, 2], 2, async x => {
        await sleep(0);
        return x === 2;
      })
      .then(result => {
        expect(result).toEqual(false);
      });
  });

  it("everyLimit short-circuit", () => {
    let calls = 0;
    return async
      .everyLimit([3, 1, 2], 1, async x => {
        calls++;
        return x === 1;
      })
      .then(result => {
        expect(result).toEqual(false);
        expect(calls).toEqual(1);
      });
  });

  it("true", () => {
    return async
      .every([1, 2, 3], async x => {
        await sleep(0);
        return true;
      })
      .then(result => {
        expect(result).toEqual(true);
      });
  });

  it("false", () => {
    return async
      .every([1, 2, 3], async x => {
        await sleep(0);
        return !!(x % 2);
      })
      .then(result => {
        expect(result).toEqual(false);
      });
  });

  it("early return", async () => {
    const callOrder = [];
    const promise = async
      .every([1, 2, 3], async x => {
        await sleep(x * 5);
        callOrder.push(x);
        return x === 1;
      })
      .then(() => {
        callOrder.push("callback");
      });

    await sleep(30);
    expect(callOrder).toEqual([1, 2, "callback", 3]);
  });

  it("error", () => {
    async
      .every([1, 2, 3], async x => {
        await sleep(0);
        throw new Error("error");
      })
      .catch(err => err)
      .then(err => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual("error");
      });
  });

  it("everySeries doesn't cause stack overflow (#1293)", () => {
    const arr = Array.from({ length: 10000 });
    let calls = 0;
    return async
      .everySeries(arr, async data => {
        calls += 1;
        await sleep(0);
        return false;
      })
      .then(() => {
        expect(calls).toEqual(1);
      });
  });

  it("everyLimit doesn't cause stack overflow (#1293)", () => {
    const arr = Array.from({ length: 10000 });
    let calls = 0;
    return async
      .everyLimit(arr, 100, async data => {
        calls += 1;
        await sleep(0);
        return false;
      })
      .then(() => {
        expect(calls).toEqual(100);
      });
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

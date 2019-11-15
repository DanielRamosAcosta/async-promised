import * as async from ".";
import sleep from "./support/sleep";

describe("some", () => {
  it("some true", () => {
    return async
      .some([3, 1, 2], async x => {
        await sleep(0);
        return x === 1;
      })
      .then(result => {
        expect(result).toEqual(true);
      });
  });

  it("some false", () => {
    return async
      .some([3, 1, 2], async x => {
        await sleep(0);
        return x === 10;
      })
      .then(result => {
        expect(result).toEqual(false);
      });
  });

  it("some early return", async () => {
    const callOrder = [];
    async
      .some([1, 2, 3], async x => {
        await sleep(x * 5);
        callOrder.push(x);
        return x === 1;
      })
      .then(() => {
        callOrder.push("callback");
      });
    await sleep(25);
    expect(callOrder).toEqual([1, "callback", 2, 3]);
  });

  it("some error", () => {
    return async
      .some([3, 1, 2], async x => {
        await sleep(0);
        throw new Error("error");
      })
      .catch(err => err)
      .then(err => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual("error");
      });
  });

  // Removed 'some no callback', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/mocha_test/some.js#L53

  it("someLimit true", () => {
    return async
      .someLimit([3, 1, 2], 2, async x => {
        await sleep(0);
        return x === 2;
      })
      .then(result => {
        expect(result).toEqual(true);
      });
  });

  it("someLimit false", () => {
    return async
      .someLimit([3, 1, 2], 2, async x => {
        await sleep(0);
        return x === 10;
      })
      .then(result => {
        expect(result).toEqual(false);
      });
  });

  it("someLimit short-circuit", () => {
    let calls = 0;
    return async
      .someLimit([3, 1, 2], 1, async x => {
        calls++;
        return x === 1;
      })
      .then(result => {
        expect(result).toEqual(true);
        expect(calls).toEqual(2);
      });
  });

  it("someSeries doesn't cause stack overflow (#1293)", () => {
    const arr = Array.from({ length: 10000 });
    let calls = 0;
    return async
      .someSeries(arr, async data => {
        calls += 1;
        await sleep(0);
        return true;
      })
      .then(() => {
        expect(calls).toEqual(1);
      });
  });

  it("someLimit doesn't cause stack overflow (#1293)", () => {
    const arr = Array.from({ length: 10000 });
    let calls = 0;
    return async
      .someLimit(arr, 100, async data => {
        calls += 1;
        await sleep(0);
        return true;
      })
      .then(() => {
        expect(calls).toEqual(100);
      });
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

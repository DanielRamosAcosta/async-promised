import assert from "assert";
import * as async from "../lib";
import sleep from "./support/sleep";

describe("map", () => {
  const mapIteratee = (callOrder: number[]) => async (x: number) => {
    await sleep(x * 25);
    callOrder.push(x);
    return x * 2;
  };

  it("basic", () => {
    const callOrder: number[] = [];

    return async.map([1, 3, 2], mapIteratee(callOrder)).then(results => {
      expect(callOrder).toEqual([1, 2, 3]);
      expect(results).toEqual([2, 6, 4]);
    });
  });

  it("with reflect", () => {
    const callOrder: number[] = [];

    return async
      .map([1, 3, 2], async.reflect(mapIteratee(callOrder)))
      .then(results => {
        expect(callOrder).toEqual([1, 2, 3]);
        expect(results).toEqual([
          {
            value: 2
          },
          {
            value: 6
          },
          {
            value: 4
          }
        ]);
      });
  });

  it("error with reflect", () => {
    const callOrder: number[] = [];
    return async
      .map(
        [-1, 1, 3, 2],
        async.reflect(async (item: number) => {
          await sleep(item * 25);
          callOrder.push(item);
          if (item < 0) {
            throw new Error("number less then zero");
          }
          return item * 2;
        })
      )
      .then(results => {
        expect(callOrder).toEqual([-1, 1, 2, 3]);
        expect(results).toEqual([
          {
            error: new Error("number less then zero")
          },
          {
            value: 2
          },
          {
            value: 6
          },
          {
            value: 4
          }
        ]);
      });
  });

  it("map original untouched", () => {
    const a = [1, 2, 3];
    async
      .map(a, async x => {
        return x * 2;
      })
      .then(results => {
        expect(results).toEqual([2, 4, 6]);
        expect(a).toEqual([1, 2, 3]);
      });
  });

  // Removed 'dont catch errors in the callback', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/test/map.js#L83

  it("map error", () => {
    return async
      .map([1, 2, 3], async () => {
        throw new Error("error");
      })
      .catch(err => err)
      .then(err => {
        expect(err).toEqual(new Error("error"));
      });
  });

  it("map undefined array", () => {
    return (
      async
        // @ts-ignore
        .map(undefined, async () => {})
        .then((result: any[]) => {
          expect(result).toEqual([]);
        })
    );
  });

  it("map object", () => {
    return async
      .map({ a: 1, b: 2, c: 3 }, async (val: number) => {
        return val * 2;
      })
      .then(result => {
        expect(Object.prototype.toString.call(result)).toEqual(
          "[object Array]"
        );
        expect(result).toContain(2);
        expect(result).toContain(4);
        expect(result).toContain(6);
      });
  });

  it("mapSeries", () => {
    const callOrder: number[] = [];
    async.mapSeries([1, 3, 2], mapIteratee(callOrder)).then(results => {
      expect(callOrder).toEqual([1, 3, 2]);
      expect(results).toEqual([2, 6, 4]);
    });
  });

  it("mapSeries error", () => {
    return async
      .mapSeries([1, 2, 3], async () => {
        throw new Error("error");
      })
      .catch(err => err)
      .then(err => {
        expect(err).toEqual(new Error("error"));
      });
  });

  it("mapSeries undefined array", () => {
    return (
      async
        // @ts-ignore
        .mapSeries(undefined, async () => {})
        .then((result: any[]) => {
          expect(result).toEqual([]);
        })
    );
  });

  it("mapSeries object", () => {
    return async
      .mapSeries({ a: 1, b: 2, c: 3 }, async val => {
        return val * 2;
      })
      .then(result => {
        expect(result).toContain(2);
        expect(result).toContain(4);
        expect(result).toContain(6);
      });
  });

  it("mapLimit", () => {
    const callOrder: number[] = [];
    async.mapLimit([2, 4, 3], 2, mapIteratee(callOrder)).then(results => {
      expect(callOrder).toEqual([2, 4, 3]);
      expect(results).toEqual([4, 8, 6]);
    });
  });

  it("mapLimit empty array", done => {
    async
      .mapLimit([], 2, async () => {
        done(new Error("iteratee should not be called"));
      })
      .then(() => {
        assert(true, "should call callback");
        done();
      });
  });

  it("mapLimit undefined array", () => {
    return (
      async
        // @ts-ignore
        .mapLimit(undefined, 2, async () => {})
        .then((result: any[]) => {
          expect(result).toEqual([]);
        })
    );
  });

  it("mapLimit limit exceeds size", () => {
    const callOrder: number[] = [];
    return async
      .mapLimit([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 20, mapIteratee(callOrder))
      .then(results => {
        expect(callOrder).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        expect(results).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
      });
  });

  it("mapLimit limit equal size", () => {
    const callOrder: number[] = [];
    return async
      .mapLimit([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, mapIteratee(callOrder))
      .then(results => {
        expect(callOrder).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        expect(results).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
      });
  });

  it("mapLimit zero limit", done => {
    return async
      .mapLimit([0, 1, 2, 3, 4, 5], 0, async () => {
        done(new Error("iteratee should not be called"));
      })
      .then(results => {
        expect(results).toEqual([]);
        assert(true, "should call callback");
        done();
      });
  });

  it("mapLimit error", () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const callOrder: number[] = [];

    return async
      .mapLimit(arr, 3, async x => {
        await sleep(45);
        callOrder.push(x);
        if (x === 2) {
          throw new Error("error");
        }
      })
      .catch(err => err)
      .then(err => {
        expect(callOrder).toEqual([0, 1, 2]);
        expect(err).toEqual(new Error("error"));
      });
  });

  it("mapLimit does not continue replenishing after error", done => {
    let started = 0;
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const delay = 10;
    const limit = 3;
    const maxTime = 10 * arr.length;

    async
      .mapLimit(arr, limit, async x => {
        started++;
        if (started === 3) {
          throw new Error("Test Error");
        }
        await sleep(delay);
      })
      .catch(err => {});

    setTimeout(() => {
      expect(started).toEqual(3);
      done();
    }, maxTime);
  });

  it("map with Map", () => {
    const map = new Map<number, string>();
    map.set(1, "a");
    map.set(2, "b");

    return async
      .map<string, string>(map, async val => val)
      .then(result => {
        assert(
          Array.isArray(result),
          "map should return an array for an iterable"
        );
      });
  });

  // Removed 'map main callback is called only once', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/test/map.js#L348
});

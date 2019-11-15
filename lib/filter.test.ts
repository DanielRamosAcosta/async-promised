import * as async from ".";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function filterIteratee(x: number): Promise<boolean> {
  await sleep(x * 5);
  return !!(x % 2);
}

function testLimit<T>(
  arr: T[],
  limitFunc: (
    arr: async.Dictionary<T> | T[] | IterableIterator<T>,
    limit: number,
    iterator: (item: T) => Promise<boolean>
  ) => Promise<Array<T | undefined>>,
  limit: number,
  iter: (item: T) => Promise<boolean>
): Promise<Array<T | undefined>> {
  const args = [];

  return limitFunc(arr, limit, x => {
    args.push(x);
    return iter(x);
  }).then(result => {
    expect(args).toEqual(arr);
    return result;
  });
}

describe("filter", () => {
  it("filter", () => {
    async.filter([3, 2, 1], filterIteratee).then(results => {
      expect(results).toEqual([3, 1]);
    });
  });
  it("filter original untouched", () => {
    const a = [3, 1, 2];
    return async.filter(a, filterIteratee).then(results => {
      expect(results).toEqual([3, 1]);
      expect(a).toEqual([3, 1, 2]);
    });
  });
  it("filter collection", () => {
    const a = { a: 3, b: 1, c: 2 };
    return async
      .filter(a, async x => !!(x % 2))
      .then(results => {
        expect(results).toEqual([3, 1]);
        expect(a).toEqual({ a: 3, b: 1, c: 2 });
      });
  });
  if (typeof Symbol === "function" && Symbol.iterator) {
    function makeIterator(array) {
      let nextIndex;
      const iterator = {
        next() {
          return nextIndex < array.length
            ? {
                done: false,
                value: array[nextIndex++]
              }
            : {
                done: true
              };
        }
      };
      iterator[Symbol.iterator] = () => {
        nextIndex = 0; // reset iterator
        return iterator;
      };
      return iterator;
    }
    it("filter iterator", () => {
      const a = makeIterator([500, 20, 100]);
      return async
        .filter(a, async x => x > 20)
        .then(results => {
          expect(results).toEqual([500, 100]);
        });
    });
  }
  it("filter error", () => {
    return async
      .filter([3, 1, 2], async x => {
        throw new Error("error");
      })
      .catch(err => err)
      .then(err => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual("error");
      });
  });
  it("filterSeries", () => {
    return async.filterSeries([3, 1, 2], filterIteratee).then(results => {
      expect(results).toEqual([3, 1]);
    });
  });
  it("select alias", () => {
    expect(async.select).toEqual(async.filter);
  });
  it("selectSeries alias", () => {
    expect(async.selectSeries).toEqual(async.filterSeries);
  });
  it("filterLimit", () => {
    return testLimit([5, 4, 3, 2, 1], async.filterLimit, 2, async x => {
      return !!(x % 2);
    }).then(result => {
      expect(result).toEqual([5, 3, 1]);
    });
  });
});

describe("reject", () => {
  it("reject", () => {
    return async.reject([3, 2, 1], filterIteratee).then(results => {
      expect(results).toEqual([2]);
    });
  });
  it("reject original untouched", () => {
    const a = [3, 1, 2];
    return async
      .reject(a, async x => !!(x % 2))
      .catch(err => {
        expect(err).toEqual(null);
      })
      .then(results => {
        expect(results).toEqual([2]);
        expect(a).toEqual([3, 1, 2]);
      });
  });
  it("reject error", () => {
    return async
      .reject([3, 1, 2], async x => {
        throw new Error("error");
      })
      .catch(err => err)
      .then(err => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual("error");
      });
  });
  it("rejectSeries", () => {
    return async.reject([3, 2, 1], filterIteratee).then(results => {
      expect(results).toEqual([2]);
    });
  });
  it("rejectLimit", () => {
    return testLimit([5, 4, 3, 2, 1], async.rejectLimit, 2, async x => {
      return !!(x % 2);
    }).then(result => {
      expect(result).toEqual([4, 2]);
    });
  });
  it("filter fails", () => {
    return async
      .filter({ a: 1, b: 2, c: 3 }, async item => {
        if (item === 3) {
          throw new Error("error");
        }
        return true;
      })
      .catch(err => err)
      .then(err => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual("error");
      });
  });
});

import { expect } from 'chai';
import async = require('../lib');

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
  })
  .then(result => {
    expect(args).to.eql(arr);
    return result;
  });
}

describe('filter', () => {
  it('filter', () =>
    async.filter([3, 2, 1], filterIteratee)
      .catch(err => {
        expect(err).to.equal(null);
      })
      .then(results => {
        expect(results).to.eql([3, 1]);
      })
  );
  it('filter original untouched', () => {
    const a = [3, 1, 2];
    return async.filter(a, filterIteratee)
      .catch(err => {
        expect(err).to.equal(null);
      })
      .then(results => {
        expect(results).to.eql([3, 1]);
        expect(a).to.eql([3, 1, 2]);
      });
  });
  it('filter collection', () => {
    const a = {a: 3, b: 1, c: 2};
    return async.filter(a, async x => !!(x % 2))
      .catch(err => {
        expect(err).to.equal(null);
      })
      .then(results => {
        expect(results).to.eql([3, 1]);
        expect(a).to.eql({a: 3, b: 1, c: 2});
      });
  });
  if (typeof Symbol === 'function' && Symbol.iterator) {
    function makeIterator(array) {
      let nextIndex;
      const iterator = {
        next() {
          return nextIndex < array.length ? {
            done: false,
            value: array[nextIndex++]
          } : {
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
    it('filter iterator', () => {
      const a = makeIterator([500, 20, 100]);
      return async.filter(a, async x => x > 20)
        .catch(err => {
          expect(err).to.equal(null);
        })
        .then(results => {
          expect(results).to.eql([500, 100]);
        });
    });
  }
  it('filter error', () => {
    return async.filter([3, 1, 2], async x => {
      throw new Error('error');
    })
    .catch(err => {
      expect(err.message).to.equal('error');
    })
    .then(results => {
      expect(results).to.not.exist;
    });
  });
  it('filterSeries', () => {
    return async.filterSeries([3, 1, 2], filterIteratee)
      .catch(err => {
        expect(err).to.equal(null);
      })
      .then(results => {
        expect(results).to.eql([3, 1]);
      });
  });
  it('select alias', () => {
    expect(async.select).to.equal(async.filter);
  });
  it('selectSeries alias', () => {
    expect(async.selectSeries).to.equal(async.filterSeries);
  });
  it('filterLimit', () => {
    return testLimit([5, 4, 3, 2, 1], async.filterLimit, 2, async x => {
      return !!(x % 2);
    })
    .catch(err => {
      expect(err).to.not.exist;
    })
    .then(result => {
      expect(result).to.eql([5, 3, 1]);
    });
  });
});

describe('reject', () => {
  it('reject', () => {
    return async.reject([3, 2, 1], filterIteratee)
      .catch(err => {
        expect(err).to.equal(null);
      })
      .then(results => {
        expect(results).to.eql([2]);
      });
  });
  it('reject original untouched', () => {
    const a = [3, 1, 2];
    return async.reject(a, async x => !!(x % 2))
      .catch(err => {
        expect(err).to.equal(null);
      })
      .then(results => {
        expect(results).to.eql([2]);
        expect(a).to.eql([3, 1, 2]);
      });
  });
  it('reject error', () => {
    return async.reject([3, 1, 2], async x => {
      throw new Error('error');
    })
    .catch(err => {
      expect(err.message).to.equal('error');
    })
    .then(results => {
      expect(results).to.not.exist;
    });
  });
  it('rejectSeries', () =>
    async.reject([3, 2, 1], filterIteratee)
      .catch(err => {
        expect(err).to.equal(null);
      })
      .then(results => {
        expect(results).to.eql([2]);
      })
  );
  it('rejectLimit', () => {
    return testLimit([5, 4, 3, 2, 1], async.rejectLimit, 2, async x => {
      return !!(x % 2);
    })
    .catch(err => {
      expect(err).to.not.exist;
    })
    .then(result => {
      expect(result).to.eql([4, 2]);
    });
  });
  it('filter fails', () => {
    return async.filter({a: 1, b: 2, c: 3}, async item => {
      if (item === 3) {
        throw new Error('error');
      }
      return true;
    })
    .then(results => {
      expect(results).to.not.exist;
    })
    .catch(err => {
      expect(err.message).to.equal('error');
    });
  });
});

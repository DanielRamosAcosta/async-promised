import * as assert from 'assert';
import { expect } from 'chai';
import * as async from '../lib';
import sleep from './support/sleep';

describe('each', () => {
  async function promiseEachIteratee(args, x) {
    await sleep(x * 25);
    args.push(x);
  }

  it('each', () => {
    const args = [];
    return async.each([1, 3, 2], promiseEachIteratee.bind(null, args))
      .catch(err => {
        expect(err).to.not.exist;
      })
      .then(() => {
        expect(args).to.eql([1, 2, 3]);
      });
  });

  // Removed 'each extra callback', there cannot be extra callback calls with async functions
  // https://github.com/caolan/async/blob/b870cd1ea6b795e0cb8116478261217c44604310/mocha_test/each.js#L29

  it('each empty array', () => {
    let count = 0;
    return async.each([], async x => {
      count += 1;
    })
    .catch(err => {
      expect(err).to.not.exist;
    })
    .then(() => {
      expect(count).to.equal(0);
    });
  });

  it('each empty array, with other property on the array', () => {
    const myArray: any = [];
    myArray.myProp = 'anything';
    let count = 0;
    return async.each(myArray, async x => {
      count += 1;
    })
    .catch(err => {
      expect(err).to.not.exist;
    })
    .then(() => {
      expect(count).to.equal(0);
    });
  });

  it('each error', () => {
    return async.each([1, 2, 3], async x => {
      throw new Error('error');
    })
    .catch(err => err)
    .then(err => {
      expect(err.message).to.equal('error');
    });
  });

  it('each no callback', () => {
    return async.each([1], async x => {
      expect(x).to.equal(1);
    });
  });

  it('eachSeries', () => {
    const args = [];
    return async.eachSeries([1, 3, 2], promiseEachIteratee.bind(null, args))
      .catch(err => {
        expect(err).to.not.exist;
      })
      .then(() => {
        expect(args).to.eql([1, 3, 2]);
      });
  });

  it('eachSeries empty array', () => {
    let count = 0;
    return async.eachSeries([], async x => {
      count += 1;
    })
    .catch(err => {
      expect(err).to.not.exist;
    })
    .then(() => {
      expect(count).to.equal(0);
    });
  });

  it('eachSeries array modification', () => {
    const arr = [1, 2, 3, 4];
    const prom = async.eachSeries(arr, async x => {
      await async.setImmediate();
    })
    .then(() => {
      assert(true, 'should call callback');
    });

    arr.pop();
    arr.splice(0, 1);

    return prom;
  });

  // Removed 'eachSeries single item', as it should have been removed from v2.0.0
  // https://github.com/caolan/async/blob/b870cd1ea6b795e0cb8116478261217c44604310/mocha_test/each.js#L116

  // Removed 'eachSeries single item', as it should have been removed from v2.0.0
  // https://github.com/caolan/async/blob/b870cd1ea6b795e0cb8116478261217c44604310/mocha_test/each.js#L128

  it('eachSeries error', () => {
    const callOrder = [];
    return async.eachSeries([1, 2, 3], async x => {
      callOrder.push(x);
      throw new Error('error');
    })
    .catch(err => err)
    .then(err => {
      expect(callOrder).to.eql([1]);
      expect(err.message).to.equal('error');
    });
  });

  it('eachSeries no callback', () => {
    return async.eachSeries([1], async x => {
      expect(x).to.equal(1);
    });
  });

  it('eachLimit', () => {
    const args = [];
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    return async.eachLimit(arr, 2, async x => {
      await sleep(x * 5);
      args.push(x);
    })
    .catch(err => {
      expect(err).to.not.exist;
    })
    .then(() => {
      expect(args).to.eql(arr);
    });
  });

  it('eachLimit empty array', () => {
    let count = 0;
    return async.eachLimit([], 2, async x => {
        count += 1;
    })
    .catch(err => {
      expect(err).to.not.exist;
    })
    .then(() => {
      expect(count).to.equal(0);
    });
  });

  it('eachLimit limit exceeds size', () => {
    const args = [];
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    return async.eachLimit(arr, 20, promiseEachIteratee.bind(null, args))
      .catch(err => {
        expect(err).to.not.exist;
      })
      .then(() => {
        expect(args).to.eql(arr);
      });
  });

  it('eachLimit limit equal size', () => {
    const args = [];
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    return async.eachLimit(arr, 10, promiseEachIteratee.bind(null, args))
      .catch(err => {
        expect(err).to.not.exist;
      })
      .then(() => {
        expect(args).to.eql(arr);
      });
  });

  it('eachLimit zero limit', () => {
    let count = 0;
    return async.eachLimit([0, 1, 2, 3, 4, 5], 0, async x => {
      count += 1;
    })
    .catch(err => {
      expect(err).to.not.exist;
    })
    .then(() => {
      assert(true, 'should call callback');
    });
  });

  it('eachLimit error', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const callOrder = [];

    return async.eachLimit(arr, 3, async x => {
      callOrder.push(x);
      if (x === 2) {
        throw new Error('error');
      }
      await sleep(1000);
    })
    .catch(err => err)
    .then(err => {
      expect(callOrder).to.eql([0, 1, 2]);
      expect(err.message).to.equal('error');
    });
  });

  it('eachLimit no callback', () => {
    return async.eachLimit([1], 1, async x => {
      expect(x).to.equal(1);
    });
  });

  it('eachLimit synchronous', () => {
    const args = [];
    const arr = [0, 1, 2];
    return async.eachLimit(arr, 5, async x => {
      args.push(x);
    })
    .catch(err => {
      expect(err).to.not.exist;
    })
    .then(() => {
      expect(args).to.eql(arr);
    });
  });

  it('eachLimit does not continue replenishing after error', () => {
    let started = 0;
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const delay = 10;
    const limit = 3;
    const maxTime = 10 * arr.length;

    return async.eachLimit(arr, limit, async x => {
      started++;
      if (started === 3) {
        throw new Error('Test Error');
      }
      await sleep(delay);
    })
    .catch(err => err)
    .then(err => {
      expect(started).to.equal(3);
      expect(err.message).to.equal('Test Error');
    });
  });

  it('forEach alias', () => {
    assert.strictEqual(async.each, async.forEach);
  });

  it('forEachSeries alias', () => {
    assert.strictEqual(async.eachSeries, async.forEachSeries);
  });

  it('forEachLimit alias', () => {
    assert.strictEqual(async.eachLimit, async.forEachLimit);
  });
});

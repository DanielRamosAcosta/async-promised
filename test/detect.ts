import { expect } from 'chai';
import * as _ from 'lodash';
import * as async from '../lib';

import sleep from './support/sleep';

describe('detect', () => {
  const createCallOrderDetector = callOrder => async x => {
    await sleep(x * 5);
    callOrder.push(x);
    return x === 2;
  };

  it('detect', async () => {
    const callOrder = [];
    await async.detect([3, 2, 1], createCallOrderDetector(callOrder))
      .catch(err => {
        expect(err).to.equal(null);
      })
      .then(result => {
        callOrder.push('callback');
        expect(result).to.equal(2);
      });

    await sleep(20);

    expect(callOrder).to.eql([1, 2, 'callback', 3]);
  });

  it('detect - mulitple matches', async () => {
    const callOrder = [];
    await async.detect([3, 2, 2, 1, 2], createCallOrderDetector(callOrder))
      .catch(err => {
        expect(err).to.equal(null);
      })
      .then(result => {
        callOrder.push('callback');
        expect(result).to.equal(2);
      });

    await sleep(20);

    expect(callOrder).to.eql([1, 2, 2, 2, 'callback', 3]);
  });

  it('detect error', async () => {
    await async.detect([3, 2, 1], async x => {
      await sleep(0);
      throw new Error('error');
    })
    .catch(err => err)
    .then(err => {
      expect(err.message).to.equal('error');
    });
  });

  it('detectSeries', async () => {
    const callOrder = [];

    await async.detectSeries([3, 2, 1], createCallOrderDetector(callOrder))
      .catch(err => {
        expect(err).to.equal(null);
      })
      .then(result => {
        callOrder.push('callback');
        expect(result).to.equal(2);
      });

    expect(callOrder).to.eql([3, 2, 'callback']);
  });

  it('detectSeries - multiple matches', async () => {
    const callOrder = [];

    await async.detectSeries([3, 2, 2, 1, 2], createCallOrderDetector(callOrder))
    .catch(err => {
      expect(err).to.equal(null);
    })
    .then(result => {
      callOrder.push('callback');
      expect(result).to.equal(2);
    });

    expect(callOrder).to.eql([3, 2, 'callback']);
  });

  // Removed 'detect no callback', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/mocha_test/detect.js#L76

  it('detectSeries - ensure stop', () => {
    return async.detectSeries([1, 2, 3, 4, 5], async num => {
      if (num > 3) {
        throw new Error('detectSeries did not stop iterating');
      }
      return num === 3;
    })
    .catch(err => {
      expect(err).to.equal(null);
    })
    .then(result => {
      expect(result).to.equal(3);
    });
  });

  it('detectLimit', async () => {
    const callOrder = [];

    await async.detectLimit([3, 2, 1], 2, createCallOrderDetector(callOrder))
    .catch(err => {
      expect(err).to.equal(null);
    })
    .then(result => {
      callOrder.push('callback');
      expect(result).to.equal(2);
    });

    await sleep(20);

    expect(callOrder).to.eql([2, 'callback', 3]);
  });

  it('detectLimit - multiple matches', async () => {
    const callOrder = [];

    await async.detectLimit([3, 2, 2, 1, 2], 2, createCallOrderDetector(callOrder))
    .catch(err => {
      expect(err).to.equal(null);
    })
    .then(result => {
      callOrder.push('callback');
      expect(result).to.equal(2);
    });

    await sleep(40);

    expect(callOrder).to.eql([2, 'callback', 3]);
  });

  it('detectLimit - ensure stop', () => {
    return async.detectLimit([3, 2, 2, 1, 2], 2, async num => {
      if (num > 4) {
        throw new Error('detectLimit did not stop iterating');
      }
      return num === 3;
    })
    .catch(err => {
      expect(err).to.equal(null);
    })
    .then(result => {
      expect(result).to.equal(3);
    });
  });

  it('detectSeries doesn\'t cause stack overflow (#1293)', async () => {
    const arr = _.range(10000);
    let calls = 0;

    return async.detectSeries(arr, async data => {
      calls += 1;
      await async.setImmediate();
      return true;
    })
    .catch(err => {
      expect(err).to.equal(null);
    })
    .then(() => {
      expect(calls).to.equal(1);
    });
  });

  it('detectLimit doesn\'t cause stack overflow (#1293)', async () => {
    const arr = _.range(10000);
    let calls = 0;

    return async.detectLimit(arr, 100, async data => {
      calls += 1;
      await async.setImmediate();
      return true;
    })
    .catch(err => {
      expect(err).to.equal(null);
    })
    .then(() => {
      expect(calls).to.equal(100);
    });
  });

  it('find alias', () => {
    expect(async.find).to.equal(async.detect);
  });

  it('findLimit alias', () => {
    expect(async.findLimit).to.equal(async.detectLimit);
  });

  it('findSeries alias', () => {
    expect(async.findSeries).to.be.a('function');
    expect(async.findSeries).to.equal(async.detectSeries);
  });
});

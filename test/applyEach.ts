import * as async from '../lib';
import sleep from './support/sleep';

describe('applyEach', () => {
  it('applyEach', () => {
    const callOrder = [];
    const one = async val => {
      expect(val).toEqual(5);
      await sleep(12);
      callOrder.push('one');
      return 1;
    };
    const two = async val => {
      expect(val).toEqual(5);
      await sleep(2);
      callOrder.push('two');
      return 2;
    };
    const three = async val => {
      expect(val).toEqual(5);
      await sleep(18);
      callOrder.push('three');
      return 3;
    };

    return async.applyEach([one, two, three], 5)
      .then(results => {
        expect(callOrder).toEqual(['two', 'one', 'three']);
        expect(results).toEqual([1, 2, 3]);
      });
  });

  it('applyEachSeries', () => {
    const callOrder = [];

    const one = async val => {
      expect(val).toEqual(5);
      await sleep(10);
      callOrder.push('one');
      return 1;
    };
    const two = async val => {
      expect(val).toEqual(5);
      await sleep(5);
      callOrder.push('two');
      return 2;
    };
    const three = async val => {
      expect(val).toEqual(5);
      await sleep(15);
      callOrder.push('three');
      return 3;
    };

    return async.applyEachSeries([one, two, three], 5)
      .then(results => {
        expect(callOrder).toEqual(['one', 'two', 'three']);
        expect(results).toEqual([1, 2, 3]);
      });
    });
  });

it('applyEach partial application', () => {
  const callOrder = [];
  const one = async val => {
    expect(val).toEqual(5);
    await sleep(30);
    callOrder.push('one');
    return 1;
  };
  const two = async val => {
    expect(val).toEqual(5);
    await sleep(15);
    callOrder.push('two');
    return 2;
  };
  const three = async val => {
    expect(val).toEqual(5);
    await sleep(45);
    callOrder.push('three');
    return 3;
  };

  const fn = async.applyEach([one, two, three]);
  return fn(5)
    .catch(err => {
      respect(err).to.not.exist;
    })
    .then(results => {
      expect(callOrder).toEqual(['two', 'one', 'three']);
      expect(results).toEqual([1, 2, 3]);
    });
  });
})

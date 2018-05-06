import * as async from '../lib';

describe('setImmediate', () => {
  it('basics', async () => {
    const callOrder = [];
    const prom = async.setImmediate()
      .then(() => {
        callOrder.push('two');
      });

    callOrder.push('one');
    await prom;
    expect(callOrder).toEqual(['one', 'two']);
  });

  /**
   * A promise can't be resolved with multiple values. Mulitple args will be
   * resolved with an array.
   */
  it('extra args', () => {
    return async.setImmediate(1, 2, 3).then(args => {
      expect(args).toEqual([1, 2, 3]);
    });
  });
});

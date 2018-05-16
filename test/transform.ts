import transform from '../lib/transform';
import sleep from './support/sleep';
const async = { transform };

describe('transform', () => {
  it('transform implictly determines memo if not provided', () => {
    return async
      .transform([1, 2, 3], async (memo, x, v) => {
        memo.push(x + 1);
      })
      .then(result => {
        expect(result).toEqual([2, 3, 4]);
      });
  });

  it('transform async with object memo', () => {
    return async
      .transform([1, 3, 2], {}, async (memo, v, k) => {
        await sleep(0);
        memo[k] = v;
      })
      .then(result => {
        expect(result).toEqual({
          0: 1,
          1: 3,
          2: 2
        });
      });
  });

  it('transform iterating object', () => {
    async
      .transform({ a: 1, b: 3, c: 2 }, async (memo, v, k) => {
        await sleep(0);
        memo[k] = v + 1;
      })
      .then(result => {
        expect(result).toEqual({ a: 2, b: 4, c: 3 });
      });
  });

  it('transform error', () => {
    return async
      .transform([1, 2, 3], async (a, v, k) => {
        throw new Error('error');
      })
      .catch(err => err)
      .then(err => {
        expect(err).toEqual(new Error('error'));
      });
  });

  it('transform with two arguments', () => {
    return async.transform([1, 2, 3], async (a, v, k) => {
      return null;
    });
  });
});

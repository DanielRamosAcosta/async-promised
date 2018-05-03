import * as async from '../lib';
import sleep from './support/sleep';

describe('compose', () => {
  describe('all functions succeed', () => {
    it('yields the result of the composition of the functions', () => {
      const add2 = async (n: number) => {
        await sleep(0);
        return  n + 2;
      };
      const mul3 = async (n: number) => {
        await sleep(0);
        return n * 3;
      };
      const add1 = async (n: number) => {
        await sleep(0);
        return n + 1;
      };
      const add2mul3add1 = async.compose(add1, mul3, add2);

      return add2mul3add1(3)
        .then(result => {
          expect(result).toEqual(16);
        });
    });
  });

  describe('a function errors', () => {
    it('yields the error and does not call later functions', () => {
      let add1called = false;
      const mul3error = new Error('mul3 error');
      const add2 = async (n: number) => {
        await sleep(0);
        return  n + 2;
      };
      const mul3 = async (n: number) => {
        await sleep(0);
        throw mul3error;
      };
      const add1 = async (n: number) => {
        add1called = true;
        await sleep(0);
        return n + 1;
      };
      const add2mul3add1 = async.compose(add1, mul3, add2);
      return add2mul3add1(3)
        .catch(err => err)
        .then(err => {
          expect(err).toEqual(mul3error);
          expect(add1called).toBeFalsy();
        });
    });
  });

  it('calls each function with the binding of the composed function', () => {
    const context = {};
    let add2Context = null;
    let mul3Context = null;
    const add2 = async function(n: number) {
      add2Context = this;
      await sleep(0);
      return n + 2;
    };

    const mul3 = async function(n: number) {
      mul3Context = this;
      await sleep(0);
      return n * 3;
    };

    const add2mul3 = async.compose(mul3, add2);

    return add2mul3.call(context, 3)
      .then(result => {
        expect(result).toEqual(15);
        expect(add2Context).toEqual(context);
        expect(mul3Context).toEqual(context);
      });
  });
});

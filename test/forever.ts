import * as async from '../lib';

describe('forever', () => {
  describe('function is asynchronous', () => {
    it('executes the function over and over until it yields an error', async () => {
      let counter = 0;
      async function addOne() {
        counter++;
        if (counter === 50) {
          throw new Error('too big!');
        }
        await async.setImmediate();
      }
      return async.forever(addOne)
        .catch(err => err)
        .then(err => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toEqual('too big!');
        });
    });
  });

  describe('function is synchronous', () => {
    it('does not cause a stack overflow @nodeonly', async () => {
      // this will take forever in a browser
      let counter = 0;
      function addOne() {
        counter++;
        if (counter === 50000) {
          // needs to be huge to potentially overflow stack in node
          throw new Error('too big!');
        }
      }
      return async.forever(addOne)
        .catch(err => err)
        .then(err => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toEqual('too big!');
          expect(counter).toEqual(50000);
        });
    });
  });
});

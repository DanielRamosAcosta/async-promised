import * as async from 'async';
import { expect } from 'chai';

describe('forever', () => {
  describe('function is asynchronous', () => {
    it('executes the function over and over until it yields an error', done => {
      let counter = 0;
      function addOne(callback) {
        counter++;
        if (counter === 50) {
          return callback('too big!');
        }
        async.setImmediate(() => {
          callback();
        });
      }
      async.forever(addOne, err => {
        expect(err).to.eql('too big!');
        expect(counter).to.eql(50);
        done();
      });
    });
  });

  describe('function is synchronous', () => {
    it('does not cause a stack overflow @nodeonly', done => {
      // this will take forever in a browser
      let counter = 0;
      function addOne(callback) {
        counter++;
        if (counter === 50000) {
          // needs to be huge to potentially overflow stack in node
          return callback('too big!');
        }
        callback();
      }
      async.forever(addOne, err => {
        expect(err).to.eql('too big!');
        expect(counter).to.eql(50000);
        done();
      });
    });
  });
});

import * as async from 'async';
import { expect } from 'chai';

describe('compose', () => {
  describe('all functions succeed', () => {
    it('yields the result of the composition of the functions', done => {
      const add2 = (n, cb) => {
        setTimeout(() => {
          cb(null, n + 2);
        });
      };
      const mul3 = (n, cb) => {
        setTimeout(() => {
          cb(null, n * 3);
        });
      };
      const add1 = (n, cb) => {
        setTimeout(() => {
          cb(null, n + 1);
        });
      };
      const add2mul3add1 = async.compose(add1, mul3, add2);
      add2mul3add1(3, (err, result) => {
        expect(err).to.not.exist;
        expect(result).to.eql(16);
        done();
      });
    });
  });

  describe('a function errors', () => {
    it('yields the error and does not call later functions', done => {
      let add1called = false;
      const mul3error = new Error('mul3 error');
      const add2 = (n, cb) => {
        setTimeout(() => {
          cb(null, n + 2);
        });
      };
      const mul3 = (n, cb) => {
        setTimeout(() => {
          cb(mul3error);
        });
      };
      const add1 = (n, cb) => {
        add1called = true;
        setTimeout(() => {
          cb(null, n + 1);
        });
      };
      const add2mul3add1 = async.compose(add1, mul3, add2);
      add2mul3add1(3, (err, result) => {
        expect(err).to.eql(mul3error);
        expect(result).to.not.exist;
        expect(add1called).to.be.false;
        done();
      });
    });
  });

  it('calls each function with the binding of the composed function', done => {
    const context = {};
    let add2Context = null;
    let mul3Context = null;
    const add2 = function(n, cb) {
      add2Context = this;
      setTimeout(() => {
        cb(null, n + 2);
      });
    };
    const mul3 = function(n, cb) {
      mul3Context = this;
      setTimeout(() => {
        cb(null, n * 3);
      });
    };
    const add2mul3 = async.compose(mul3, add2);
    add2mul3.call(context, 3, (err, result) => {
      expect(err).to.not.exist;
      expect(result).to.eql(15);
      expect(add2Context).to.equal(context);
      expect(mul3Context).to.equal(context);
      done();
    });
  });
});

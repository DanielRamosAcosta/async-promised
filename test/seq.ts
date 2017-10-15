import * as assert from 'assert';
import * as async from 'async';
import { expect } from 'chai';

describe('seq', () => {
  it('seq', done => {
    const add2 = (n, cb) => {
      expect(n).to.equal(3);
      setTimeout(() => {
        cb(null, n + 2);
      }, 50);
    };
    const mul3 = (n, cb) => {
      expect(n).to.equal(5);
      setTimeout(() => {
        cb(null, n * 3);
      }, 15);
    };
    const add1 = (n, cb) => {
      expect(n).to.equal(15);
      setTimeout(() => {
        cb(null, n + 1);
      }, 100);
    };
    const add2mul3add1 = async.seq(add2, mul3, add1);
    add2mul3add1(3, (err, result) => {
      if (err) {
        return done(err);
      }
      assert(err === null, `${err} passed instead of 'null'`);
      expect(result).to.equal(16);
      done();
    });
  });

  it('seq error', done => {
    const testerr = new Error('test');

    const add2 = (n, cb) => {
      expect(n).to.equal(3);
      setTimeout(() => {
        cb(null, n + 2);
      }, 50);
    };
    const mul3 = (n, cb) => {
      expect(n).to.equal(5);
      setTimeout(() => {
        cb(testerr);
      }, 15);
    };
    const add1 = (n, cb) => {
      assert(false, 'add1 should not get called');
      setTimeout(() => {
        cb(null, n + 1);
      }, 100);
    };
    const add2mul3add1 = async.seq(add2, mul3, add1);
    add2mul3add1(3, err => {
      expect(err).to.equal(testerr);
      done();
    });
  });

  it('seq binding', done => {
    const testcontext = { name: 'foo' };

    const add2 = function(n, cb) {
      expect(this).to.equal(testcontext);
      setTimeout(() => {
        cb(null, n + 2);
      }, 50);
    };
    const mul3 = function(n, cb) {
      expect(this).to.equal(testcontext);
      setTimeout(() => {
        cb(null, n * 3);
      }, 15);
    };
    const add2mul3 = async.seq(add2, mul3);
    add2mul3.call(testcontext, 3, function(err, result) {
      if (err) {
        return done(err);
      }
      expect(this).to.equal(testcontext);
      expect(result).to.equal(15);
      done();
    });
  });

  it('seq without callback', done => {
    const testcontext = { name: 'foo' };

    const add2 = function(n, cb) {
      expect(this).to.equal(testcontext);
      setTimeout(() => {
        cb(null, n + 2);
      }, 50);
    };
    const mul3 = function() {
      expect(this).to.equal(testcontext);
      setTimeout(() => {
        done();
      }, 15);
    };
    const add2mul3 = async.seq(add2, mul3);
    add2mul3.call(testcontext, 3);
  });
});
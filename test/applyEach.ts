import * as assert from 'assert';
import * as async from 'async';
import { expect } from 'chai';

describe('applyEach', () => {
  it('applyEach', done => {
    const call_order = [];
    const one = (val, cb) => {
      expect(val).to.equal(5);
      setTimeout(() => {
        call_order.push('one');
        cb(null, 1);
      }, 12);
    };
    const two = (val, cb) => {
      expect(val).to.equal(5);
      setTimeout(() => {
        call_order.push('two');
        cb(null, 2);
      }, 2);
    };
    const three = (val, cb) => {
      expect(val).to.equal(5);
      setTimeout(() => {
        call_order.push('three');
        cb(null, 3);
      }, 18);
    };
    async.applyEach([one, two, three], 5, (err, results) => {
      assert(err === null, `${err} passed instead of 'null'`);
      expect(call_order).to.eql(['two', 'one', 'three']);
      expect(results).to.eql([1, 2, 3]);
      done();
    });
  });

  it('applyEachSeries', done => {
    const call_order = [];
    const one = (val, cb) => {
      expect(val).to.equal(5);
      setTimeout(() => {
        call_order.push('one');
        cb(null, 1);
      }, 10);
    };
    const two = (val, cb) => {
      expect(val).to.equal(5);
      setTimeout(() => {
        call_order.push('two');
        cb(null, 2);
      }, 5);
    };
    const three = (val, cb) => {
      expect(val).to.equal(5);
      setTimeout(() => {
        call_order.push('three');
        cb(null, 3);
      }, 15);
    };
    async.applyEachSeries([one, two, three], 5, (err, results) => {
      assert(err === null, `${err} passed instead of 'null'`);
      expect(call_order).to.eql(['one', 'two', 'three']);
      expect(results).to.eql([1, 2, 3]);
      done();
    });
  });

  it('applyEach partial application', done => {
    const call_order = [];
    const one = (val, cb) => {
      expect(val).to.equal(5);
      setTimeout(() => {
        call_order.push('one');
        cb(null, 1);
      }, 10);
    };
    const two = (val, cb) => {
      expect(val).to.equal(5);
      setTimeout(() => {
        call_order.push('two');
        cb(null, 2);
      }, 5);
    };
    const three = (val, cb) => {
      expect(val).to.equal(5);
      setTimeout(() => {
        call_order.push('three');
        cb(null, 3);
      }, 15);
    };
    async.applyEach([one, two, three])(5, (err, results) => {
      if (err) throw err;
      expect(call_order).to.eql(['two', 'one', 'three']);
      expect(results).to.eql([1, 2, 3]);
      done();
    });
  });
});

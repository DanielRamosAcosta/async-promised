import * as assert from 'assert';
import * as async from 'async';
import { expect } from 'chai';
import * as _ from 'lodash';

describe('eachOf', () => {
  function forEachOfNoCallbackIteratee(done, x, key, callback) {
    expect(x).to.equal(1);
    expect(key).to.equal('a');
    callback();
    done();
  }

  function forEachOfIteratee(args, value, key, callback) {
    setTimeout(() => {
      args.push(key, value);
      callback();
    }, value * 25);
  }

  it('eachOf alias', done => {
    expect(async.eachOf).to.equal(async.forEachOf);
    done();
  });

  it('eachOfLimit alias', done => {
    expect(async.eachOfLimit).to.equal(async.forEachOfLimit);
    done();
  });

  it('eachOfSeries alias', done => {
    expect(async.eachOfSeries).to.equal(async.forEachOfSeries);
    done();
  });

  it('forEachOf', function(done) {
    const args = [];
    async.forEachOf({ a: 1, b: 2 }, forEachOfIteratee.bind(this, args), err => {
      assert(err === null, `${err} passed instead of 'null'`);
      expect(args).to.eql(['a', 1, 'b', 2]);
      done();
    });
  });

  it('forEachOf - instant resolver', done => {
    const args = [];
    async.forEachOf(
      { a: 1, b: 2 },
      (x, k, cb) => {
        args.push(k, x);
        cb();
      },
      () => {
        // ensures done callback isn't called before all items iterated
        expect(args).to.eql(['a', 1, 'b', 2]);
        done();
      }
    );
  });

  it('forEachOf empty object', done => {
    async.forEachOf(
      {},
      (value, key, callback) => {
        assert(false, 'iteratee should not be called');
        callback();
      },
      err => {
        if (err) throw err;
        assert(true, 'should call callback');
      }
    );
    setTimeout(done, 25);
  });

  it('forEachOf empty array', done => {
    async.forEachOf(
      [],
      (value, key, callback) => {
        assert(false, 'iteratee should not be called');
        callback();
      },
      err => {
        if (err) throw err;
        assert(true, 'should call callback');
      }
    );
    setTimeout(done, 25);
  });

  it('forEachOf error', done => {
    async.forEachOf(
      { a: 1, b: 2 },
      (value, key, callback) => {
        callback('error');
      },
      err => {
        expect(err).to.equal('error');
      }
    );
    setTimeout(done, 50);
  });

  it('forEachOf no callback', function(done) {
    async.forEachOf({ a: 1 }, forEachOfNoCallbackIteratee.bind(this, done));
  });

  it('forEachOf with array', function(done) {
    const args = [];
    async.forEachOf(['a', 'b'], forEachOfIteratee.bind(this, args), err => {
      if (err) throw err;
      expect(args).to.eql([0, 'a', 1, 'b']);
      done();
    });
  });

  it('forEachOf with Set (iterators)', function(done) {
    if (typeof Set !== 'function') return done();

    const args = [];
    const set = new Set();
    set.add('a');
    set.add('b');
    async.forEachOf(set, forEachOfIteratee.bind(this, args), err => {
      if (err) throw err;
      expect(args).to.eql([0, 'a', 1, 'b']);
      done();
    });
  });

  it('forEachOf with Map (iterators)', function(done) {
    if (typeof Map !== 'function') return done();

    const args = [];
    const map = new Map();
    map.set(1, 'a');
    map.set(2, 'b');
    async.forEachOf(map, forEachOfIteratee.bind(this, args), err => {
      if (err) throw err;
      expect(args).to.eql([0, [1, 'a'], 1, [2, 'b']]);
      done();
    });
  });

  it('forEachOfSeries', function(done) {
    const args = [];
    async.forEachOfSeries(
      { a: 1, b: 2 },
      forEachOfIteratee.bind(this, args),
      err => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(args).to.eql(['a', 1, 'b', 2]);
        done();
      }
    );
  });

  it('forEachOfSeries empty object', done => {
    async.forEachOfSeries(
      {},
      (x, callback) => {
        assert(false, 'iteratee should not be called');
        callback();
      },
      err => {
        if (err) throw err;
        assert(true, 'should call callback');
      }
    );
    setTimeout(done, 25);
  });

  it('forEachOfSeries error', done => {
    const call_order = [];
    async.forEachOfSeries(
      { a: 1, b: 2 },
      (value, key, callback) => {
        call_order.push(value, key);
        callback('error');
      },
      err => {
        expect(call_order).to.eql([1, 'a']);
        expect(err).to.equal('error');
      }
    );
    setTimeout(done, 50);
  });

  it('forEachOfSeries no callback', function(done) {
    async.forEachOfSeries(
      { a: 1 },
      forEachOfNoCallbackIteratee.bind(this, done)
    );
  });

  it('forEachOfSeries with array', function(done) {
    const args = [];
    async.forEachOfSeries(
      ['a', 'b'],
      forEachOfIteratee.bind(this, args),
      err => {
        if (err) throw err;
        expect(args).to.eql([0, 'a', 1, 'b']);
        done();
      }
    );
  });

  it('forEachOfSeries with Set (iterators)', function(done) {
    if (typeof Set !== 'function') return done();

    const args = [];
    const set = new Set();
    set.add('a');
    set.add('b');
    async.forEachOfSeries(set, forEachOfIteratee.bind(this, args), err => {
      if (err) throw err;
      expect(args).to.eql([0, 'a', 1, 'b']);
      done();
    });
  });

  it('forEachOfSeries with Map (iterators)', function(done) {
    if (typeof Map !== 'function') return done();

    const args = [];
    const map = new Map();
    map.set(1, 'a');
    map.set(2, 'b');
    async.forEachOfSeries(map, forEachOfIteratee.bind(this, args), err => {
      if (err) throw err;
      expect(args).to.eql([0, [1, 'a'], 1, [2, 'b']]);
      done();
    });
  });

  it('forEachOfLimit', done => {
    const args = [];
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    async.forEachOfLimit(
      obj,
      2,
      (value, key, callback) => {
        setTimeout(() => {
          args.push(value, key);
          callback();
        }, value * 5);
      },
      err => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(args).to.eql([1, 'a', 2, 'b', 3, 'c', 4, 'd']);
        done();
      }
    );
  });

  it('forEachOfLimit empty object', done => {
    async.forEachOfLimit(
      {},
      2,
      (value, key, callback) => {
        assert(false, 'iteratee should not be called');
        callback();
      },
      err => {
        if (err) throw err;
        assert(true, 'should call callback');
      }
    );
    setTimeout(done, 25);
  });

  it('forEachOfLimit limit exceeds size', function(done) {
    const args = [];
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    async.forEachOfLimit(obj, 10, forEachOfIteratee.bind(this, args), err => {
      if (err) throw err;
      expect(args).to.eql(['a', 1, 'b', 2, 'c', 3, 'd', 4, 'e', 5]);
      done();
    });
  });

  it('forEachOfLimit limit equal size', function(done) {
    const args = [];
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    async.forEachOfLimit(obj, 5, forEachOfIteratee.bind(this, args), err => {
      if (err) throw err;
      expect(args).to.eql(['a', 1, 'b', 2, 'c', 3, 'd', 4, 'e', 5]);
      done();
    });
  });

  it('forEachOfLimit zero limit', done => {
    async.forEachOfLimit(
      { a: 1, b: 2 },
      0,
      (x, callback) => {
        assert(false, 'iteratee should not be called');
        callback();
      },
      err => {
        if (err) throw err;
        assert(true, 'should call callback');
      }
    );
    setTimeout(done, 25);
  });

  it('forEachOfLimit no limit', done => {
    let count = 0;
    async.forEachOfLimit(
      _.range(100),
      Infinity,
      (x, i, callback) => {
        count++;
        callback();
      },
      err => {
        if (err) throw err;
        expect(count).to.equal(100);
      }
    );
    setTimeout(done, 25);
  });

  it('forEachOfLimit error', done => {
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    const call_order = [];

    async.forEachOfLimit(
      obj,
      3,
      (value, key, callback) => {
        call_order.push(value, key);
        if (value === 2) {
          callback('error');
        }
      },
      err => {
        expect(call_order).to.eql([1, 'a', 2, 'b']);
        expect(err).to.equal('error');
      }
    );
    setTimeout(done, 25);
  });

  it('forEachOfLimit no callback', function(done) {
    async.forEachOfLimit(
      { a: 1 },
      1,
      forEachOfNoCallbackIteratee.bind(this, done)
    );
  });

  it('forEachOfLimit synchronous', function(done) {
    const args = [];
    const obj = { a: 1, b: 2 };
    async.forEachOfLimit(obj, 5, forEachOfIteratee.bind(this, args), err => {
      if (err) throw err;
      expect(args).to.eql(['a', 1, 'b', 2]);
      done();
    });
  });

  it('forEachOfLimit with array', function(done) {
    const args = [];
    const arr = ['a', 'b'];
    async.forEachOfLimit(arr, 1, forEachOfIteratee.bind(this, args), err => {
      if (err) throw err;
      expect(args).to.eql([0, 'a', 1, 'b']);
      done();
    });
  });

  it('forEachOfLimit with Set (iterators)', function(done) {
    if (typeof Set !== 'function') return done();

    const args = [];
    const set = new Set();
    set.add('a');
    set.add('b');
    async.forEachOfLimit(set, 1, forEachOfIteratee.bind(this, args), err => {
      if (err) throw err;
      expect(args).to.eql([0, 'a', 1, 'b']);
      done();
    });
  });

  it('forEachOfLimit with Map (iterators)', function(done) {
    if (typeof Map !== 'function') return done();

    const args = [];
    const map = new Map();
    map.set(1, 'a');
    map.set(2, 'b');
    async.forEachOfLimit(map, 1, forEachOfIteratee.bind(this, args), err => {
      if (err) throw err;
      expect(args).to.eql([0, [1, 'a'], 1, [2, 'b']]);
      done();
    });
  });
});

import * as async from 'async';
import { expect } from 'chai';
import pasync = require('../lib/async-promises');

function filterIteratee(x: number, callback) {
  setTimeout(() => {
    callback(null, x % 2);
  }, x * 5);
}

function promiseFilterIteratee(x: number): Promise<boolean> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve((x % 2) === 1);
    }, x * 5);
  });
}

function testLimit(arr, limitFunc, limit, iter, done) {
  const args = [];

  limitFunc(arr, limit, function(x) {
      args.push(x);
      iter.apply(this, arguments);
  }, function() {
      expect(args).to.eql(arr);
      done.apply(this, arguments);
  });
}

describe('filter', () => {
  it('filter', () =>
    pasync.filter([3, 2, 1], promiseFilterIteratee)
      .then(results => {
        expect(results).to.eql([3, 1]);
      })
  );
  it('filter original untouched', () => {
    const a = [3, 1, 2];
    return pasync.filter(a, promiseFilterIteratee).then(results => {
      expect(results).to.eql([3, 1]);
      expect(a).to.eql([3, 1, 2]);
    });
  });
  it('filter collection', () => {
    const a = {a: 3, b: 1, c: 2};
    pasync.filter(a, x => Promise.resolve(x % 2)).then(results => {
      expect(results).to.eql([3, 1]);
      expect(a).to.eql({a: 3, b: 1, c: 2});
    });
  });
  if (typeof Symbol === 'function' && Symbol.iterator) {
    function makeIterator(array) {
      let nextIndex;
      const iterator = {
        next() {
          return nextIndex < array.length ? {
            value: array[nextIndex++],
            done: false
          } : {
            done: true
          };
        }
      };
      iterator[Symbol.iterator] = () => {
        nextIndex = 0; // reset iterator
        return iterator;
      };
      return iterator;
    }
    it('filter iterator', done => {
      const a = makeIterator([500, 20, 100]);
      async.filter(a, (x, callback) => {
        setTimeout(() => {
          callback(null, x > 20);
        }, x);
      }, (err, results) => {
        expect(err).to.equal(null);
        expect(results).to.eql([500, 100]);
        done();
      });
    });
  }
  it('filter error', done => {
    async.filter([3, 1, 2], (x, callback) => {
      callback('error');
    }, (err, results) => {
      expect(err).to.equal('error');
      expect(results).to.not.exist;
      done();
    });
  });
  it('filterSeries', done => {
    async.filterSeries([3, 1, 2], filterIteratee, (err, results) => {
      expect(err).to.equal(null);
      expect(results).to.eql([3, 1]);
      done();
    });
  });
  it('select alias', () => {
    expect(async.select).to.equal(async.filter);
  });
  it('selectSeries alias', () => {
    expect(async.selectSeries).to.equal(async.filterSeries);
  });
  it('filterLimit', done => {
    testLimit([5, 4, 3, 2, 1], async.filterLimit, 2, (v, next) => {
      next(null, v % 2);
    }, (err, result) => {
      expect(err).to.equal(null);
      expect(result).to.eql([5, 3, 1]);
      done();
    });
  });
});

describe('reject', () => {
  it('reject', done => {
    async.reject([3, 1, 2], filterIteratee, (err, results) => {
      expect(err).to.equal(null);
      expect(results).to.eql([2]);
      done();
    });
  });
  it('reject original untouched', done => {
    const a = [3, 1, 2];
    async.reject(a, (x, callback) => {
      callback(null, x % 2);
    }, (err, results) => {
      expect(err).to.equal(null);
      expect(results).to.eql([2]);
      expect(a).to.eql([3, 1, 2]);
      done();
    });
  });
  it('reject error', done => {
    async.reject([3, 1, 2], (x, callback) => {
      callback('error');
    }, (err, results) => {
      expect(err).to.equal('error');
      expect(results).to.not.exist;
      done();
    });
  });
  it('rejectSeries', done => {
    async.rejectSeries([3, 1, 2], filterIteratee, (err, results) => {
      expect(err).to.equal(null);
      expect(results).to.eql([2]);
      done();
    });
  });
  it('rejectLimit', done => {
    testLimit([5, 4, 3, 2, 1], async.rejectLimit, 2, (v, next) => {
      next(null, v % 2);
    }, (err, result) => {
      expect(err).to.equal(null);
      expect(result).to.eql([4, 2]);
      done();
    });
  });
  it('filter fails', done => {
    async.filter({
      a: 1,
      b: 2,
      c: 3
    }, (item, callback) => {
      if (item === 3) {
        callback('error', false);
      } else {
        callback(null, true);
      }
    }, (err, res) => {
      expect(err).to.equal('error');
      expect(res).to.equal(undefined);
      done();
    });
  });
});

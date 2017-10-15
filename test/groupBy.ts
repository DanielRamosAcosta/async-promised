import * as assert from 'assert';
import * as async from 'async';
import { expect } from 'chai';

describe('groupBy', function() {
  function groupByIteratee(callOrder, val, next) {
    setTimeout(() => {
      callOrder.push(val);
      next(null, val + 1);
    }, val * 25);
  }

  describe('groupBy', () => {
    it('basics', function(done) {
      const callOrder = [];
      async.groupBy(
        [1, 3, 2],
        groupByIteratee.bind(this, callOrder),
        (err, result) => {
          expect(err).to.eql(null);
          expect(callOrder).to.eql([1, 2, 3]);
          expect(result).to.eql({ 2: [1], 3: [2], 4: [3] });
          done();
        }
      );
    });

    it('error', done => {
      async.groupBy(
        [1, 3, 2],
        (val, next) => {
          if (val === 3) {
            return next(new Error('fail'));
          }
          next(null, val + 1);
        },
        (err, result) => {
          expect(err).to.not.eql(null);
          expect(result).to.eql({ 2: [1] });
          done();
        }
      );
    });

    it('original untouched', done => {
      const obj = { a: 'b', b: 'c', c: 'd' };
      async.groupBy(
        obj,
        (val, next) => {
          next(null, val);
        },
        (err, result) => {
          expect(obj).to.eql({ a: 'b', b: 'c', c: 'd' });
          expect(result).to.eql({ b: ['b'], c: ['c'], d: ['d'] });
          done();
        }
      );
    });

    it('handles multiple matches', function(done) {
      const callOrder = [];
      async.groupBy(
        [1, 3, 2, 2],
        groupByIteratee.bind(this, callOrder),
        (err, result) => {
          expect(err).to.eql(null);
          expect(callOrder).to.eql([1, 2, 2, 3]);
          expect(result).to.eql({ 2: [1], 3: [2, 2], 4: [3] });
          done();
        }
      );
    });

    it('handles objects', done => {
      const obj = { a: 'b', b: 'c', c: 'd' };
      const concurrency = { b: 3, c: 2, d: 1 };
      let running = 0;
      async.groupBy(
        obj,
        (val, next) => {
          running++;
          async.setImmediate(() => {
            expect(running).to.equal(concurrency[val]);
            running--;
            next(null, val);
          });
        },
        (err, result) => {
          expect(running).to.equal(0);
          expect(err).to.eql(null);
          expect(result).to.eql({ b: ['b'], c: ['c'], d: ['d'] });
          done();
        }
      );
    });

    it('handles undefined', done => {
      async.groupBy(
        undefined,
        (val, next) => {
          assert(false, 'iteratee should not be called');
          next();
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql({});
          done();
        }
      );
    });

    it('handles empty object', done => {
      async.groupBy(
        {},
        (val, next) => {
          assert(false, 'iteratee should not be called');
          next();
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql({});
          done();
        }
      );
    });

    it('main callback optional', done => {
      const arr = [1, 2, 3];
      const runs = [];
      async.groupBy(arr, (val, next) => {
        runs.push(val);
        const _done = runs.length === arr.length;
        async.setImmediate(() => {
          next(null);
          if (_done) {
            expect(runs).to.eql(arr);
            done();
          }
        });
      });
    });

    it('iteratee callback is only called once', done => {
      async.groupBy(
        [1, 2],
        (item, callback) => {
          try {
            callback(item);
          } catch (exception) {
            expect(() => {
              callback(exception);
            }).to.throw(/already called/);
            done();
          }
        },
        () => {
          throw new Error();
        }
      );
    });

    it('handles Map', done => {
      if (typeof Map !== 'function') {
        return done();
      }

      const map = new Map([['a', 'a'], ['b', 'b'], ['c', 'a']]);

      async.groupBy(
        map,
        (val, next) => {
          next(null, val[1] + 1);
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql({
            a1: [['a', 'a'], ['c', 'a']],
            b1: [['b', 'b']]
          });
          done();
        }
      );
    });

    it('handles sparse results', done => {
      const arr = [1, 2, 3];
      async.groupBy(
        arr,
        (val, next) => {
          if (val === 1) {
            return next(null, val + 1);
          } else if (val === 2) {
            async.setImmediate(() => next(null, val + 1));
          } else {
            return next('error');
          }
        },
        (err, result) => {
          expect(err).to.not.eql(null);
          expect(result).to.eql({ 2: [1] });
          async.setImmediate(done);
        }
      );
    });
  });

  describe('groupByLimit', () => {
    const obj = { a: 'b', b: 'c', c: 'd' };
    it('basics', done => {
      let running = 0;
      const concurrency = { b: 2, c: 2, d: 1 };
      async.groupByLimit(
        obj,
        2,
        (val, next) => {
          running++;
          async.setImmediate(() => {
            expect(running).to.equal(concurrency[val]);
            running--;
            next(null, val);
          });
        },
        (err, result) => {
          expect(running).to.equal(0);
          expect(err).to.eql(null);
          expect(result).to.eql({ b: ['b'], c: ['c'], d: ['d'] });
          done();
        }
      );
    });

    it('error', done => {
      async.groupByLimit(
        obj,
        1,
        (val, next) => {
          if (val === 'c') {
            return next(new Error('fail'));
          }
          next(null, val);
        },
        (err, result) => {
          expect(err).to.not.eql(null);
          expect(result).to.eql({ b: ['b'] });
          done();
        }
      );
    });

    it('handles empty object', done => {
      async.groupByLimit(
        {},
        2,
        (val, next) => {
          assert(false, 'iteratee should not be called');
          next();
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql({});
          done();
        }
      );
    });

    it('handles undefined', done => {
      async.groupByLimit(
        undefined,
        2,
        (val, next) => {
          assert(false, 'iteratee should not be called');
          next();
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql({});
          done();
        }
      );
    });

    it('limit exceeds size', function(done) {
      const callOrder = [];
      async.groupByLimit(
        [3, 2, 2, 1],
        10,
        groupByIteratee.bind(this, callOrder),
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql({ 2: [1], 3: [2, 2], 4: [3] });
          expect(callOrder).to.eql([1, 2, 2, 3]);
          done();
        }
      );
    });

    it('limit equal size', function(done) {
      const callOrder = [];
      async.groupByLimit(
        [3, 2, 2, 1],
        4,
        groupByIteratee.bind(this, callOrder),
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql({ 2: [1], 3: [2, 2], 4: [3] });
          expect(callOrder).to.eql([1, 2, 2, 3]);
          done();
        }
      );
    });

    it('zero limit', done => {
      async.groupByLimit(
        [3, 2, 2, 1],
        0,
        (val, next) => {
          assert(false, 'iteratee should not be called');
          next();
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql({});
          done();
        }
      );
    });

    it('does not continue replenishing after error', done => {
      let started = 0;
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const delay = 10;
      const limit = 3;
      const maxTime = 10 * arr.length;

      async.groupByLimit(
        arr,
        limit,
        (val, next) => {
          started++;
          if (started === 3) {
            return next(new Error('fail'));
          }

          setTimeout(() => {
            next();
          }, delay);
        },
        (err, result) => {
          expect(err).to.not.eql(null);
          expect(result).to.eql({});
        }
      );

      setTimeout(() => {
        expect(started).to.equal(3);
        done();
      }, maxTime);
    });
  });

  describe('groupBySeries', () => {
    const obj = { a: 'b', b: 'c', c: 'd' };
    it('basics', done => {
      let running = 0;
      const concurrency = { b: 1, c: 1, d: 1 };
      async.groupBySeries(
        obj,
        (val, next) => {
          running++;
          async.setImmediate(() => {
            expect(running).to.equal(concurrency[val]);
            running--;
            next(null, val);
          });
        },
        (err, result) => {
          expect(running).to.equal(0);
          expect(err).to.eql(null);
          expect(result).to.eql({ b: ['b'], c: ['c'], d: ['d'] });
          done();
        }
      );
    });

    it('error', done => {
      async.groupBySeries(
        obj,
        (val, next) => {
          if (val === 'c') {
            return next(new Error('fail'));
          }
          next(null, val);
        },
        (err, result) => {
          expect(err).to.not.eql(null);
          expect(result).to.eql({ b: ['b'] });
          done();
        }
      );
    });

    it('handles arrays', done => {
      async.groupBySeries(
        ['a', 'a', 'b'],
        (val, next) => {
          next(null, val);
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql({ a: ['a', 'a'], b: ['b'] });
          done();
        }
      );
    });

    it('handles empty object', done => {
      async.groupBySeries(
        {},
        (val, next) => {
          assert(false, 'iteratee should not be called');
          next();
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql({});
          done();
        }
      );
    });

    it('handles undefined', done => {
      async.groupBySeries(
        undefined,
        (val, next) => {
          assert(false, 'iteratee should not be called');
          next();
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql({});
          done();
        }
      );
    });
  });
});

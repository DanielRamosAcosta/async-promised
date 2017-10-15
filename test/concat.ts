import * as assert from 'assert';
import * as async from 'async';
import { expect } from 'chai';

describe('concat', function() {
  function concatIteratee(callOrder, val, next) {
    setTimeout(() => {
      callOrder.push(val);
      next(null, [val, val + 1]);
    }, val * 25);
  }

  describe('concat', () => {
    it('basics', function(done) {
      const callOrder = [];
      async.concat(
        [1, 3, 2],
        concatIteratee.bind(this, callOrder),
        (err, result) => {
          expect(err).to.eql(null);
          expect(callOrder).to.eql([1, 2, 3]);
          expect(result).to.eql([1, 2, 3, 4, 2, 3]);
          done();
        }
      );
    });

    it('error', done => {
      async.concat(
        [1, 3, 2],
        (val, next) => {
          if (val === 3) {
            return next(new Error('fail'));
          }
          next(null, [val, val + 1]);
        },
        (err, result) => {
          expect(err).to.not.eql(null);
          expect(result).to.eql([1, 2]);
          done();
        }
      );
    });

    it('original untouched', done => {
      const arr = ['foo', 'bar', 'baz'];
      async.concat(
        arr,
        (val, next) => {
          next(null, [val, val]);
        },
        (err, result) => {
          expect(arr).to.eql(['foo', 'bar', 'baz']);
          expect(result).to.eql(['foo', 'foo', 'bar', 'bar', 'baz', 'baz']);
          done();
        }
      );
    });

    it('empty results', done => {
      const arr = ['foo', 'bar', 'baz'];
      async.concat(
        arr,
        (val, next) => {
          next(null);
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.be.an('array').that.is.empty;
          done();
        }
      );
    });

    it('empty arrays', done => {
      const arr = ['foo', 'bar', 'baz'];
      async.concat(
        arr,
        (val, next) => {
          next(null, []);
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.be.an('array').that.is.empty;
          done();
        }
      );
    });

    it('handles empty object', done => {
      async.concat(
        {},
        (val, next) => {
          assert(false, 'iteratee should not be called');
          next();
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.be.an('array').that.is.empty;
          done();
        }
      );
    });

    it('variadic', done => {
      const arr = ['foo', 'bar', 'baz'];
      async.concat(
        arr,
        (val, next) => {
          next(null, val, val);
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql(['foo', 'foo', 'bar', 'bar', 'baz', 'baz']);
          done();
        }
      );
    });

    it('flattens arrays', done => {
      const arr = ['foo', 'bar'];
      async.concat(
        arr,
        (val, next) => {
          next(null, [val, [val]]);
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql(['foo', ['foo'], 'bar', ['bar']]);
          done();
        }
      );
    });

    it('handles fasly values', done => {
      const falsy = [null, undefined, 0, ''];
      async.concat(
        falsy,
        (val, next) => {
          next(null, val);
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql(falsy);
          done();
        }
      );
    });

    it('handles objects', done => {
      const obj = { a: 'foo', b: 'bar', c: 'baz' };
      async.concat(
        obj,
        (val, next) => {
          next(null, val);
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql(['foo', 'bar', 'baz']);
          done();
        }
      );
    });

    it('main callback optional', done => {
      const arr = [1, 2, 3];
      const runs = [];
      async.concat(arr, (val, next) => {
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
      async.concat(
        [1, 2],
        (val, next) => {
          try {
            next(val);
          } catch (exception) {
            expect(() => {
              next(exception);
            }).to.throw(/already called/);
            done();
          }
        },
        () => {
          throw new Error();
        }
      );
    });

    it('preserves order', done => {
      const arr = [30, 15];
      async.concat(
        arr,
        (x, cb) => {
          setTimeout(() => {
            cb(null, x);
          }, x);
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql(arr);
          done();
        }
      );
    });

    it('handles Map', done => {
      if (typeof Map !== 'function') {
        return done();
      }

      const map = new Map([['a', 'b'], ['b', 'c'], ['c', 'd']]);

      async.concat(
        map,
        (val, next) => {
          next(null, val);
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql(['a', 'b', 'b', 'c', 'c', 'd']);
          done();
        }
      );
    });

    it('handles sparse results', done => {
      const arr = [1, 2, 3, 4];
      async.concat(
        arr,
        (val, next) => {
          if (val === 1 || val === 3) {
            return next(null, val + 1);
          } else if (val === 2) {
            async.setImmediate(() => next(null, val + 1));
          } else {
            return next('error');
          }
        },
        (err, result) => {
          expect(err).to.not.eql(null);
          expect(result).to.eql([2, 4]);
          async.setImmediate(done);
        }
      );
    });
  });

  describe('concatLimit', () => {
    const arr = ['foo', 'bar', 'baz'];
    it('basics', done => {
      let running = 0;
      const concurrency = { foo: 2, bar: 2, baz: 1 };
      async.concatLimit(
        arr,
        2,
        (val, next) => {
          running++;
          async.setImmediate(() => {
            expect(running).to.equal(concurrency[val]);
            running--;
            next(null, val, val);
          });
        },
        (err, result) => {
          expect(running).to.equal(0);
          expect(err).to.eql(null);
          expect(result).to.eql(['foo', 'foo', 'bar', 'bar', 'baz', 'baz']);
          done();
        }
      );
    });

    it('error', done => {
      async.concatLimit(
        arr,
        1,
        (val, next) => {
          if (val === 'bar') {
            return next(new Error('fail'));
          }
          next(null, val);
        },
        (err, result) => {
          expect(err).to.not.eql(null);
          expect(result).to.eql(['foo']);
          done();
        }
      );
    });

    it('handles objects', done => {
      async.concatLimit(
        { foo: 1, bar: 2, baz: 3 },
        2,
        (val, next) => {
          next(null, val + 1);
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql([2, 3, 4]);
          done();
        }
      );
    });

    it('handles empty object', done => {
      async.concatLimit(
        {},
        2,
        (val, next) => {
          assert(false, 'iteratee should not be called');
          next();
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.be.an('array').that.is.empty;
          done();
        }
      );
    });

    it('handles undefined', done => {
      async.concatLimit(
        undefined,
        2,
        (val, next) => {
          assert(false, 'iteratee should not be called');
          next();
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.be.an('array').that.is.empty;
          done();
        }
      );
    });

    it('limit exceeds size', function(done) {
      const callOrder = [];
      async.concatLimit(
        [3, 2, 2, 1],
        10,
        concatIteratee.bind(this, callOrder),
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql([3, 4, 2, 3, 2, 3, 1, 2]);
          expect(callOrder).to.eql([1, 2, 2, 3]);
          done();
        }
      );
    });

    it('limit equal size', function(done) {
      const callOrder = [];
      async.concatLimit(
        [3, 2, 2, 1],
        4,
        concatIteratee.bind(this, callOrder),
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql([3, 4, 2, 3, 2, 3, 1, 2]);
          expect(callOrder).to.eql([1, 2, 2, 3]);
          done();
        }
      );
    });

    it('zero limit', done => {
      async.concatLimit(
        [3, 2, 2, 1],
        0,
        (val, next) => {
          assert(false, 'iteratee should not be called');
          next();
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.be.an('array').that.is.empty;
          done();
        }
      );
    });

    it('does not continue replenishing after error', done => {
      let started = 0;
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const limit = 3;
      let step = 0;
      const maxSteps = arr.length;

      async.concatLimit(
        arr,
        limit,
        (val, next) => {
          started++;
          if (started === 3) {
            return next(new Error('fail'));
          }

          async.setImmediate(() => {
            next();
          });
        },
        (err, result) => {
          expect(err).to.not.eql(null);
          expect(result).to.be.an('array').that.is.empty;
        }
      );

      // wait `maxSteps` event loop cycles before calling done to ensure
      // the iteratee is not called on more items in arr.
      function waitCycle() {
        step++;
        if (step >= maxSteps) {
          expect(started).to.equal(3);
          done();
          return;
        } else {
          async.setImmediate(waitCycle);
        }
      }

      async.setImmediate(waitCycle);
    });
  });

  describe('concatSeries', () => {
    it('basics', done => {
      const callOrder = [];
      let running = 0;
      const iteratee = (x, cb) => {
        running++;
        setTimeout(() => {
          expect(running).to.equal(1);
          running--;
          callOrder.push(x);
          const r = [];
          while (x > 0) {
            r.push(x);
            x--;
          }
          cb(null, r);
        }, x * 25);
      };
      async.concatSeries([1, 3, 2], iteratee, (err, results) => {
        expect(results).to.eql([1, 3, 2, 1, 2, 1]);
        expect(running).to.equal(0);
        expect(callOrder).to.eql([1, 3, 2]);
        assert(err === null, `${err} passed instead of 'null'`);
        done();
      });
    });

    it('error', done => {
      async.concatSeries(
        ['foo', 'bar', 'baz'],
        (val, next) => {
          if (val === 'bar') {
            return next(new Error('fail'));
          }
          next(null, [val, val]);
        },
        (err, result) => {
          expect(err).to.not.eql(null);
          expect(result).to.eql(['foo', 'foo']);
          done();
        }
      );
    });

    it('handles objects', done => {
      async.concatSeries(
        { foo: 1, bar: 2, baz: 3 },
        (val, next) => next(null, [val, val + 1]),
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.eql([1, 2, 2, 3, 3, 4]);
          done();
        }
      );
    });

    it('handles empty object', done => {
      async.concatSeries(
        {},
        (val, next) => {
          assert(false, 'iteratee should not be called');
          next();
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.be.an('array').that.is.empty;
          done();
        }
      );
    });

    it('handles undefined', done => {
      async.concatSeries(
        undefined,
        (val, next) => {
          assert(false, 'iteratee should not be called');
          next();
        },
        (err, result) => {
          expect(err).to.eql(null);
          expect(result).to.be.an('array').that.is.empty;
          done();
        }
      );
    });
  });
});

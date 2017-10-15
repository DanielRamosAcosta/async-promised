import * as async from 'async';
import { expect } from 'chai';

describe('mapValues', () => {
  const obj = { a: 1, b: 2, c: 3 };

  describe('mapValuesLimit', () => {
    it('basics', done => {
      let running = 0;
      const concurrency = {
        a: 2,
        b: 2,
        c: 1
      };
      async.mapValuesLimit(
        obj,
        2,
        (val, key, next) => {
          running++;
          async.setImmediate(() => {
            expect(running).to.equal(concurrency[key]);
            running--;
            next(null, key + val);
          });
        },
        (err, result) => {
          expect(running).to.equal(0);
          expect(err).to.eql(null);
          expect(result).to.eql({ a: 'a1', b: 'b2', c: 'c3' });
          done();
        }
      );
    });

    it('error', done => {
      async.mapValuesLimit(
        obj,
        1,
        (val, key, next) => {
          if (key === 'b') {
            return next(new Error('fail'));
          }
          next(null, val);
        },
        (err, result) => {
          expect(err).to.not.eql(null);
          expect(result).to.eql({ a: 1 });
          done();
        }
      );
    });
  });

  describe('mapValues', () => {
    it('basics', done => {
      let running = 0;
      const concurrency = {
        a: 3,
        b: 2,
        c: 1
      };
      async.mapValues(
        obj,
        (val, key, next) => {
          running++;
          async.setImmediate(() => {
            expect(running).to.equal(concurrency[key]);
            running--;
            next(null, key + val);
          });
        },
        (err, result) => {
          expect(running).to.equal(0);
          expect(err).to.eql(null);
          expect(result).to.eql({ a: 'a1', b: 'b2', c: 'c3' });
          done();
        }
      );
    });
  });

  describe('mapValuesSeries', () => {
    it('basics', done => {
      let running = 0;
      const concurrency = {
        a: 1,
        b: 1,
        c: 1
      };
      async.mapValuesSeries(
        obj,
        (val, key, next) => {
          running++;
          async.setImmediate(() => {
            expect(running).to.equal(concurrency[key]);
            running--;
            next(null, key + val);
          });
        },
        (err, result) => {
          expect(running).to.equal(0);
          expect(err).to.eql(null);
          expect(result).to.eql({ a: 'a1', b: 'b2', c: 'c3' });
          done();
        }
      );
    });
  });
});

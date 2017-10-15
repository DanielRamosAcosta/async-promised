import * as assert from 'assert';
import * as async from 'async';
import { expect } from 'chai';

describe('sortBy', () => {
  it('sortBy', done => {
    async.sortBy(
      [{ a: 1 }, { a: 15 }, { a: 6 }],
      (x, callback) => {
        setTimeout(() => {
          callback(null, x.a);
        }, 0);
      },
      (err, result) => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(result).to.eql([{ a: 1 }, { a: 6 }, { a: 15 }]);
        done();
      }
    );
  });

  it('sortBy inverted', done => {
    async.sortBy(
      [{ a: 1 }, { a: 15 }, { a: 6 }],
      (x, callback) => {
        setTimeout(() => {
          callback(null, x.a * -1);
        }, 0);
      },
      (err, result) => {
        expect(result).to.eql([{ a: 15 }, { a: 6 }, { a: 1 }]);
        done();
      }
    );
  });

  it('sortBy error', done => {
    const error = new Error('asdas');
    async.sortBy(
      [{ a: 1 }, { a: 15 }, { a: 6 }],
      (x, callback) => {
        async.setImmediate(() => {
          callback(error);
        });
      },
      err => {
        expect(err).to.equal(error);
        done();
      }
    );
  });
});

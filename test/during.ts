import * as assert from 'assert';
import * as async from 'async';
import { expect } from 'chai';

describe('during', () => {
  it('during', done => {
    const call_order = [];

    let count = 0;
    async.during(
      cb => {
        call_order.push(['test', count]);
        cb(null, count < 5);
      },
      cb => {
        call_order.push(['iteratee', count]);
        count++;
        cb(null, count);
      },
      err => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(call_order).to.eql([
          ['test', 0],
          ['iteratee', 0],
          ['test', 1],
          ['iteratee', 1],
          ['test', 2],
          ['iteratee', 2],
          ['test', 3],
          ['iteratee', 3],
          ['test', 4],
          ['iteratee', 4],
          ['test', 5]
        ]);
        expect(count).to.equal(5);
        done();
      }
    );
  });

  it('doDuring', done => {
    const call_order = [];

    let count = 0;
    async.doDuring(
      cb => {
        call_order.push(['iteratee', count]);
        count++;
        cb(null, count);
      },
      (c, cb) => {
        expect(c).to.equal(count);
        call_order.push(['test', count]);
        cb(null, count < 5);
      },
      err => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(call_order).to.eql([
          ['iteratee', 0],
          ['test', 1],
          ['iteratee', 1],
          ['test', 2],
          ['iteratee', 2],
          ['test', 3],
          ['iteratee', 3],
          ['test', 4],
          ['iteratee', 4],
          ['test', 5]
        ]);
        expect(count).to.equal(5);
        done();
      }
    );
  });

  it('doDuring - error test', done => {
    const error = new Error('asdas');

    async.doDuring(
      cb => {
        cb(error);
      },
      () => {},
      err => {
        expect(err).to.equal(error);
        done();
      }
    );
  });

  it('doDuring - error iteratee', done => {
    const error = new Error('asdas');

    async.doDuring(
      cb => {
        cb(null);
      },
      cb => {
        cb(error);
      },
      err => {
        expect(err).to.equal(error);
        done();
      }
    );
  });
});

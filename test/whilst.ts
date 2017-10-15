import * as assert from 'assert';
import * as async from 'async';
import { expect } from 'chai';

describe('whilst', () => {
  it('whilst', done => {
    const call_order = [];

    let count = 0;
    async.whilst(
      c => {
        expect(c).to.equal(undefined);
        call_order.push(['test', count]);
        return count < 5;
      },
      cb => {
        call_order.push(['iteratee', count]);
        count++;
        cb(null, count);
      },
      (err, result) => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(result).to.equal(5, 'last result passed through');
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

  it('whilst optional callback', done => {
    let counter = 0;
    async.whilst(
      () => counter < 2,
      cb => {
        counter++;
        cb();
      }
    );
    expect(counter).to.equal(2);
    done();
  });

  it('doWhilst', done => {
    const call_order = [];

    let count = 0;
    async.doWhilst(
      cb => {
        call_order.push(['iteratee', count]);
        count++;
        cb(null, count);
      },
      c => {
        expect(c).to.equal(count);
        call_order.push(['test', count]);
        return count < 5;
      },
      (err, result) => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(result).to.equal(5, 'last result passed through');
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

  it('doWhilst callback params', done => {
    const call_order = [];
    let count = 0;
    async.doWhilst(
      cb => {
        call_order.push(['iteratee', count]);
        count++;
        cb(null, count);
      },
      c => {
        call_order.push(['test', c]);
        return c < 5;
      },
      (err, result) => {
        if (err) throw err;
        expect(result).to.equal(5, 'last result passed through');
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

  it('doWhilst - error', done => {
    const error = new Error('asdas');

    async.doWhilst(
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
});

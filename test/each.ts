import * as assert from 'assert';
import * as async from 'async';
import { expect } from 'chai';

describe('each', () => {
  function eachIteratee(args, x, callback) {
    setTimeout(() => {
      args.push(x);
      callback();
    }, x * 25);
  }

  function eachNoCallbackIteratee(done, x, callback) {
    expect(x).to.equal(1);
    callback();
    done();
  }

  it('each', function(done) {
    const args = [];
    async.each([1, 3, 2], eachIteratee.bind(this, args), err => {
      assert(err === null, `${err} passed instead of 'null'`);
      expect(args).to.eql([1, 2, 3]);
      done();
    });
  });

  it('each extra callback', done => {
    let count = 0;
    async.each([1, 3, 2], (val, callback) => {
      count++;
      const done_ = count === 3;
      callback();
      assert.throws(callback);
      if (done_) {
        done();
      }
    });
  });

  it('each empty array', done => {
    async.each(
      [],
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

  it('each empty array, with other property on the array', done => {
    const myArray = [];
    myArray.myProp = 'anything';
    async.each(
      myArray,
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

  it('each error', done => {
    async.each(
      [1, 2, 3],
      (x, callback) => {
        callback('error');
      },
      err => {
        expect(err).to.equal('error');
      }
    );
    setTimeout(done, 50);
  });

  it('each no callback', function(done) {
    async.each([1], eachNoCallbackIteratee.bind(this, done));
  });

  it('eachSeries', function(done) {
    const args = [];
    async.eachSeries([1, 3, 2], eachIteratee.bind(this, args), err => {
      assert(err === null, `${err} passed instead of 'null'`);
      expect(args).to.eql([1, 3, 2]);
      done();
    });
  });

  it('eachSeries empty array', done => {
    async.eachSeries(
      [],
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

  it('eachSeries array modification', done => {
    const arr = [1, 2, 3, 4];
    async.eachSeries(
      arr,
      (x, callback) => {
        async.setImmediate(callback);
      },
      () => {
        assert(true, 'should call callback');
      }
    );

    arr.pop();
    arr.splice(0, 1);

    setTimeout(done, 50);
  });

  // bug #782.  Remove in next major release
  it('eachSeries single item', done => {
    let sync = true;
    async.eachSeries(
      [1],
      (i, cb) => {
        cb(null);
      },
      () => {
        assert(sync, 'callback not called on same tick');
      }
    );
    sync = false;
    done();
  });

  // bug #782.  Remove in next major release
  it('eachSeries single item', done => {
    let sync = true;
    async.eachSeries(
      [1],
      (i, cb) => {
        cb(null);
      },
      () => {
        assert(sync, 'callback not called on same tick');
      }
    );
    sync = false;
    done();
  });

  it('eachSeries error', done => {
    const call_order = [];
    async.eachSeries(
      [1, 2, 3],
      (x, callback) => {
        call_order.push(x);
        callback('error');
      },
      err => {
        expect(call_order).to.eql([1]);
        expect(err).to.equal('error');
      }
    );
    setTimeout(done, 50);
  });

  it('eachSeries no callback', function(done) {
    async.eachSeries([1], eachNoCallbackIteratee.bind(this, done));
  });

  it('eachLimit', done => {
    const args = [];
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    async.eachLimit(
      arr,
      2,
      (x, callback) => {
        setTimeout(() => {
          args.push(x);
          callback();
        }, x * 5);
      },
      err => {
        assert(err === null, `${err} passed instead of 'null'`);
        expect(args).to.eql(arr);
        done();
      }
    );
  });

  it('eachLimit empty array', done => {
    async.eachLimit(
      [],
      2,
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

  it('eachLimit limit exceeds size', function(done) {
    const args = [];
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    async.eachLimit(arr, 20, eachIteratee.bind(this, args), err => {
      if (err) throw err;
      expect(args).to.eql(arr);
      done();
    });
  });

  it('eachLimit limit equal size', function(done) {
    const args = [];
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    async.eachLimit(arr, 10, eachIteratee.bind(this, args), err => {
      if (err) throw err;
      expect(args).to.eql(arr);
      done();
    });
  });

  it('eachLimit zero limit', done => {
    async.eachLimit(
      [0, 1, 2, 3, 4, 5],
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

  it('eachLimit error', done => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const call_order = [];

    async.eachLimit(
      arr,
      3,
      (x, callback) => {
        call_order.push(x);
        if (x === 2) {
          callback('error');
        }
      },
      err => {
        expect(call_order).to.eql([0, 1, 2]);
        expect(err).to.equal('error');
      }
    );
    setTimeout(done, 25);
  });

  it('eachLimit no callback', function(done) {
    async.eachLimit([1], 1, eachNoCallbackIteratee.bind(this, done));
  });

  it('eachLimit synchronous', done => {
    const args = [];
    const arr = [0, 1, 2];
    async.eachLimit(
      arr,
      5,
      (x, callback) => {
        args.push(x);
        callback();
      },
      err => {
        if (err) throw err;
        expect(args).to.eql(arr);
        done();
      }
    );
  });

  it('eachLimit does not continue replenishing after error', done => {
    let started = 0;
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const delay = 10;
    const limit = 3;
    const maxTime = 10 * arr.length;

    async.eachLimit(
      arr,
      limit,
      (x, callback) => {
        started++;
        if (started === 3) {
          return callback(new Error('Test Error'));
        }
        setTimeout(() => {
          callback();
        }, delay);
      },
      () => {}
    );

    setTimeout(() => {
      expect(started).to.equal(3);
      done();
    }, maxTime);
  });

  it('forEach alias', done => {
    assert.strictEqual(async.each, async.forEach);
    done();
  });

  it('forEachSeries alias', done => {
    assert.strictEqual(async.eachSeries, async.forEachSeries);
    done();
  });

  it('forEachLimit alias', done => {
    assert.strictEqual(async.eachLimit, async.forEachLimit);
    done();
  });
});

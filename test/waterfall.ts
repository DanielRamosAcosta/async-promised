import * as assert from 'assert';
import * as async from 'async';
import { expect } from 'chai';

describe('waterfall', () => {
  it('basics', done => {
    const call_order = [];
    async.waterfall(
      [
        callback => {
          call_order.push('fn1');
          setTimeout(() => {
            callback(null, 'one', 'two');
          }, 0);
        },
        (arg1, arg2, callback) => {
          call_order.push('fn2');
          expect(arg1).to.equal('one');
          expect(arg2).to.equal('two');
          setTimeout(() => {
            callback(null, arg1, arg2, 'three');
          }, 25);
        },
        (arg1, arg2, arg3, callback) => {
          call_order.push('fn3');
          expect(arg1).to.equal('one');
          expect(arg2).to.equal('two');
          expect(arg3).to.equal('three');
          callback(null, 'four');
        },
        (arg4, callback) => {
          call_order.push('fn4');
          expect(call_order).to.eql(['fn1', 'fn2', 'fn3', 'fn4']);
          callback(null, 'test');
        }
      ],
      err => {
        expect(err === null, `${err} passed instead of 'null'`);
        done();
      }
    );
  });

  it('empty array', done => {
    async.waterfall([], err => {
      if (err) throw err;
      done();
    });
  });

  it('non-array', done => {
    async.waterfall({}, err => {
      expect(err.message).to.equal(
        'First argument to waterfall must be an array of functions'
      );
      done();
    });
  });

  it('no callback', done => {
    async.waterfall([
      callback => {
        callback();
      },
      callback => {
        callback();
        done();
      }
    ]);
  });

  it('async', done => {
    const call_order = [];
    async.waterfall([
      callback => {
        call_order.push(1);
        callback();
        call_order.push(2);
      },
      callback => {
        call_order.push(3);
        callback();
      },
      () => {
        expect(call_order).to.eql([1, 3]);
        done();
      }
    ]);
  });

  it('error', done => {
    async.waterfall(
      [
        callback => {
          callback('error');
        },
        callback => {
          assert(false, 'next function should not be called');
          callback();
        }
      ],
      err => {
        expect(err).to.equal('error');
        done();
      }
    );
  });

  it('multiple callback calls', () => {
    const arr = [
      callback => {
        callback(null, 'one', 'two');
        callback(null, 'one', 'two');
      },
      (arg1, arg2, callback) => {
        callback(null, arg1, arg2, 'three');
      }
    ];
    expect(() => {
      async.waterfall(arr, () => {});
    }).to.throw(/already called/);
  });

  xit('multiple callback calls (trickier) @nodeonly', done => {
    // TODO: Failing, won't be neccesary with async & await
    // do a weird dance to catch the async thrown error before mocha
    const listeners = process.listeners('uncaughtException');
    process.removeAllListeners('uncaughtException');
    process.once('uncaughtException', function onErr(err) {
      listeners.forEach(listener => {
        process.on('uncaughtException', listener);
      });
      // can't throw errors in a uncaughtException handler, defer
      setTimeout(checkErr, 0, err);
    });

    function checkErr(err) {
      expect(err.message).to.match(/already called/);
      done();
    }

    async.waterfall(
      [
        callback => {
          setTimeout(callback, 0, null, 'one', 'two');
          setTimeout(callback, 10, null, 'one', 'two');
        },
        (arg1, arg2, callback) => {
          setTimeout(callback, 15, null, arg1, arg2, 'three');
        }
      ],
      () => {
        throw new Error('should not get here');
      }
    );
  });

  it('call in another context @nycinvalid @nodeonly', done => {
    const vm = require('vm');
    const sandbox = {
      async,
      done
    };

    const fn = '(' + (function() {
      async.waterfall([function(callback) {
        callback();
      }], function(err) {
        if (err) {
          return done(err);
        }
        done();
      });
    }).toString() + '())';

    vm.runInNewContext(fn, sandbox);
  });

  it('should not use unnecessary deferrals', done => {
    let sameStack = true;

    async.waterfall(
      [
        cb => {
          cb(null, 1);
        },
        (arg, cb) => {
          cb();
        }
      ],
      () => {
        expect(sameStack).to.equal(true);
        done();
      }
    );

    sameStack = false;
  });
});

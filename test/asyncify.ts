import * as assert from 'assert';
import * as async from 'async';
import { expect } from 'chai';

describe('asyncify', () => {
  it('asyncify', done => {
    const parse = async.asyncify(JSON.parse);
    parse('{"a":1}', (err, result) => {
      assert(!err);
      expect(result.a).to.equal(1);
      done();
    });
  });

  it('asyncify null', done => {
    const parse = async.asyncify(() => null);
    parse('{"a":1}', (err, result) => {
      assert(!err);
      expect(result).to.equal(null);
      done();
    });
  });

  it('variable numbers of arguments', done => {
    async.asyncify(function(/*x, y, z*/) {
      return arguments;
    })(1, 2, 3, (err, result) => {
      expect(result.length).to.equal(3);
      expect(result[0]).to.equal(1);
      expect(result[1]).to.equal(2);
      expect(result[2]).to.equal(3);
      done();
    });
  });

  it('catch errors', done => {
    async.asyncify(() => {
      throw new Error('foo');
    })(err => {
      assert(err);
      expect(err.message).to.equal('foo');
      done();
    });
  });

  it('dont catch errors in the callback', done => {
    try {
      async.asyncify(() => {})(err => {
        if (err) {
          return done(new Error('should not get an error here'));
        }
        throw new Error('callback error');
      });
    } catch (err) {
      expect(err.message).to.equal('callback error');
      done();
    }
  });

  describe('promisified', () => {
    function promisifiedTests(Promise) {
      it('resolve', done => {
        const promisified = argument =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve(`${argument} resolved`);
            }, 15);
          });
        async.asyncify(promisified)('argument', (err, value) => {
          if (err) {
            return done(new Error('should not get an error here'));
          }
          expect(value).to.equal('argument resolved');
          done();
        });
      });

      it('reject', done => {
        const promisified = argument =>
          new Promise((resolve, reject) => {
            reject(`${argument} rejected`);
          });
        async.asyncify(promisified)('argument', err => {
          assert(err);
          expect(err.message).to.equal('argument rejected');
          done();
        });
      });

      it('callback error @nodeonly', done => {
        expectUncaughtException();

        const promisified = argument =>
          new Promise(resolve => {
            resolve(`${argument} resolved`);
          });
        let call_count = 0;
        async.asyncify(promisified)('argument', () => {
          call_count++;
          if (call_count === 1) {
            throw new Error('error in callback');
          }
        });

        setTimeout(() => {
          expect(call_count).to.equal(1);
          done();
        }, 15);
      });

      it('dont catch errors in the callback @nodeonly', done => {
        expectUncaughtException(checkErr);
        const callbackError = new Error('thrown from callback');

        function checkErr(err) {
          expect(err).to.equal(callbackError);
          done();
        }

        function callback() {
          throw callbackError;
        }

        async.asyncify(() => Promise.reject(new Error('rejection')))(callback);
      });
    }

    describe('native-promise-only', function() {
      const Promise = require('native-promise-only');
      promisifiedTests.call(this, Promise);
    });

    describe('bluebird', function() {
      const Promise = require('bluebird');
      // Bluebird reports unhandled rejections to stderr. We handle it because we expect
      // unhandled rejections:
      Promise.onPossiblyUnhandledRejection(function ignoreRejections() {});
      promisifiedTests.call(this, Promise);
    });

    describe('es6-promise', function() {
      const Promise = require('es6-promise').Promise;
      promisifiedTests.call(this, Promise);
    });

    describe('rsvp', function() {
      const Promise = require('rsvp').Promise;
      promisifiedTests.call(this, Promise);
    });

    function expectUncaughtException(onError) {
      // do a weird dance to catch the async thrown error before mocha
      const listeners = process.listeners('uncaughtException');
      process.removeAllListeners('uncaughtException');
      process.once('uncaughtException', function onErr(err) {
        listeners.forEach(listener => {
          process.on('uncaughtException', listener);
        });
        // can't throw errors in a uncaughtException handler, defer
        if (onError) {
          setTimeout(onError, 0, err);
        }
      });
    }
  });
});

import * as assert from 'assert';
import { expect } from 'chai';
import * as async from '../lib';

describe('asyncify', () => {
  it('asyncify', () => {
    const parse = async.asyncify(JSON.parse);
    return parse('{"a":1}')
      .catch(err => {
        expect(err).to.not.exist;
      })
      .then(result => {
        expect(result.a).to.equal(1);
      });
  });

  it('asyncify null', () => {
    const parse = async.asyncify(() => null);
    return parse('{"a":1}')
      .catch(err => {
        expect(err).to.not.exist;
      })
      .then(result => {
        expect(result).to.equal(null);
      });
  });

  it('variable numbers of arguments', () => {
    return async.asyncify((...args) => {
      return args;
    })(1, 2, 3)
      .catch(err => {
        expect(err).to.not.exist;
      })
      .then(result => {
        expect(result.length).to.equal(3);
        expect(result[0]).to.equal(1);
        expect(result[1]).to.equal(2);
        expect(result[2]).to.equal(3);
      });
  });

  it('catch errors', () => {
    return async.asyncify(() => {
      throw new Error('foo');
    })()
    .catch(err => err)
    .then(err => {
      assert(err);
      expect(err.message).to.equal('foo');
    });
  });

  // Removed 'dont catch errors in the callback', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/mocha_test/asyncify.js#L49

  describe('promisified', () => {
    function promisifiedTests(CustomPromise) {
      it('resolve', () => {
        const promisified = argument =>
          new CustomPromise(resolve => {
            setTimeout(() => {
              resolve(`${argument} resolved`);
            }, 15);
          });
        return async.asyncify(promisified)('argument')
          .catch(err => {
            expect(err).to.not.exist;
          })
          .then(value => {
            expect(value).to.equal('argument resolved');
          });
      });

      it('reject', () => {
        const promisified = argument =>
          new CustomPromise((resolve, reject) => {
            reject(new Error(`${argument} rejected`));
          });
        return async.asyncify(promisified)('argument')
          .catch(err => err)
          .then(err => {
            assert(err);
            expect(err.message).to.equal('argument rejected');
          });
      });

      // Removed 'callback error @nodeonly', as new throw propagates through the promise chain
      // https://github.com/caolan/async/blob/master/mocha_test/asyncify.js#L95

      // Removed 'dont catch errors in the callback @nodeonly', as new throw propagates through the promise chain
      // https://github.com/caolan/async/blob/master/mocha_test/asyncify.js#L95
    }

    describe('native-promise-only', () => {
      const NativePromise = require('native-promise-only');
      promisifiedTests(NativePromise);
    });

    describe('bluebird', () => {
      const BluebirdPromise = require('bluebird');
      promisifiedTests(BluebirdPromise);
    });

    describe('es6-promise', () => {
      const ES6Promise = require('es6-promise').Promise;
      promisifiedTests(ES6Promise);
    });

    describe('rsvp', () => {
      const RsvpPromise = require('rsvp').Promise;
      promisifiedTests(RsvpPromise);
    });
  });
});

import * as assert from 'assert';
import { expect } from 'chai';
import * as pasync from '../lib';
import sleep from './support/sleep';

describe('waterfall', () => {
  it('basics', () => {
    const callOrder = [];
    return pasync.waterfall([
      async () => {
        callOrder.push('fn1');
        await sleep(0);
        return ['one', 'two'];
      },
      async ([arg1, arg2]) => {
        callOrder.push('fn2');
        expect(arg1).to.equal('one');
        expect(arg2).to.equal('two');
        await sleep(25);
        return [arg1, arg2, 'three'];
      },
      async ([arg1, arg2, arg3]) => {
        callOrder.push('fn3');
        expect(arg1).to.equal('one');
        expect(arg2).to.equal('two');
        expect(arg3).to.equal('three');
        return 'four';
      },
      async arg4 => {
        callOrder.push('fn4');
        expect(callOrder).to.eql(['fn1', 'fn2', 'fn3', 'fn4']);
        return 'test';
      }
    ])
    .catch(err => {
      expect(err).to.not.exist;
    });
  });

  it('empty array', () => {
    return pasync.waterfall([])
      .catch(err => {
        expect(err).to.not.exist;
      });
  });

  it('non-array', () => {
    return pasync.waterfall({})
      .catch(err => {
        expect(err.message).to.equal(
          'First argument to waterfall must be an array of functions'
        );
      });
  });

  // Removed 'no callback', there cannot be no callback with promises.
  // https://github.com/caolan/async/blob/9b0f9eb1854cbc30960251a71ff8ce08bfa9dc0a/mocha_test/waterfall.js#L52

  // Removed 'async', there cannot be a middle return.
  // https://github.com/caolan/async/blob/9b0f9eb1854cbc30960251a71ff8ce08bfa9dc0a/mocha_test/waterfall.js#L59

  it('error', () => {
    return pasync.waterfall([
      async () => {
        throw new Error('error');
      },
      async () => {
        assert(false, 'next function should not be called');
      }
    ])
    .catch(err => err)
    .then(err => {
      expect(err.message).to.equal('error');
    });
  });

  // Removed 'multiple callback calls', there cannot be muliple callback calls with async functions
  // https://github.com/caolan/async/blob/9b0f9eb1854cbc30960251a71ff8ce08bfa9dc0a/mocha_test/waterfall.js#L93

  // Removed 'multiple callback calls (trickier) @nodeonly', there cannot be muliple callback calls with async functions
  // https://github.com/caolan/async/blob/9b0f9eb1854cbc30960251a71ff8ce08bfa9dc0a/mocha_test/waterfall.js#L108

  it('call in another context @nycinvalid @nodeonly', done => {
    const vm = require('vm');
    const sandbox = {
      async: pasync,
      done
    };

    const fn = `
      (function () {
        async.waterfall([
          function () {
            return Promise.resolve()
          }
        ])
        .then(function () { done() })
        .catch(function (err) { done(err) })
      }())
    `;

    vm.runInNewContext(fn, sandbox);
  });

  // Removed 'should not use unnecessary deferrals', cannot be implemented with promises
  // https://github.com/caolan/async/blob/9b0f9eb1854cbc30960251a71ff8ce08bfa9dc0a/mocha_test/waterfall.js#L160
});

import * as async from 'async';
import { expect } from 'chai';

describe('console functions', () => {
  const names = [
    'log',
    'dir'
    /* 'info'
        'warn'
        'error' */
  ];

  // generates tests for console functions such as async.log
  names.forEach(name => {
    if (typeof console !== 'undefined') {
      it(name, done => {
        const fn = (arg1, callback) => {
          expect(arg1).to.equal('one');
          setTimeout(() => {
            callback(null, 'test');
          }, 0);
        };
        const fn_err = (arg1, callback) => {
          expect(arg1).to.equal('one');
          setTimeout(() => {
            callback('error');
          }, 0);
        };
        const _console_fn = console[name];
        const _error = console.error;
        console[name] = function(val) {
          expect(val).to.equal('test');
          expect(arguments.length).to.equal(1);
          console.error = val => {
            expect(val).to.equal('error');
            console[name] = _console_fn;
            console.error = _error;
            done();
          };
          async[name](fn_err, 'one');
        };
        async[name](fn, 'one');
      });

      it(`${name} with multiple result params`, done => {
        const fn = callback => {
          callback(null, 'one', 'two', 'three');
        };
        const _console_fn = console[name];
        const called_with = [];
        console[name] = x => {
          called_with.push(x);
        };
        async[name](fn);
        expect(called_with).to.eql(['one', 'two', 'three']);
        console[name] = _console_fn;
        done();
      });
    }

    // browser-only test
    if (typeof window !== 'undefined') {
      it(`${name} without console.${name}`, done => {
        const _console = window.console;
        window.console = undefined;
        const fn = callback => {
          callback(null, 'val');
        };
        const fn_err = callback => {
          callback('error');
        };
        async[name](fn);
        async[name](fn_err);
        window.console = _console;
        done();
      });
    }
  });
});

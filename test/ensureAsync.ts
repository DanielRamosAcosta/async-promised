import * as assert from 'assert';
import * as async from 'async';
import { expect } from 'chai';

describe('ensureAsync', () => {
  const passContext = function(cb) {
    cb(this);
  };

  it('defer sync functions', done => {
    let sync = true;
    async.ensureAsync((arg1, arg2, cb) => {
      expect(arg1).to.equal(1);
      expect(arg2).to.equal(2);
      cb(null, 4, 5);
    })(1, 2, (err, arg4, arg5) => {
      expect(err).to.equal(null);
      expect(arg4).to.equal(4);
      expect(arg5).to.equal(5);
      assert(!sync, 'callback called on same tick');
      done();
    });
    sync = false;
  });

  it('do not defer async functions', done => {
    let sync = false;
    async.ensureAsync((arg1, arg2, cb) => {
      expect(arg1).to.equal(1);
      expect(arg2).to.equal(2);
      async.setImmediate(() => {
        sync = true;
        cb(null, 4, 5);
        sync = false;
      });
    })(1, 2, (err, arg4, arg5) => {
      expect(err).to.equal(null);
      expect(arg4).to.equal(4);
      expect(arg5).to.equal(5);
      assert(sync, 'callback called on next tick');
      done();
    });
  });

  it('double wrapping', done => {
    let sync = true;
    async.ensureAsync(
      async.ensureAsync((arg1, arg2, cb) => {
        expect(arg1).to.equal(1);
        expect(arg2).to.equal(2);
        cb(null, 4, 5);
      })
    )(1, 2, (err, arg4, arg5) => {
      expect(err).to.equal(null);
      expect(arg4).to.equal(4);
      expect(arg5).to.equal(5);
      assert(!sync, 'callback called on same tick');
      done();
    });
    sync = false;
  });

  it('should propely bind context to the wrapped function', done => {
    // call bind after wrapping with ensureAsync
    const context = { context: 'post' };
    let postBind = async.ensureAsync(passContext);
    postBind = postBind.bind(context);
    postBind(ref => {
      expect(ref).to.equal(context);
      done();
    });
  });

  it('should not override the bound context of a function when wrapping', done => {
    // call bind before wrapping with ensureAsync
    const context = { context: 'pre' };
    let preBind = passContext.bind(context);
    preBind = async.ensureAsync(preBind);
    preBind(ref => {
      expect(ref).to.equal(context);
      done();
    });
  });
});

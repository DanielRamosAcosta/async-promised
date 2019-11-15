import assert from "assert";
import * as async from ".";

describe("asyncify", () => {
  it("asyncify", () => {
    const parse = async.asyncify(JSON.parse);
    return parse('{"a":1}').then(result => {
      expect(result.a).toEqual(1);
    });
  });

  it("asyncify null", () => {
    const parse = async.asyncify(() => null);
    return parse('{"a":1}').then(result => {
      expect(result).toEqual(null);
    });
  });

  it("variable numbers of arguments", () => {
    return async
      .asyncify((...args) => {
        return args;
      })(1, 2, 3)
      .then(result => {
        expect(result.length).toEqual(3);
        expect(result[0]).toEqual(1);
        expect(result[1]).toEqual(2);
        expect(result[2]).toEqual(3);
      });
  });

  it("catch errors", () => {
    return async
      .asyncify(() => {
        throw new Error("foo");
      })()
      .catch(err => err)
      .then(err => {
        assert(err);
        expect(err.message).toEqual("foo");
      });
  });

  // Removed 'dont catch errors in the callback', doesn't make sense with promises
  // https://github.com/caolan/async/blob/master/mocha_test/asyncify.js#L49

  describe("promisified", () => {
    function promisifiedTests(CustomPromise) {
      it("resolve", () => {
        const promisified = argument =>
          new CustomPromise(resolve => {
            setTimeout(() => {
              resolve(`${argument} resolved`);
            }, 15);
          });
        return async
          .asyncify(promisified)("argument")
          .then(value => {
            expect(value).toEqual("argument resolved");
          });
      });

      it("reject", () => {
        const promisified = argument =>
          new CustomPromise((resolve, reject) => {
            reject(new Error(`${argument} rejected`));
          });
        return async
          .asyncify(promisified)("argument")
          .catch(err => err)
          .then(err => {
            assert(err);
            expect(err.message).toEqual("argument rejected");
          });
      });

      // Removed 'callback error @nodeonly', as new throw propagates through the promise chain
      // https://github.com/caolan/async/blob/master/mocha_test/asyncify.js#L95

      // Removed 'dont catch errors in the callback @nodeonly', as new throw propagates through the promise chain
      // https://github.com/caolan/async/blob/master/mocha_test/asyncify.js#L95
    }

    /* describe("native-promise-only", () => {
      const NativePromise = require("native-promise-only");
      promisifiedTests(NativePromise);
    });

    describe("bluebird", () => {
      const BluebirdPromise = require("bluebird");
      promisifiedTests(BluebirdPromise);
    });

    describe("es6-promise", () => {
      const ES6Promise = require("es6-promise").Promise;
      promisifiedTests(ES6Promise);
    });

    describe("rsvp", () => {
      const RsvpPromise = require("rsvp").Promise;
      promisifiedTests(RsvpPromise);
    }); */
  });
});

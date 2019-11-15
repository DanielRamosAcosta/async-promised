import assert from "assert";
import * as async from "../lib";
import sleep from "./support/sleep";

describe("ensureAsync", () => {
  const passContext = async function() {
    return this;
  };

  it("defer sync functions", () => {
    let sync = true;

    const prom = async
      .ensureAsync(async (arg1: number, arg2: number) => {
        expect(arg1).toEqual(1);
        expect(arg2).toEqual(2);
        return 4;
      })(1, 2)
      .then(result => {
        expect(result).toEqual(4);
        assert(!sync, "callback called on same tick");
      });

    sync = false;

    return prom;
  });

  it("do not defer async functions", () => {
    let sync = false;

    return async
      .ensureAsync(async (arg1: number, arg2: number) => {
        expect(arg1).toEqual(1);
        expect(arg2).toEqual(2);
        await sleep(0);
        sync = true;
        return 4;
      })(1, 2)
      .then(result => {
        expect(result).toEqual(4);
        assert(sync, "callback called on next tick");
      });
  });

  it("double wrapping", () => {
    let sync = true;

    const prom = async
      .ensureAsync(
        async.ensureAsync(async (arg1: number, arg2: number) => {
          expect(arg1).toEqual(1);
          expect(arg2).toEqual(2);
          return 4;
        })
      )(1, 2)
      .then(result => {
        expect(result).toEqual(4);
        assert(!sync, "callback called on same tick");
      });
    sync = false;
    return prom;
  });

  it("should propely bind context to the wrapped function", () => {
    // call bind after wrapping with ensureAsync
    const context = { context: "post" };
    let postBind = async.ensureAsync(passContext);
    postBind = postBind.bind(context);
    return postBind().then(ref => {
      expect(ref).toEqual(context);
    });
  });

  it("should not override the bound context of a function when wrapping", () => {
    // call bind before wrapping with ensureAsync
    const context = { context: "pre" };
    let preBind = passContext.bind(context);
    preBind = async.ensureAsync(preBind);
    return preBind().then(ref => {
      expect(ref).toEqual(context);
    });
  });
});

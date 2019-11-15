import * as async from ".";
import sleep from "./support/sleep";

describe("timeout", () => {
  it("timeout with series", () => {
    return async
      .series([
        async.timeout(async function asyncFn() {
          await sleep(25);
          return "I didn't time out";
        }, 50),
        async.timeout(async function asyncFn() {
          await sleep(75);
          return "I will time out";
        }, 50)
      ])
      .catch(err => err)
      .then(err => {
        expect(err.message).toEqual('Callback function "asyncFn" timed out.');
        expect(err.code).toEqual("ETIMEDOUT");
        expect(err.info).toEqual(undefined);
      });
  });

  it("timeout with series and info", () => {
    const info = { custom: "info about callback" };
    return async
      .series([
        async.timeout(async function asyncFn() {
          await sleep(25);
          return "I didn't time out";
        }, 50),
        async.timeout(
          async function asyncFn() {
            await sleep(75);
            return "I will time out";
          },
          50,
          info
        )
      ])
      .catch(err => err)
      .then(err => {
        expect(err.message).toEqual('Callback function "asyncFn" timed out.');
        expect(err.code).toEqual("ETIMEDOUT");
        expect(err.info).toEqual(info);
      });
  });

  it("timeout with parallel", () => {
    return async
      .parallel([
        async.timeout(async function asyncFn() {
          await sleep(25);
          return "I didn't time out";
        }, 50),
        async.timeout(async function asyncFn() {
          await sleep(75);
          return "I will time out";
        }, 50)
      ])
      .catch(err => err)
      .then(err => {
        expect(err.message).toEqual('Callback function "asyncFn" timed out.');
        expect(err.code).toEqual("ETIMEDOUT");
        expect(err.info).toEqual(undefined);
      });
  });

  it("timeout with multiple calls (#1418)", () => {
    const timeout = async.timeout(async function asyncFn(n: number) {
      if (n < 1) {
        await sleep(75);
        return "I will time out";
      } else {
        await sleep(5);
        return "I didn't time out";
      }
    }, 50);

    return async.series([
      () => {
        return timeout(0)
          .catch(err => err)
          .then(err => {
            expect(err.message).toEqual(
              'Callback function "asyncFn" timed out.'
            );
            expect(err.code).toEqual("ETIMEDOUT");
            expect(err.info).toEqual(undefined);
          });
      },
      () => {
        return timeout(1).then(result => {
          expect(result).toEqual("I didn't time out");
        });
      }
    ]);
  });
});

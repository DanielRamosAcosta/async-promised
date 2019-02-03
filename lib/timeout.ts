import { timeout as asyncTimeout } from "async";
import { AsyncResultPromise } from "./internal/asyncTransforms";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class TimeoutError<T> extends Error {
  public code: string;
  public info?: T;

  constructor(message?: string, info?: T) {
    super(message);
    this.code = "ETIMEDOUT";
    this.info = info;
  }
}

/**
 * Sets a time limit on an asynchronous function. If the function does not call
 * its callback within the specified milliseconds, it will be called with a
 * timeout error. The code property for the error object will be `'ETIMEDOUT'`.
 *
 * @name timeout
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} asyncFn - The async function to limit in time.
 * @param {number} milliseconds - The specified time limit.
 * @param {*} [info] - Any variable you want attached (`string`, `object`, etc)
 * to timeout Error for more information..
 * @returns {AsyncFunction} Returns a wrapped function that can be used with any
 * of the control flow functions.
 * Invoke this function with the same parameters as you would `asyncFunc`.
 * @example
 *
 * async function myFunction(foo) {
 *     const values = await doAsyncTask(foo)
 *     // do some stuff ...
 *
 *     // return processed data
 *
 *     return data
 * }
 *
 * const wrapped = async.timeout(myFunction, 1000);
 *
 * // call `wrapped` as you would `myFunction`
 * wrapped({ bar: 'bar' }).then(data => {
 *     // if `myFunction` takes < 1000 ms to execute, `data` will have the expected value
 *
 *     // else the promise will rejected with an Error with the code 'ETIMEDOUT'
 * });
 */
export default function timeout<T extends AsyncResultPromise, U>(
  asyncFn: T,
  milliseconds: number,
  info?: U
): T {
  const wrappedFn: any = (...args: any[]) =>
    Promise.race([
      asyncFn(...args),
      sleep(milliseconds).then(() =>
        Promise.reject(
          new TimeoutError<U>(
            `Callback function "${asyncFn.name || "anonymous"}" timed out.`,
            info
          )
        )
      )
    ]);
  return wrappedFn;
}

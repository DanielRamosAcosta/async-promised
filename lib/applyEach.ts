import { applyEach as asyncApplyEach } from 'async';
import { AsyncResultCallback, AsyncResultPromise, callbackifyFuncs } from './internal/asyncTransforms';

/**
 * Applies the provided arguments to each function in the array, calling
 * resolving the promise after all functions have completed. If you only provide
 * the first argument, `fns`, then it will return a function which lets you pass
 * in the arguments as if it were a single function call. If more arguments are
 * provided, it'll return a promise, applying the args to each function.
 *
 * @name applyEach
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} fns - A collection of {@link AsyncFunction}s
 * to all call with the same arguments
 * @param {...*} [args] - Any number of separate arguments to pass to the
 * function.
 * @returns {Function} - If only the first argument, `fns`, is provided, it will
 * return a function which lets you pass in the arguments as if it were a single
 * function call. The signature is `(...args)`, and returns a Promise.
 * @example
 *
 * const promise = async.applyEach([enableSearch, updateSchema], 'bucket');
 *
 * // partial application example:
 * const otherPromise = async.each(
 *   buckets,
 *   async.applyEach([enableSearch, updateSchema])
 * );
 */

export default function applyEach(fns: AsyncResultPromise[], ...args: any[]): Promise<any> | AsyncResultPromise {
  if (args.length < 1) {
    const fn: AsyncResultCallback = asyncApplyEach(callbackifyFuncs(fns));
    return (...innerArgs: any[]) => {
      return new Promise((resolve, reject) => {
        fn(...innerArgs, (err: Error, results: any) =>
          err
          ? reject(err)
          : resolve(results)
        );
      });
    };
  }

  return new Promise((resolve, reject) => {
    const callback = (err: Error, results: any) => {
      err
      ? reject(err)
      : resolve(results);
    };
    const realArgs = args.concat(callback);
    asyncApplyEach(callbackifyFuncs(fns), ...realArgs);
  });
}

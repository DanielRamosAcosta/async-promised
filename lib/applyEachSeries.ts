import { applyEachSeries as asyncApplyEachSeries } from 'async';
import { AsyncResultCallback, AsyncResultPromise, callbackifyFuncs } from './internal/asyncTransforms';

/**
 * The same as [`applyEach`]{@link module:ControlFlow.applyEach} but runs only a single async operation at a time.
 *
 * @name applyEachSeries
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.applyEach]{@link module:ControlFlow.applyEach}
 * @category Control Flow
 * @param {Array|Iterable|Object} fns - A collection of {@link AsyncFunction}s
 * to all call with the same arguments
 * @param {...*} [args] - Any number of separate arguments to pass to the
 * function.
 * @returns {Function} - If only the first argument, `fns`, is provided, it will
 * return a function which lets you pass in the arguments as if it were a single
 * function call. The signature is `(...args)`, and returns a Promise.
 */

export default function applyEachSeries(fns: AsyncResultPromise[], ...args: any[]): Promise<any> | AsyncResultPromise {
  if (args.length < 1) {
    const fn: AsyncResultCallback = asyncApplyEachSeries(callbackifyFuncs(fns));
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
    asyncApplyEachSeries(callbackifyFuncs(fns), ...realArgs);
  });
}

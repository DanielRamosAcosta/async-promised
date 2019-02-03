import { retry as asyncRetry } from "async";
import {
  AsyncResultPromise,
  callbackify,
  resolveCallback
} from "./internal/asyncTransforms";

type RetryFunc = (retryCount: number) => number;

interface IRetryOptions {
  /**
   * The number of attempts to make before giving up. The default is 5.
   */
  times?: number;
  /**
   * The time to wait between retries, in milliseconds. The default is 0. The
   * interval may also be specified as a function of the retry count (see
   * example).
   */
  interval?: number | RetryFunc;
  /**
   * An optional synchronous function that is invoked on erroneous result. If it
   * returns true the retry attempts will continue; if the function returns
   * false the retry flow is aborted with the current attempt's error and result
   * being returned to the final callback. Invoked with (err).
   */
  errorFilter?: Function;
}

/**
 * Attempts to get a successful response from `task` no more than `times` times
 * before returning an error. If the task is successful, the `callback` will be
 * passed the result of the successful task. If all attempts fail, the callback
 * will be passed the error and result (if any) of the final attempt.
 *
 * @name retry
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @see [async.retryable]{@link module:ControlFlow.retryable}
 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - Can be either an
 * object with `times` and `interval` or a number.
 * * `times` - The number of attempts to make before giving up.  The default
 *   is `5`.
 * * `interval` - The time to wait between retries, in milliseconds.  The
 *   default is `0`. The interval may also be specified as a function of the
 *   retry count (see example).
 * * `errorFilter` - An optional synchronous function that is invoked on
 *   erroneous result. If it returns `true` the retry attempts will continue;
 *   if the function returns `false` the retry flow is aborted with the current
 *   attempt's error and result being returned to the final callback.
 *   Invoked with (err).
 * * If `opts` is a number, the number specifies the number of times to retry,
 *   with the default interval of `0`.
 * @param {AsyncFunction} task - An async function to retry.
 * Invoked with (callback).
 * @param {Function} [callback] - An optional callback which is called when the
 * task has succeeded, or after the final failed attempt. It receives the `err`
 * and `result` arguments of the last attempt at completing the `task`. Invoked
 * with (err, results).
 *
 * @example
 *
 * // The `retry` function can be used as a stand-alone control flow by passing
 * // a callback, as shown below:
 *
 * // try calling apiMethod 3 times
 * async.retry(3, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod 3 times, waiting 200 ms between each retry
 * async.retry({times: 3, interval: 200}, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod 10 times with exponential backoff
 * // (i.e. intervals of 100, 200, 400, 800, 1600, ... milliseconds)
 * async.retry({
 *   times: 10,
 *   interval: function(retryCount) {
 *     return 50 * Math.pow(2, retryCount);
 *   }
 * }, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod the default 5 times no delay between each retry
 * async.retry(apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod only when error condition satisfies, all other
 * // errors will abort the retry control flow and return to final callback
 * async.retry({
 *   errorFilter: function(err) {
 *     return err.message === 'Temporary error'; // only retry on a specific error
 *   }
 * }, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // to retry individual methods that are not as reliable within other
 * // control flow functions, use the `retryable` wrapper:
 * async.auto({
 *     users: api.getUsers.bind(api),
 *     payments: async.retryable(3, api.getPayments.bind(api))
 * }, function(err, results) {
 *     // do something with the results
 * });
 *
 */
export default function retry<T extends AsyncResultPromise>(
  fn: T
): ReturnType<T>;
export default function retry<T extends AsyncResultPromise>(
  timesOrOptions: number | IRetryOptions,
  fn: T
): ReturnType<T>;
export default function retry<T extends AsyncResultPromise>(
  timesOrFnOrOptions: number | IRetryOptions | T,
  fn?: T
): Promise<ReturnType<T>> {
  return new Promise((resolve, reject) => {
    if (!timesOrFnOrOptions) {
      return reject(new Error("Invalid arguments for async.retry"));
    }

    if (typeof timesOrFnOrOptions === "function") {
      if (fn != null) {
        return reject(new Error("Invalid arguments for async.retry"));
      }
      asyncRetry(
        callbackify(timesOrFnOrOptions),
        resolveCallback(resolve, reject)
      );
    } else {
      if (typeof fn !== "function") {
        return reject(new Error("Invalid arguments for async.retry"));
      }
      asyncRetry(
        timesOrFnOrOptions,
        callbackify(fn),
        resolveCallback(resolve, reject)
      );
    }
  });
}

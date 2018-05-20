import { retryable as asyncRetryable } from "async";
import { callbackify, resolveCallback } from "./internal/asyncTransforms";

/**
 * A close relative of [`retry`]{@link module:ControlFlow.retry}.  This method
 * wraps a task and makes it retryable, rather than immediately calling it
 * with retries.
 *
 * @name retryable
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.retry]{@link module:ControlFlow.retry}
 * @category Control Flow
 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - optional
 * options, exactly the same as from `retry`
 * @param {AsyncFunction} task - the asynchronous function to wrap.
 * This function will be passed any arguments passed to the returned wrapper.
 * Invoked with (...args, callback).
 * @returns {AsyncFunction} The wrapped function, which when invoked, will
 * retry on an error, based on the parameters specified in `opts`.
 * This function will accept the same parameters as `task`.
 * @example
 *
 * async.auto({
 *     dep1: async.retryable(3, getFromFlakyService),
 *     process: ["dep1", async.retryable(3, function (results, cb) {
 *         maybeProcessData(results.dep1, cb);
 *     })]
 * }, callback);
 */

export interface IRetryableConfig {
  times: number;
  interval: number;
}

export type TRetryableOpts = IRetryableConfig | number;

const defaultOpts: TRetryableOpts = {
  interval: 0,
  times: 5
};

export type TAsyncFunc<T, R> = (params: T) => Promise<R>;

export default function retryable<T, R>(fn: TAsyncFunc<T, R>): TAsyncFunc<T, R>;
export default function retryable<T, R>(
  opts: TRetryableOpts | TAsyncFunc<T, R>,
  fn?: TAsyncFunc<T, R>
): TAsyncFunc<T, R>;

export default function retryable<T, R>(
  opts: TRetryableOpts | TAsyncFunc<T, R>,
  fn?: TAsyncFunc<T, R>
): TAsyncFunc<T, R> {
  const fnRetryable =
    typeof opts === "function"
      ? asyncRetryable(callbackify(opts))
      : asyncRetryable(opts, callbackify(fn));

  return (...args: any[]) => {
    return new Promise((resolve, reject) => {
      fnRetryable(...args, resolveCallback(resolve, reject));
    });
  };
}

import { doDuring as asyncDoDuring } from "async";
import { callbackify, resolveCallback } from "./internal/asyncTransforms";

/**
 * The post-check version of [`during`]{@link module:ControlFlow.during}. To reflect the difference in
 * the order of operations, the arguments `test` and `fn` are switched.
 *
 * Also a version of [`doWhilst`]{@link module:ControlFlow.doWhilst} with asynchronous `test` function.
 * @name doDuring
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.during]{@link module:ControlFlow.during}
 * @category Control Flow
 * @param {AsyncFunction} fn - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {AsyncFunction} test - asynchronous truth test to perform before each
 * execution of `fn`. Invoked with (...args, callback), where `...args` are the
 * non-error args from the previous callback of `fn`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error if one occurred, otherwise `null`.
 */
export default function doDuring<T>(
  fn: () => Promise<T>,
  test: (arg: T) => Promise<boolean>
): Promise<void> {
  return new Promise((resolve, reject) => {
    asyncDoDuring(
      callbackify(fn),
      callbackify(test),
      resolveCallback(resolve, reject)
    );
  });
}

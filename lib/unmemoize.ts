import { memoize as asyncMemoize } from "async";
import { AsyncResultPromise } from "./internal/asyncTransforms";

/**
 * Undoes a [memoize]{@link module:Utils.memoize}d function, reverting it to the original,
 * unmemoized form. Handy for testing.
 *
 * @name unmemoize
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.memoize]{@link module:Utils.memoize}
 * @category Util
 * @param {AsyncFunction} fn - the memoized function
 * @returns {AsyncFunction} a function that calls the original unmemoized function
 */
export default function unmemoize<T extends AsyncResultPromise>(fn: T) {
  return (...args: any[]) => {
    return (fn.unmemoized || fn)(...args);
  };
}

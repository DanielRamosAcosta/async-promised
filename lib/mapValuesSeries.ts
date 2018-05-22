import { Dictionary, mapValuesSeries as asyncMapValuesSeries } from "async";
import { callbackify, resolveCallback } from "./internal/asyncTransforms";
/**
 * The same as [`mapValues`]{@link module:Collections.mapValues} but runs only a single async operation at a time.
 *
 * @name mapValuesSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.mapValues]{@link module:Collections.mapValues}
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 */
export default function mapValuesSeries<T, R>(
  obj: Dictionary<T>,
  iteratee: (value: T, key: string) => Promise<R>
): Promise<R> {
  return new Promise((resolve, reject) => {
    asyncMapValuesSeries(
      obj,
      callbackify(iteratee),
      resolveCallback(resolve, reject)
    );
  });
}

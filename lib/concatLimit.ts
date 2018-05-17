import { concatLimit as asyncConcatLimit } from "async";
import { callbackify, resolveCallback } from "./internal/asyncTransforms";

/**
 * The same as [`concat`]{@link module:Collections.concat} but runs a maximum of `limit` async operations at a time.
 *
 * @name concatLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.concat]{@link module:Collections.concat}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
 * which should use an array as its result. Invoked with (item, callback).
 */
export default function concatLimit<T>(
  coll: T[] | IterableIterator<T>,
  limit: number,
  iteratee: (item: T) => Promise<any>
): Promise<any> {
  return new Promise((resolve, reject) => {
    asyncConcatLimit(
      coll,
      limit,
      callbackify(iteratee),
      resolveCallback(resolve, reject)
    );
  });
}

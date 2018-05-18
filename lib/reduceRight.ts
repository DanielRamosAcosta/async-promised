import { reduceRight as asyncReduceRight } from "async";

/**
 * Same as [`reduce`]{@link module:Collections.reduce}, only operates on `array` in reverse order.
 *
 * @name reduceRight
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reduce]{@link module:Collections.reduce}
 * @alias foldr
 * @category Collection
 * @param {Array} array - A collection to iterate over.
 * @param {*} memo - The initial state of the reduction.
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * array to produce the next step in the reduction.
 * The `iteratee` should complete with the next state of the reduction.
 * If the iteratee complete with an error, the reduction is stopped and the
 * main `callback` is immediately called with the error.
 * Invoked with (memo, item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the reduced value. Invoked with
 * (err, result).
 */
export default function reduce<T, R>(
  arr: T[] | IterableIterator<T>,
  memo: R,
  iterator: (memo: R, item: T) => Promise<R>
) {
  return new Promise((resolve, reject) => {
    asyncReduceRight(
      arr,
      memo,
      (cbMemo, cbItem, callback) => {
        iterator(cbMemo as R, cbItem)
          .then(result => {
            callback(undefined, result);
          })
          .catch(err => {
            callback(err);
          });
      },
      (err, result) => {
        err ? reject(err) : resolve(result);
      }
    );
  });
}

import { sortBy as asyncSortBy } from 'async';
import { callbackify, resolveCallback } from './internal/asyncTransforms';

/**
 * Sorts a list by the results of running each `coll` value through an async
 * `iteratee`.
 *
 * @name sortBy
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a value to use as the sort criteria as
 * its `result`.
 * Invoked with (item, callback).
 * @returns {Promise} - The promis resolves after all `iteratee` functions have
 * finished. Results is the items from the original `coll` sorted by the values
 * returned by the `iteratee` calls.
 * @example
 *
 * async.sortBy(['file1','file2','file3'], function(file, callback) {
 *   fs.stat(file, function(err, stats) {
 *     callback(err, stats.mtime);
 *   });
 * }, function(err, results) {
 *   // results is now the original array of files sorted by
 *   // modified date
 * });
 *
 * // By modifying the callback parameter the
 * // sorting order can be influenced:
 *
 * // ascending order
 * async.sortBy([1,9,3,5], function(x, callback) {
 *   callback(null, x);
 * }, function(err,result) {
 *   // result callback
 * });
 *
 * // descending order
 * async.sortBy([1,9,3,5], function(x, callback) {
 *     callback(null, x*-1);    //<- x*-1 instead of x, turns the order around
 * }, function(err,result) {
 *     // result callback
 * });
 */

export default function sortBy<T, V>(
  coll: T[] | IterableIterator<T>,
  iteratee: (item: T) => Promise<V>
): Promise<T> {
  return new Promise((resolve, reject) => {
    asyncSortBy(coll, callbackify(iteratee), resolveCallback(resolve, reject));
  });
}

export type AsyncResultIterator<T, V> = (item: T) => Promise<V>;

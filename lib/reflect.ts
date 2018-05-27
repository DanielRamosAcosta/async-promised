import { reflect as asyncReflect } from "async";
import { callbackify, resolveCallback } from "./internal/asyncTransforms";

export type TReflectReturn<R> = Promise<{ value: R } | { error: R }>;

export type TReflectInput0<R> = () => Promise<R>;
export type TReflectInput1<R, T1> = (a1: T1) => Promise<R>;
export type TReflectInput2<R, T1, T2> = (a1: T1, a2: T2) => Promise<R>;
export type TReflectInput3<R, T1, T2, T3> = (
  a1: T1,
  a2: T2,
  a3: T3
) => Promise<R>;

export type TReflectOutput0<R> = () => TReflectReturn<R>;
export type TReflectOutput1<R, T1> = (a1: T1) => TReflectReturn<R>;
export type TReflectOutput2<R, T1, T2> = (a1: T1, a2: T2) => TReflectReturn<R>;
export type TReflectOutput3<R, T1, T2, T3> = (
  a1: T1,
  a2: T2,
  a3: T3
) => TReflectReturn<R>;

/**
 * Wraps the async function in another function that always completes with a
 * result object, even when it errors.
 *
 * The result object has either the property `error` or `value`.
 *
 * @name reflect
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - The async function you want to wrap
 * @returns {Function} - A function that always passes null to it's callback as
 * the error. The second argument to the callback will be an `object` with
 * either an `error` or a `value` property.
 * @example
 *
 * async.parallel([
 *     async.reflect(function(callback) {
 *         // do some stuff ...
 *         callback(null, 'one');
 *     }),
 *     async.reflect(function(callback) {
 *         // do some more stuff but error ...
 *         callback('bad stuff happened');
 *     }),
 *     async.reflect(function(callback) {
 *         // do some more stuff ...
 *         callback(null, 'two');
 *     })
 * ],
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results[0].value = 'one'
 *     // results[1].error = 'bad stuff happened'
 *     // results[2].value = 'two'
 * });
 */
export default function reflect<R>(fn: TReflectInput0<R>): TReflectOutput0<R>;
export default function reflect<R, T1>(
  fn: TReflectInput1<R, T1>
): TReflectOutput1<R, T1>;
export default function reflect<R, T1, T2>(
  fn: TReflectInput2<R, T1, T2>
): TReflectOutput2<R, T1, T2>;
export default function reflect<R, T1, T2, T3>(
  fn: TReflectInput3<R, T1, T2, T3>
): TReflectOutput3<R, T1, T2, T3>;
export default function reflect<R, T1, T2, T3>(
  fn: TReflectInput3<R, T1, T2, T3>
): TReflectOutput3<R, T1, T2, T3> {
  const rfn = asyncReflect(callbackify(fn));
  return (...args: any[]) => {
    return new Promise((resolve, reject) => {
      rfn(...args, resolveCallback(resolve, reject));
    });
  };
}

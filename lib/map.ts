import { Dictionary, isIterable, isObject } from "./internal/type-check";

export default async function map<T, R>(
  arr: Dictionary<T> | T[] | IterableIterator<T> | Map<any, T> | Set<T>,
  iterator: (item: T) => Promise<R>
): Promise<R[]> {
  if (Array.isArray(arr)) {
    return Promise.all(arr.map(item => iterator(item)));
  }

  if (isIterable(arr)) {
    return map([...arr], iterator);
  }

  if (isObject(arr)) {
    return map(Object.values(arr), iterator);
  }

  return Promise.resolve([]);
}

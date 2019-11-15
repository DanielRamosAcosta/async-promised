export function isIterable(obj: any): obj is Array<any> {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === "function";
}

export function isObject(object: any): object is Object {
  return typeof object === "object";
}

export type Dictionary<T> = { [key: string]: T };

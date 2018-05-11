export interface IDictionary<T> {
  [key: number]: T;
  length: number;
}

export default function slice<T>(arrayLike: T[] | IDictionary<T>, start = 0) {
  return Array.isArray(arrayLike)
  ? arrayLike.slice(start, arrayLike.length)
  : objectSlice(arrayLike, start);
}

function objectSlice<T>(arrayLike: IDictionary<T>, start = 0) {
    const newLen = Math.max(arrayLike.length - start, 0);
    const newArr = Array(newLen);
    for (let idx = 0; idx < newLen; idx++)  {
        newArr[idx] = arrayLike[start + idx];
    }
    return newArr;
}

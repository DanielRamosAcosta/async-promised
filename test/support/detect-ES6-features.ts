/**
 * Detects if there is support for async/await in the current enviroment
 */
export function supportsAsyncAwait() {
  try {
    eval('async function foo(x) { return x }');
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Detects if there is support for arrow functions in the current enviroment
 */
export function supportsArrowFunction() {
  try {
    eval('x => x');
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Detects if there is support for default parameters inside object destructuring
 */
export function supportsDefaultObjectParameter() {
  try {
    eval(`function foo({ bar = 'One', baz = 23 }) {}`);
    return true;
  } catch (err) {
    return false;
  }
}

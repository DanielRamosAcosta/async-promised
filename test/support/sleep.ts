/**
 * Function that returns a promise that resolves when some time has passed
 * @param ms The time that you need to wait
 */
const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export default sleep;

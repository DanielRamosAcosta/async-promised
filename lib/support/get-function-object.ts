import sleep from "./sleep";

export default function getFunctionsObject(callOrder) {
  return {
    one(callback) {
      setTimeout(function() {
        callOrder.push(1);
        callback(null, 1);
      }, 125);
    },
    two(callback) {
      setTimeout(function() {
        callOrder.push(2);
        callback(null, 2);
      }, 200);
    },
    three(callback) {
      setTimeout(function() {
        callOrder.push(3);
        callback(null, 3, 3);
      }, 50);
    }
  };
}

export function getFunctionsObjectPromised(callOrder) {
  return {
    async one() {
      await sleep(125);
      callOrder.push(1);
      return 1;
    },
    async two() {
      await sleep(200);
      callOrder.push(2);
      return 2;
    },
    async three() {
      await sleep(50);
      callOrder.push(3);
      return 3;
    }
  };
}

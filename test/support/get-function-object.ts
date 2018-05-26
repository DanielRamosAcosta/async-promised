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

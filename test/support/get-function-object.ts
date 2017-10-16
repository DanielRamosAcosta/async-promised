export default function getFunctionsObject(call_order) {
  return {
      one(callback) {
          setTimeout(function() {
              call_order.push(1);
              callback(null, 1);
          }, 125);
      },
      two(callback) {
          setTimeout(function() {
              call_order.push(2);
              callback(null, 2);
          }, 200);
      },
      three(callback) {
          setTimeout(function() {
              call_order.push(3);
              callback(null, 3, 3);
          }, 50);
      }
  };
}

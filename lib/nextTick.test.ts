import * as async from ".";
import sleep from "./support/sleep";

describe("nextTick", () => {
  it("basics", async () => {
    const callOrder = [];
    async.nextTick().then(() => {
      callOrder.push("two");
    });

    callOrder.push("one");
    await sleep(50);
    expect(callOrder).toEqual(["one", "two"]);
  });

  it("nextTick in the browser @nodeonly", async () => {
    const callOrder = [];
    async.nextTick().then(() => {
      callOrder.push("two");
    });

    callOrder.push("one");
    await sleep(50);
    expect(callOrder).toEqual(["one", "two"]);
  });

  it("extra args", async () => {
    await async.nextTick(1, 2, 3).then(([a, b, c]) => {
      expect([a, b, c]).toEqual([1, 2, 3]);
    });
  });
});

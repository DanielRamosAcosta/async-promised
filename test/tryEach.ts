import * as assert from "assert";
import * as async from "async";
import { expect } from "chai";

describe("tryEach", () => {
  it("no callback", () => {
    async.tryEach([]);
  });
  it("empty", done => {
    async.tryEach([], (err, results) => {
      expect(err).to.equal(null);
      expect(results).to.eql(undefined);
      done();
    });
  });
  it("one task, multiple results", done => {
    const RESULTS = ["something", "something2"];
    async.tryEach(
      [
        callback => {
          callback(null, RESULTS[0], RESULTS[1]);
        }
      ],
      (err, results) => {
        expect(err).to.equal(null);
        expect(results).to.eql(RESULTS);
        done();
      }
    );
  });
  it("one task", done => {
    const RESULT = "something";
    async.tryEach(
      [
        callback => {
          callback(null, RESULT);
        }
      ],
      (err, results) => {
        expect(err).to.equal(null);
        expect(results).to.eql(RESULT);
        done();
      }
    );
  });
  it("two tasks, one failing", done => {
    const RESULT = "something";
    async.tryEach(
      [
        callback => {
          callback(new Error("Failure"), {});
        },
        callback => {
          callback(null, RESULT);
        }
      ],
      (err, results) => {
        expect(err).to.equal(null);
        expect(results).to.eql(RESULT);
        done();
      }
    );
  });
  it("two tasks, both failing", done => {
    const ERROR_RESULT = new Error("Failure2");
    async.tryEach(
      [
        callback => {
          callback(new Error("Should not stop here"));
        },
        callback => {
          callback(ERROR_RESULT);
        }
      ],
      (err, results) => {
        expect(err).to.equal(ERROR_RESULT);
        expect(results).to.eql(undefined);
        done();
      }
    );
  });
  it("two tasks, non failing", done => {
    const RESULT = "something";
    async.tryEach(
      [
        callback => {
          callback(null, RESULT);
        },
        () => {
          assert.fail("Should not been called");
        }
      ],
      (err, results) => {
        expect(err).to.equal(null);
        expect(results).to.eql(RESULT);
        done();
      }
    );
  });
});

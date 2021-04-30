// htps://medium.com/@karenmarkosyan/how-to-manage-promises-into-dynamic-queue-with-vanilla-javascript-9d0d1f8d4df5
class PromiseQueue {
  constructor() {
    this.queue = [];
    this.workingOnPromise = false;
    this.stop = false;
  }
  cancel() {
    this.stop = true;
  }
  enqueue(promise) {
    let fn = function () {
      return new Promise((resolve, reject) => {
        promise(resolve, reject);
      });
    };

    return new Promise((resolve, reject) => {
      this.queue.push({
        promise: fn,
        resolve,
        reject,
      });
      this.dequeue();
    });
  }

  dequeue() {
    if (this.workingOnPromise) {
      return false;
    }
    if (this.stop) {
      this.queue = [];
      this.stop = false;
      return;
    }
    const item = this.queue.shift();
    if (!item) {
      return false;
    }
    try {
      this.workingOnPromise = true;
      item
        .promise()
        .then((value) => {
          this.workingOnPromise = false;
          item.resolve(value);
          this.dequeue();
        })
        .catch((err) => {
          this.workingOnPromise = false;
          item.reject(err);
          this.dequeue();
        });
    } catch (err) {
      this.workingOnPromise = false;
      item.reject(err);
      this.dequeue();
    }
    return true;
  }
}
module.exports = PromiseQueue;

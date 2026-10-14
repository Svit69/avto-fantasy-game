import { ServiceCapacityError } from "./ServiceCapacityError.js";

export class BoundedTaskQueue {
  #active = 0;
  #waiting = [];
  constructor(concurrency = 1, capacity = 4) { Object.assign(this, { concurrency, capacity }); }
  runTask(task) {
    if (this.#active >= this.concurrency && this.#waiting.length >= this.capacity) return Promise.reject(new ServiceCapacityError("task_queue_full"));
    return new Promise((resolve, reject) => { this.#waiting.push({ task, resolve, reject }); this.#dispatch(); });
  }
  readStatus() { return { active: this.#active, waiting: this.#waiting.length, capacity: this.capacity }; }
  #dispatch() {
    while (this.#active < this.concurrency && this.#waiting.length) {
      const job = this.#waiting.shift(); this.#active += 1;
      const finishTask = (settle, value) => { this.#active -= 1; this.#dispatch(); settle(value); };
      Promise.resolve().then(job.task).then((value) => finishTask(job.resolve, value), (error) => finishTask(job.reject, error));
    }
  }
}

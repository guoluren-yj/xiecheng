import { Key } from 'react';
import { action } from 'mobx';
import debounce from 'lodash/debounce';
import { getIf } from '../data-set/utils';

export default class BatchRunner {
  tasks?: Map<Key, Function>;

  run: (tasks: Map<Key, Function>) => void;

  constructor(batchInterval = 100) {
    // why tasks is undefined?
    this.run = debounce(action((tasks: Map<Key, Function> | undefined = this.tasks) => {
      if (tasks) {
        tasks.forEach(task => task());
        tasks.clear();
      }
    }), batchInterval);
  }

  addTask(key: Key, callback: Function) {
    this.run(getIf<this, Map<Key, Function>>(this, 'tasks', () => new Map()).set(key, callback));
  }
}

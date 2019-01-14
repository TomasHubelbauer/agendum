import getItems from './getItems.js';

export default function* getQueuedItems() {
  for (let item of getItems()) {
    if (item.archivedDate === undefined && item.notBeforeDate === undefined || new Date(item.notBeforeDate) < new Date()) {
      yield item;
    }
  }
}

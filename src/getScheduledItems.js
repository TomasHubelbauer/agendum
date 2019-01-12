import getItems from './getItems.js';

export default function* getScheduledItems() {
  for (let item of getItems()) {
    // TODO: Validate `notBeforeDate`
    if (item.archivedDate === undefined && item.notBeforeDate !== undefined) {
      yield item;
    }
  }
}

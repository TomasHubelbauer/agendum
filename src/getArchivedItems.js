import getItems from './getItems.js';

export default function* getArchivedItems() {
  for (let item of getItems()) {
    if (item.archivedDate !== undefined) {
      yield item;
    }
  }
}

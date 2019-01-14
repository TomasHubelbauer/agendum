import getIds from './getIds.js';

export default function* getItems() {
  for (let id of getIds()) {
    const item = JSON.parse(localStorage.getItem(id.toString()));
    item.id = id;
    item.createdDate && item.createdDate = new Date(item.createdDate);
    item.archivedDate && item.archivedDate = new Date(item.archivedDate);
    item.notBeforeDate && item.notBeforeDate = new Date(item.notBeforeDate);
    item.notAfterDate && item.notAfterDate = new Date(item.notAfterDate);
    yield item;
  }
}

import getIds from './getIds.js';

export default function* getItems() {
  for (let id of getIds()) {
    const item = JSON.parse(localStorage.getItem(id.toString()));
    item.id = id;
    yield item;
  }
}

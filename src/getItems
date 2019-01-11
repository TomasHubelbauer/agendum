export default function* getItems(ids) {
  for (let id of ids) {
    const item = JSON.parse(localStorage.getItem(id.toString()));
    item.id = id;
    yield item;
  }
}

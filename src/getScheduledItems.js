export default function* getScheduledItems() {
  for (let item of getItems(iterate())) {
    // TODO: Validate `notBeforeDate`
    if (item.archivedDate === undefined && item.notBeforeDate !== undefined) {
      yield item;
    }
  }
}

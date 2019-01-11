export default function* getScheduledItems(items) {
  for (let item of items) {
    // TODO: Validate `notBeforeDate`
    if (item.archivedDate === undefined && item.notBeforeDate !== undefined) {
      yield item;
    }
  }
}

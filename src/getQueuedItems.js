export default function getQueuedItems*(items) {
  for (let item of items) {
    if (item.archivedDate === undefined && item.notBeforeDate === undefined) {
      yield item;
    }
  }
}

export default function getArchivedItems*(items) {
  for (let item of items) {
    if (item.archivedDate !== undefined) {
      yield item;
    }
  }
}

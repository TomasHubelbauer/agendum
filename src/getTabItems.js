import getQueuedItems from './getQueuedItems.js';
import getScheduledItems from './getScheduledItems.js';
import getArchivedItems from './getArchivedItems.js';

export default function getTabItems(tab) {
  switch (tab) {
    case 'queued': return getQueuedItems(); break;
    case 'scheduled': return getScheduledItems(); break;
    case 'archived': return getArchivedItems(); break;
    default: throw new Error(`Invalid tab '${tab}'.`);
  }
}

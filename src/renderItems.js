import reconcile, { button, details, summary, span, div, a } from '';
import getQueuedItems from './getQueuedItems.js';
import getScheduledItems from './getScheduledItems.js';
import getArchivedItems from './getArchivedItems.js';

export default function renderItems(itemsDiv, tab, onShowQueuedButtonClick, onShowScheduledButtonClick, onShowArchivedButtonClick, onRenameButtonClick, onArchiveButtonClick, onDeleteButtonClick, onMoveUpButtonClick, onMoveDownButtonClick) {
  let items;
  switch (tab) {
    case 'queued': return getQueuedItems(); break;
    case 'scheduled': return getScheduledItems(); break;
    case 'archived': return getArchivedItems(); break;
    default: throw new Error(`Invalid tab '${tab}'.`);
  }

  reconcile(
    itemsDiv,
    button({ onclick: onShowQueuedButtonClick, disabled: tab === 'queued' ? 'disabled' : undefined }, 'Queued'),
    button({ onclick: onShowScheduledButtonClick, disabled: tab === 'scheduled' ? 'disabled' : undefined }, 'Scheduled'),
    button({ onclick: onShowArchivedButtonClick, disabled: tab === 'archived' ? 'disabled' : undefined }, 'Archived'),
    ...[...getTabItems()].map((item, index, { length }) => {
      const { title, description, createdDate, archivedDate, notBeforeDate } = item;
      return details(
        { class: index % 2 === 0 ? 'even' : 'odd' },
        summary(
          span({ class: 'itemSpan' }, title),
          button({ ['data-id']: item.id, onclick: onRenameButtonClick, title: `Rename '${title}'` }, 'Rename'),
          tab === 'queued' && button({ ['data-id']: item.id, onclick: onArchiveButtonClick, title: `Archive '${title}'` }, 'Archive'),
          tab === 'archived' && button({ ['data-id']: item.id, onclick: onDeleteButtonClick, title: `Delete '${title}'` }, 'Delete'),
          button({ ['data-id']: item.id, onclick: onMoveUpButtonClick, disabled: index === 0 ? 'disabled' : undefined, title: `Move '${title}' up` }, '▲'),
          button({ ['data-id']: item.id, onclick: onMoveDownButtonClick, disabled: index === length - 1 ? 'disabled' : undefined, title: `Move '${title}' down` }, '▼'),
        ),
        ...(description || []).map(line => {
          // Recognize lines that are a link as a whole
          if ((line.startsWith('http://') || line.startsWith('https://')) && line.endsWith('/')) {
            return div(a({ href: line, target: '_blank' }, line));
          }

          // TODO: Interpret as raw HTML to correctly render data URI image tags
          return div(line);
        }),
        div(`ID: ${item.id}`),
        createdDate && div('Created: ' + new Date(createdDate).toLocaleString()),
        archivedDate && div('Archived: ' + new Date(archivedDate).toLocaleString()),
      );
    })
  );
}

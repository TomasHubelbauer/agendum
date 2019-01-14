import reconcile, { button, details, summary, span, div, a } from 'https://cdn.jsdelivr.net/npm/fragmentui/lib.js';
import getTabItems from './getTabItems.js';

export default function renderItems(tab, onShowQueuedButtonClick, onShowScheduledButtonClick, onShowArchivedButtonClick, onRenameButtonClick, onArchiveButtonClick, onReviveButtonClick, onDeleteButtonClick, onMoveUpButtonClick, onMoveDownButtonClick) {
  /** @type{HTMLDivElement|null} */
  const itemsDiv = document.querySelector('#itemsDiv');
  if (itemsDiv == null) {
    throw new Error('Items <div> not found');
  }
  
  // TODO: Get rid of this hack once Fragments has support for keys and can properly reconcile sets
  itemsDiv.innerHTML = '';
  
  reconcile(
    itemsDiv,
    button({ onclick: onShowQueuedButtonClick, disabled: tab === 'queued' ? 'disabled' : undefined }, 'Queued'),
    button({ onclick: onShowScheduledButtonClick, disabled: tab === 'scheduled' ? 'disabled' : undefined }, 'Scheduled'),
    button({ onclick: onShowArchivedButtonClick, disabled: tab === 'archived' ? 'disabled' : undefined }, 'Archived'),
    tab === 'archived' && renderGroup('TODO: Group archived items by date', []),
    ...tab === 'archived'
      ? getGroupedItems(tab).map(group => renderGroup('TODO: Grouping…', group))
      : [],
    ...tab !== 'archived'
      ? [...getUngroupedItems(tab)].map((item, index, { length }) => {
          return renderItem(item, index, length, tab, onRenameButtonClick, onArchiveButtonClick, onReviveButtonClick, onDeleteButtonClick, onMoveUpButtonClick, onMoveDownButtonClick);
        })
      : [],
  );
}

function getUngroupedItems(tab) {
  return getTabItems(tab);
}

// TODO: Finalize this
function getGroupedItems(tab) {
  return [getTabItems(tab)];
}

function renderItem(item, index, length, tab, onRenameButtonClick, onArchiveButtonClick, onReviveButtonClick, onDeleteButtonClick, onMoveUpButtonClick, onMoveDownButtonClick) {
  const { title, description, createdDate, archivedDate, resolution, notBeforeDate, notAfterDate } = item;
  return details(
    { class: index % 2 === 0 ? 'even' : 'odd' },
    summary(
      span({ class: 'itemSpan' }, title),
      button({ ['data-id']: item.id, onclick: onRenameButtonClick, title: `Rename '${title}'` }, 'Rename'),
      tab === 'queued' && button({ ['data-id']: item.id, onclick: onArchiveButtonClick, title: `Archive '${title}'` }, 'Archive'),
      tab === 'archived' && button({ ['data-id']: item.id, onclick: onReviveButtonClick, title: `Revive '${title}'` }, 'Revive'),
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
    createdDate && div('Created: ' + createdDate.toLocaleString()),
    archivedDate && div('Archived: ' + archivedDate.toLocaleString()),
    resolution && div('Resolution: ' + resolution),
    notBeforeDate && div('Not before: ' + notBeforeDate.toLocaleString()),
    notAfterDate && div('Not after: ' + notAfterDate.toLocaleString()),
  );
}

function renderGroup(title, items) {
  return details(
    summary(title),
    ...items,
  );
}

import reconcile, { div, button, span } from 'https://cdn.jsdelivr.net/npm/fragmentui/lib.js';

export default function renderDrafts(onRecallDraftButtonClick, onDismissDraftButtonClick) {
  /** @type{HTMLDivElement|null} */
  const draftsDiv = document.querySelector('#draftsDiv');
  if (draftsDiv == null) {
    throw new Error('Drafts <div> not found');
  }
  
  // TODO: Get rid of this hack once Fragments has support for keys and can properly reconcile sets
  draftsDiv.innerHTML = '';

  const value = localStorage.getItem('drafts');

  // Bail early if no drafts have been saved
  if (value === null) {
    return;
  }

  const drafts = JSON.parse(value);

  reconcile(
    draftsDiv,
    ...drafts.map((draft, index) => {
      return div(
        button({ ['data-index']: index, onclick: onRecallDraftButtonClick }, 'Recall'),
        button({ ['data-index']: index, onclick: onDismissDraftButtonClick }, 'Dismiss'),
        span(draft.title),
      );
    })
  );
}

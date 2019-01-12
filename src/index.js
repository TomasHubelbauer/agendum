import reconcile, { p } from 'https://cdn.jsdelivr.net/npm/fragmentui/lib.js';
import getItems from './getItems.js';
import getQueuedItems from './getQueuedItems.js';
import getScheduledItems from './getScheduledItems.js';
import getArchivedItems from './getArchivedItems.js';
import renderEditor from './renderEditor.js';
import renderHint from './renderHint.js';

window.addEventListener('load', async _ => {
  try {
    await navigator.serviceWorker.register('worker.js');
  } catch (error) {
    // TODO: Handle this at some point
  }

  /** @type{HTMLDivElement|null} */
  const editorDiv = document.querySelector('#editorDiv');
  if (editorDiv == null) {
    throw new Error('Editor <div> not found');
  }
  
  /** @type{HTMLDivElement|null} */
  const hintDiv = document.querySelector('#hintDiv');
  if (hintDiv == null) {
    throw new Error('Hint <div> not found');
  }
  
  /** @type{HTMLDivElement|null} */
  const draftsDiv = document.querySelector('#draftsDiv');
  if (draftsDiv == null) {
    throw new Error('Drafts <div> not found');
  }
  
  /** @type{HTMLDivElement|null} */
  const itemsDiv = document.querySelector('#itemsDiv');
  if (itemsDiv == null) {
    throw new Error('Items <div> not found');
  }
  
  /** @type{HTMLAnchorElement|null} */
  const exportA = document.querySelector('#exportA');
  if (exportA == null) {
    throw new Error('Export <a> not found');
  }
  
  /** @type{HTMLButtonElement|null} */
  const exportButton = document.querySelector('#exportButton');
  if (exportButton == null) {
    throw new Error('Export <button> not found');
  }
  
  /** @type{HTMLInputElement|null} */
  const importInput = document.querySelector('#importInput');
  if (importInput == null) {
    throw new Error('Import <input> not found');
  }
  
  /** @type{HTMLButtonElement|null} */
  const importButton = document.querySelector('#importButton');
  if (importButton == null) {
    throw new Error('Import <button> not found');
  }
  
  /** @type{HTMLButtonElement|null} */
  const clearButton = document.querySelector('#clearButton');
  if (clearButton == null) {
    throw new Error('Clear <button> not found');
  }
  
  /** @type{HTMLButtonElement|null} */
  const bustButton = document.querySelector('#bustButton');
  if (bustButton == null) {
    throw new Error('Bust <button> not found');
  }

  let useRichEditor = false;
  /** @type {HTMLTextAreaElement|HTMLInputElement|undefined} */
  let editorInputOrTextArea;
  let draft = '';
  let tab = 'queued';
  
  function onRecallDraftButtonClick(event) {  
    const index = event.currentTarget.dataset['index'];
    const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
    if (editorInputOrTextArea.value && !confirm('You have stuff in the editor, do you want to replace it with the draft?')) {
      return;
    }
    
    editorInputOrTextArea.value = drafts[index].title;
    editorInputOrTextArea.focus();
    drafts.splice(index, 1);
    localStorage.setItem('drafts', JSON.stringify(drafts));
    renderDrafts();
  }
  
  function onDismissDraftButtonClick(event) {
    const index = event.currentTarget.dataset['index'];
    const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
    drafts.splice(index, 1);
    localStorage.setItem('drafts', JSON.stringify(drafts));
    renderDrafts();
  }

  function onAttachButtonClick() {
    /** @type{HTMLInputElement|null} */
    const attachmentInput = document.querySelector('#attachmentInput');
    if (attachmentInput === null) {
      throw new Error('Failed to find the attachment input.');
    }
    
    attachmentInput.click();
  }

  function onSubmitButtonClick() {
    submit();
  }
  
  document.addEventListener('visibilitychange', _ => {
    if (document.hidden) {
      const value = editorInputOrTextArea.value;
      if (!value) {
        return;
      }
      
      const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
      drafts.push({ title: value });
      localStorage.setItem('drafts', JSON.stringify(drafts));
      renderDrafts();
      editorInputOrTextArea.value = '';
    } else {
      editorInputOrTextArea.focus();
    }
  });
  
  function onEditorInputMount(currentTarget) {
    editorInputOrTextArea = currentTarget;
  }
  
  function onEditorInputInput(event) {
    draft = event.currentTarget.value;
  }
  
  function onEditorTextAreaMount(currentTarget) {
    editorInputOrTextArea = currentTarget;
  }

  function onEditorTextAreaInput(event) {
    draft = event.currentTarget.value;
  }

  function onEditorInputKeypress(event) {
    if (event.key === 'Enter' /* Firefox */ || event.key === '\n' /* Chrome */) {
      if (event.ctrlKey || event.metaKey) {
        useRichEditor = true;
        // TODO: Preserve the cursor position as well

        const value = event.currentTarget.value;
        renderEditorAndHint();
        
        if (value) {
          editorInputOrTextArea.value = value + '\n';
        }

        editorInputOrTextArea.focus();
      } else {
        submit();
      }
    }
  }

  function onEditorTextAreaKeypress(event) {
    if (event.key === 'Enter' /* Firefox */ || event.key === '\n' /* Chrome */) {
      if (event.ctrlKey || event.metaKey) {
        submit();
        useRichEditor = false;
        renderEditorAndHint();
      }
    }
  }

  function onEditorInputPaste(event) {
    if (event.clipboardData.files.length > 0) {
      attach(event.clipboardData.files);
    }
  }
  
  function onEditorTextAreaPaste(event) {
    if (event.clipboardData.files.length > 0) {
      attach(event.clipboardData.files);
    }
  }

  function onAttachmentInputChange(event) {
    if (event.clipboardData.files.length > 0) {
      attach(event.clipboardData.files);
    } else if (event.clipboardData.items.length === 1 && event.clipboardData.items[0].type === 'text/plain') {
      useRichEditor = true;
      // TODO: Preserve text and cursor position
      renderEditorAndHint();
      document.querySelector('#editorTextArea').value = event.clipboardData.getData('text/plain');
    }
  }

  exportButton.addEventListener('click', _ => {
    const data = {};
    data.timestamp = Date.now();
    for (const id of iterate()) {
      data[id] = localStorage.getItem(id.toString());
    }

    exportA.download = `Agendum-${new Date().toISOString()}.json`;
    exportA.href = `data:application/json,` + JSON.stringify(data, null, 2);
    exportA.click();
  });

  importInput.addEventListener('change', event => {
    if (event.currentTarget.files.length === 0) {
      return;
    }

    const fileReader = new FileReader();

    fileReader.addEventListener('load', event => {
      const result = JSON.parse(event.currentTarget.result);
      if (result === null) {
        throw new Error('Malformated import file');
      }
      
      const { timestamp, ...data } = result;
      const ids = Object.keys(data).map(Number).filter(Number.isSafeInteger);
      // TODO: Detect conflicts, if equal, skip, if different, offer UI for resolution (keep old, keep new, keep both)
      for (const id of ids) {
        // TODO: Finalize import of JSON exports
        const value = data[id.toString()];
        if (typeof value === 'string') {
          throw new Error('Old type string import file');
        }
        
        localStorage.setItem(id.toString(), JSON.stringify(value));
      }

      renderItems();
    });

    fileReader.addEventListener('error', event => {
      alert(event.currentTarget.error);
    });

    fileReader.readAsText(event.currentTarget.files[0]);
  });

  importButton.addEventListener('click', _ => {
    if (importInput === null) {
      throw new Error('No import input');
    }
    
    importInput.click();
  });

  clearButton.addEventListener('click', _ => {
    if (confirm('This will remove all your to-do items. Really continue?')) {
      for (const id of iterate()) {
        localStorage.removeItem(id.toString());
      }

      renderItems();
    }
  });

  bustButton.addEventListener('click', async _ => {
    navigator.serviceWorker.controller.postMessage('bust');
  });

  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data === 'reload') {
      location.reload();
    }
  });

  function onRenameButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
    if (id === null) {
      throw new Error('ID was not passed');
    }
    
    const item = JSON.parse(localStorage.getItem(id));
    const title = prompt('', item.title);
    if (title === null) {
      return;
    }

    item.title = title;
    localStorage.setItem(id, JSON.stringify(item));
    renderItems();

    // Do not toggle the `details` element
    event.preventDefault();
  }

  function onArchiveButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
    if (id === null) {
      throw new Error('ID was not passed');
    }
    
    const item = JSON.parse(localStorage.getItem(id));
    item.archivedDate = Date.now();
    localStorage.setItem(id, JSON.stringify(item));
    renderItems();

    // Do not toggle the `details` element
    event.preventDefault();
  }
  
  function onDeleteButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
    if (id === null) {
      throw new Error('ID was not passed');
    }
    
    const item = JSON.parse(localStorage.getItem(id));
    if (!confirm(`Delete item '${item.title}'?`)) {
      return;
    }

    localStorage.removeItem(id);
    renderItems();

    // Do not toggle the `details` element
    event.preventDefault();
  }

  function onMoveUpButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
    if (id === null) {
      throw new Error('ID was not passed');
    }
    
    const ids = [...getTabItems()].map(i => i.id);
    const index = ids.indexOf(Number(id));
    const otherId = ids[index - 1].toString();
    const other = localStorage.getItem(otherId);
    localStorage.setItem(otherId, localStorage.getItem(id));
    localStorage.setItem(id, other);
    renderItems();

    // Do not toggle the `details` element
    event.preventDefault();
  }

  function onMoveDownButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
    if (id === null) {
      throw new Error('ID was not passed');
    }
    
    const ids = [...getTabItems()].map(i => i.id);
    const index = ids.indexOf(Number(id));
    const otherId = ids[index + 1].toString();
    const other = localStorage.getItem(otherId);
    localStorage.setItem(otherId, localStorage.getItem(id));
    localStorage.setItem(id, other);
    renderItems();

    // Do not toggle the `details` element
    event.preventDefault();
  }
  
  function onShowQueuedButtonClick() {
    tab = 'queued';
    renderItems();
  }
  
  function onShowScheduledButtonClick() {
    tab = 'scheduled';
    renderItems();
  }
  
  function onShowArchivedButtonClick() {
    tab = 'archived';
    renderItems();
  }

  function iterate() {
    return Object.keys(localStorage).map(Number).filter(Number.isSafeInteger).sort();
  }

  function submit() {
    const value = editorInputOrTextArea.value;
    editorInputOrTextArea.value = '';
    
    if (!value) {
      return;
    }
    
    const [title, ...description] = value.trim().split('\n');
    const ids = iterate();
    const id = ids.length === 0 ? 1 : Math.max(...ids) + 1;
    localStorage.setItem(id, JSON.stringify({ title, description, createdDate: Date.now() }));
    renderItems();
  }

  // TODO: Split into insertImage and attach, because we want to allow attaching images as well
  function attach(files) {
    if (!useRichEditor) {
      useRichEditor = true;
      // TODO: Preserve text etc., use onChange and keep the text in variable so we don't have to do this in two places
      renderEditorAndHint();
    }
    
    for (const file of files) {
      // Skip the images for now, we'll do attachments later
      if (!file.type.startsWith('image/')) {
        continue;
      }

      const fileReader = new FileReader();

      fileReader.addEventListener('load', event => {
        // TODO: Access using the ref
        editorInputOrTextArea.value += `\n<img src="${event.currentTarget.result}" />\n`;
      });

      fileReader.addEventListener('error', event => {
        alert(event.currentTarget.error);
      });

      fileReader.readAsDataURL(file);
    }
  }

  function renderEditorAndHint() {
    editorDiv.innerHTML = '';
    hintDiv.innerHTML = '';
    renderEditor(useRichEditor, draft, onEditorTextAreaMount, onEditorTextAreaInput, onEditorTextAreaKeypress, onEditorTextAreaPaste, onEditorInputMount, onEditorInputInput, onEditorInputKeypress, onEditorInputPaste, onAttachmentInputChange, onAttachButtonClick, onSubmitButtonClick);
    renderHint(useRichEditor);
  }
  
  function renderDrafts() {
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
    
  function getTabItems() {
    switch (tab) {
      case 'queued': return getQueuedItems(getItems(iterate())); break;
      case 'scheduled': return getScheduledItems(getItems(iterate())); break;
      case 'archived': return getArchivedItems(getItems(iterate())); break;
      default: throw new Error(`Invalid tab '${tab}'.`);
    }
  }

  function renderItems() {
    // TODO: Get rid of this hack once Fragments has support for keys and can properly reconcile sets
    itemsDiv.innerHTML = '';
    
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
  
  function render() {
    renderEditorAndHint();
    renderDrafts();
    renderItems();
  }
});

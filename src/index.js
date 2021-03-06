import renderEditor from './renderEditor.js';
import renderAdvancedEditor from './renderAdvancedEditor.js';
import renderHint from './renderHint.js';
import renderItems from './renderItems.js';
import renderDrafts from './renderDrafts.js';
import getTabItems from './getTabItems.js';
import getIds from './getIds.js';
import { createDraft, removeDraft, deleteDraft } from './data.js';

window.addEventListener('load', async _ => {
  try {
    await navigator.serviceWorker.register('worker.js');
  } catch (error) {
    // TODO: Handle this at some point
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
  let resolution = 'archive';
  let notBefore = null;
  let notAfter = null;
  let tab = 'queued';
  
  function onRecallDraftButtonClick(event) {  
    if (editorInputOrTextArea.value && !confirm('You have stuff in the editor, do you want to replace it with the draft?')) {
      return;
    }
    
    const index = Number(event.currentTarget.dataset['index']);
    const title = removeDraft(index);
    editorInputOrTextArea.value = title;
    editorInputOrTextArea.focus();
    renderDrafts(onRecallDraftButtonClick, onDismissDraftButtonClick);
  }
  
  function onDismissDraftButtonClick(event) {
    const index = Number(event.currentTarget.dataset['index']);
    deleteDraft(index);
    renderDrafts(onRecallDraftButtonClick, onDismissDraftButtonClick);
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
      
      createDraft(value);
      renderDrafts(onRecallDraftButtonClick, onDismissDraftButtonClick);
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
        if (draft) {
          draft += '\n';
        }
        
        renderEditorAndHint();
      } else {
        submit();
      }
      
      editorInputOrTextArea.focus();
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
      // TODO: Preserve cursor position
      draft = event.clipboardData.getData('text/plain');
      renderEditorAndHint();
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

      renderList();
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
      for (const id of getIds()) {
        localStorage.removeItem(id.toString());
      }

      renderList();
    }
  });

  bustButton.addEventListener('click', _ => {
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
    renderList();

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
    const resolution = prompt(`Archiving '${item.title}'.\n\nResolution:`);
    if (resolution === null) {
      return;
    }
    
    if (resolution !== '') {
      if (item.description === undefined) {
        item.description = [];
      }
      
      item.description.push(resolution);
    }
    
    localStorage.setItem(id, JSON.stringify(item));
    renderList();

    // Do not toggle the `details` element
    event.preventDefault();
  }
  
  function onReviveButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
    if (id === null) {
      throw new Error('ID was not passed');
    }
    
    const item = JSON.parse(localStorage.getItem(id));
    item.archivedDate = undefined;
    localStorage.setItem(id, JSON.stringify(item));
    renderList();

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
    renderList();

    // Do not toggle the `details` element
    event.preventDefault();
  }
  

  function onGraftButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
    if (id === null) {
      throw new Error('ID was not passed');
    }
    
    const item = JSON.parse(localStorage.getItem(id));
    item.archivedDate = Date.now();    
    if (resolution !== '') {
      if (item.description === undefined) {
        item.description = [];
      }
      
      item.description.push('Grafted');
    }
    
    localStorage.setItem(id, JSON.stringify(item));
    item.archivedDate = undefined;
    item.notBeforeDate = new Date();
    // Postpone the clone by one day into the future
    item.notBeforeDate.setDate(item.notBeforeDate.getDate() + 1);
    localStorage.setItem(getId().toString(), JSON.stringify(item));
    renderList();

    // Do not toggle the `details` element
    event.preventDefault();
  }

  function onMoveUpButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
    if (id === null) {
      throw new Error('ID was not passed');
    }
    
    const ids = [...getTabItems(tab)].map(i => i.id);
    const index = ids.indexOf(Number(id));
    const otherId = ids[index - 1].toString();
    const other = localStorage.getItem(otherId);
    localStorage.setItem(otherId, localStorage.getItem(id));
    localStorage.setItem(id, other);
    renderList();

    // Do not toggle the `details` element
    event.preventDefault();
  }

  function onMoveDownButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
    if (id === null) {
      throw new Error('ID was not passed');
    }
    
    const ids = [...getTabItems(tab)].map(i => i.id);
    const index = ids.indexOf(Number(id));
    const otherId = ids[index + 1].toString();
    const other = localStorage.getItem(otherId);
    localStorage.setItem(otherId, localStorage.getItem(id)); 
    localStorage.setItem(id, other);
    renderList();

    // Do not toggle the `details` element
    event.preventDefault();
  }
  
  function onShowQueuedButtonClick() {
    tab = 'queued';
    renderEditorAndHint();
    renderList();
  }
  
  function onShowScheduledButtonClick() {
    tab = 'scheduled';
    renderEditorAndHint();
    renderList();
  }
  
  function onShowArchivedButtonClick() {
    tab = 'archived';
    renderEditorAndHint();
    renderList();
  }
  
  function onResolutionSelectChange(event) {
    resolution = event.currentTarget.value;
  }
  
  function onNotBeforeInputChange(event) {
    notBefore = event.currentTarget.valueAsDate;
  }
  
  function onNotAfterInputChange(event) {
    notAfter = event.currentTarget.valueAsDate;
  }
  
  function getId() {
    const ids = getIds();
    return ids.length === 0 ? 1 : Math.max(...ids) + 1;
  }

  function submit() {
    if (!draft) {
      return;
    }
    
    const [title, ...description] = draft.trim().split('\n');
    const id = getId();
    const notBeforeDate = notBefore ? notBefore.valueOf() : undefined;
    const notAfterDate = notAfter ? notAfter.valueOf() : undefined;
    const item = { title, description, createdDate: Date.now(), resolution, notBeforeDate, notAfterDate };
    localStorage.setItem(id, JSON.stringify(item));
    renderList();
    draft = '';
    resolution = 'archive';
    notBefore = null;
    notAfter = null;
    renderEditorAndHint();
  }

  // TODO: Split into insertImage and attach, because we want to allow attaching images as well
  function attach(files) {
    if (!useRichEditor) {
      useRichEditor = true;
      // TODO: Preserve cursor
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
    renderEditor(useRichEditor, tab == 'archived', draft, onEditorTextAreaMount, onEditorTextAreaInput, onEditorTextAreaKeypress, onEditorTextAreaPaste, onEditorInputMount, onEditorInputInput, onEditorInputKeypress, onEditorInputPaste, onAttachmentInputChange, onAttachButtonClick, onSubmitButtonClick);
    renderAdvancedEditor(resolution, notBefore, notAfter, onResolutionSelectChange, onNotBeforeInputChange, onNotAfterInputChange);
    renderHint(useRichEditor);
  }
    
  function renderList() {
    renderItems(tab, onShowQueuedButtonClick, onShowScheduledButtonClick, onShowArchivedButtonClick, onRenameButtonClick, onArchiveButtonClick, onReviveButtonClick, onDeleteButtonClick, onGraftButtonClick, onMoveUpButtonClick, onMoveDownButtonClick);
  }
  
  function render() {
    renderEditorAndHint();
    renderDrafts(onRecallDraftButtonClick, onDismissDraftButtonClick);
    renderList();
  }
  
  render();
});

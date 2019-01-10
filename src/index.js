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
    
  function onRecallDraftButtonClick(event) {
    /** @type{HTMLTextAreaElement|HTMLInputElement|null} */
    let editorTextAreaOrInput = null;
    if (useRichEditor) {
      editorTextAreaOrInput = document.querySelector('#editorTextArea');
    } else {
      editorTextAreaOrInput = document.querySelector('#editorInput');
    }
    
    if (editorTextAreaOrInput === null) {
      throw new Error('Failed to find the editor component');
    }
    
    const index = event.currentTarget.dataset['index'];
    const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
    if (editorTextAreaOrInput.value && !confirm('You have stuff in the editor, do you want to replace it with the draft?')) {
      return;
    }
    
    editorTextAreaOrInput.value = drafts[index].title;
    editorTextAreaOrInput.focus();
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
    /** @type{HTMLTextAreaElement|HTMLInputElement|null} */
    let editorTextAreaOrInput = null;
    if (useRichEditor) {
      editorTextAreaOrInput = document.querySelector('#editorTextArea');
    } else {
      editorTextAreaOrInput = document.querySelector('#editorInput');
    }
    
    if (editorTextAreaOrInput === null) {
      throw new Error('Failed to query the editor textarea of input in the document.');
    }
    
    if (document.hidden) {
      const value = editorTextAreaOrInput.value;
      if (!value) {
        return;
      }
      
      const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
      drafts.push({ title: value });
      localStorage.setItem('drafts', JSON.stringify(drafts));
      renderDrafts();
      editorTextAreaOrInput.value = '';
    } else {
      editorTextAreaOrInput.focus();
    }
  });

  let useRichEditor = false;
  
  let tab = 'queued';

  function onEditorInputKeypress(event) {
    if (event.key === 'Enter' /* Firefox */ || event.key === '\n' /* Chrome */) {
      if (event.ctrlKey || event.metaKey) {
        useRichEditor = true;
        // TODO: Preserve the cursor position as well
        
        /** @type{HTMLInputElement|null} */
        const editorInput = document.querySelector('#editorInput');
        if (editorInput === null) {
          throw new Error('No editor input');
        }
        
        const value = editorInput.value;
        renderEditor();
        
        /** @type{HTMLInputElement|null} */
        const editorTextArea = document.querySelector('#editorTextArea');
        if (editorTextArea === null) {
          throw new Error('No editor text area');
        }
        
        if (value) {
          editorTextArea.value = value + '\n';
        }

        editorTextArea.focus();
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
        renderEditor();
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
      renderEditor();
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
    
    const ids = iterate();
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
    
    const ids = iterate();
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
    let value;
    if (useRichEditor) {
      const editorTextArea = document.querySelector('#editorTextArea');
      value = editorTextArea.value;
      editorTextArea.value = '';
    } else {
      const editorInput = document.querySelector('#editorInput');
      value = editorInput.value;
      editorInput.value = '';
    }

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
      renderEditor();
    }
    
    for (const file of files) {
      // Skip the images for now, we'll do attachments later
      if (!file.type.startsWith('image/')) {
        continue;
      }

      const fileReader = new FileReader();

      fileReader.addEventListener('load', event => {
        // TODO: Access using the ref
        document.querySelector('#editorTextArea').value += `\n<img src="${event.currentTarget.result}" />\n`;
      });

      fileReader.addEventListener('error', event => {
        alert(event.currentTarget.error);
      });

      fileReader.readAsDataURL(file);
    }
  }

  function renderEditor() {
    editorDiv.innerHTML = '';
    hintDiv.innerHTML = '';

    let meta;
    switch (navigator.platform) {
      case 'Win32': meta = 'Win'; hintDiv.innerHTML = 'Press <kbd>Win+.</kbd> for emoji keyboard.'; break;
      case 'MacIntel': meta = 'Cmd'; hintDiv.innerHTML = 'Press <kbd>Cmd+Ctrl+ </kbd> (space) for emoji keyboard.'; break;
    }

    if (useRichEditor) {
      const editorTextArea = document.createElement('textarea');
      editorTextArea.id = 'editorTextArea'; // For styling & `submit`
      editorTextArea.placeholder = 'Do this/that…';
      editorTextArea.addEventListener('keypress', onEditorTextAreaKeypress);
      editorTextArea.addEventListener('paste', onEditorTextAreaPaste);
      editorDiv.appendChild(editorTextArea);

      hintDiv.innerHTML += ` Press <kbd>Ctrl+Enter</kbd> to submit.`;
    } else {
      const editorInput = document.createElement('input');
      editorInput.id = 'editorInput'; // For styling & `submit`
      editorInput.placeholder = 'Do this/that…';
      editorInput.addEventListener('keypress', onEditorInputKeypress);
      editorInput.addEventListener('paste', onEditorInputPaste);
      editorDiv.appendChild(editorInput);

      hintDiv.innerHTML += ` Press <kbd>Ctrl+Enter</kbd> to use rich editor.`;
    }

    const attachmentInput = document.createElement('input');
    attachmentInput.id = 'attachmentInput'; // For calling `click` on it
    attachmentInput.type = 'file';
    attachmentInput.multiple = true;
    attachmentInput.addEventListener('change', onAttachmentInputChange);
    editorDiv.appendChild(attachmentInput);

    const attachButton = document.createElement('button');
    attachButton.id = 'attachButton';
    attachButton.textContent = 'Attach';
    attachButton.addEventListener('click', onAttachButtonClick);
    editorDiv.appendChild(attachButton);

    const submitButton = document.createElement('button');
    submitButton.id = 'submitButton';
    submitButton.textContent = 'Submit';
    submitButton.addEventListener('click', onSubmitButtonClick);
    editorDiv.appendChild(submitButton);
    
    const advancedDetails = document.createElement('details');
    editorDiv.appendChild(advancedDetails);
    
    const advancedSummary = document.createElement('summary');
    advancedSummary.textContent = 'Advanced';
    advancedDetails.appendChild(advancedSummary);
    
    const resolutionSelect = document.createElement('select');
    advancedDetails.appendChild(resolutionSelect);
    
    const archiveOption = document.createElement('option');
    archiveOption.textContent = 'Archive';
    resolutionSelect.appendChild(archiveOption);
    
    const deleteOption = document.createElement('option');
    deleteOption.textContent = 'Delete';
    resolutionSelect.appendChild(deleteOption);
    
    const graftOption = document.createElement('option');
    graftOption.textContent = 'Graft';
    resolutionSelect.appendChild(graftOption);
    
    const notBeforeInput = document.createElement('input');
    notBeforeInput.type = 'date';
    advancedDetails.appendChild(notBeforeInput);
    
    const notAfterInput = document.createElement('input');
    notAfterInput.type = 'date';
    advancedDetails.appendChild(notAfterInput);
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
  
  function* getItems() {
    for (let id of iterate()) {
      yield JSON.parse(localStorage.getItem(id.toString()));
    }
  }
  
  function* getQueuedItems() {
    for (let item of getItems()) {
      if (item.archivedDate === undefined && item.notBeforeDate === undefined) {
        yield { id, item };
      }
    }
  }
  
  function* getScheduledItems() {
    for (let item of getItems()) {
      // TODO: Validate `notBeforeDate`
      if (item.archivedDate === undefined && item.notBeforeDate !== undefined) {
        yield { id, item };
      }
    }
  }
  
  function* getArchivedItems() {
    for (let item of getItems()) {
      if (item.archivedDate !== undefined) {
        yield { id, item };
      }
    }
  }

  function renderItems() {
    // TODO: Get rid of this hack once Fragments has support for keys and can properly reconcile sets
    itemsDiv.innerHTML = '';
    
    let items = [];
    switch (tab) {
      case 'queued': items = getQueuedItems(); break;
      case 'scheduled': items = getScheduledItems(); break;
      case 'archived': items = getArchivedItems(); break;
      default: throw new Error(`Invalid tab '${tab}'.`);
    }

    reconcile(
      itemsDiv,
      button({ onclick: onShowQueuedButtonClick, disabled: tab === 'queued' ? 'disabled' : undefined }, 'Queued'),
      button({ onclick: onShowScheduledButtonClick, disabled: tab === 'scheduled' ? 'disabled' : undefined }, 'Scheduled'),
      button({ onclick: onShowArchivedButtonClick, disabled: tab === 'archived' ? 'disabled' : undefined }, 'Archived'),
      ...[...items].map(({ id, item }, index, { length }) => {
        const { title, description, createdDate, archivedDate, notBeforeDate } = item;
        return details(
          { class: index % 2 === 0 ? 'even' : 'odd' },
          summary(
            span({ class: 'itemSpan' }, title),
            button({ ['data-id']: id, onclick: onRenameButtonClick, title: `Rename '${title}'` }, 'Rename'),
            tab === 'queued' && button({ ['data-id']: id, onclick: onArchiveButtonClick, title: `Archive '${title}'` }, 'Archive'),
            tab === 'archived' && button({ ['data-id']: id, onclick: onDeleteButtonClick, title: `Delete '${title}'` }, 'Delete'),
            button({ ['data-id']: id, onclick: onMoveUpButtonClick, disabled: index === 0 ? 'disabled' : undefined, title: `Move '${title}' up` }, '▲'),
            button({ ['data-id']: id, onclick: onMoveDownButtonClick, disabled: index === length - 1 ? 'disabled' : undefined, title: `Move '${title}' down` }, '▼'),
          ),
          ...(description || []).map(line => {
            // Recognize lines that are a link as a whole
            if ((line.startsWith('http://') || line.startsWith('https://')) && line.endsWith('/')) {
              return div(a({ href: line, target: '_blank' }, line));
            }

            // TODO: Interpret as raw HTML to correctly render data URI image tags
            return div(line);
          }),
          div(`ID: ${id}`),
          createdDate && div('Created: ' + new Date(createdDate).toLocaleString()),
          archivedDate && div('Archived: ' + new Date(archivedDate).toLocaleString()),
        );
      })
    );
  }
  
  function render() {
    renderEditor();
    renderDrafts();
    renderItems();
  }
  
  // Try to load the local version of Fragment in my local development environment
  if (location.protocol === 'file:') {
    const localFragmentScript = document.createElement('script');
    localFragmentScript.src = '../fragment/lib.js';

    localFragmentScript.addEventListener('load', render);

    localFragmentScript.addEventListener('error', _ => {
      const remoteFragmentScript = document.createElement('script');
      remoteFragmentScript.src = 'https://cdn.jsdelivr.net/gh/TomasHubelbauer/fragment/lib.js';
      remoteFragmentScript.addEventListener('load', render);
      document.body.appendChild(remoteFragmentScript);
    });

    document.body.appendChild(localFragmentScript);
  } else {
    const fragmentScript = document.createElement('script');
    fragmentScript.src = 'https://cdn.jsdelivr.net/gh/TomasHubelbauer/fragment/lib.js';
    fragmentScript.addEventListener('load', render);
    document.body.appendChild(fragmentScript);
  }
});

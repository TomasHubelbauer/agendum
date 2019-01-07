window.addEventListener('load', async _ => {
  try {
    await navigator.serviceWorker.register('worker.js');
  } catch (error) {
    // TODO: Handle this at some point
  }

  const editorDiv = document.querySelector('#editorDiv');
  const hintDiv = document.querySelector('#hintDiv');
  const draftsDiv = document.querySelector('#draftsDiv');
  const itemsDiv = document.querySelector('#itemsDiv');
  const exportA = document.querySelector('#exportA');
  const exportButton = document.querySelector('#exportButton');
  const importInput = document.querySelector('#importInput');
  const importButton = document.querySelector('#importButton');
  const clearButton = document.querySelector('#clearButton');
  const bustButton = document.querySelector('#bustButton');
  
  // Migrate from string values to JSON values
  for (let id of iterate()) {
    const value = localStorage.getItem(id);
    if (value.startsWith('{') && value.endsWith('}')) {
      continue;
    }
    
    const [title, ...description] = value.split('\n');
    localStorage.setItem(id, JSON.stringify({ title, description }));
    console.log('Migrated', title);
  }
  
  function onRecallDraftButtonClick() {
    let editorTextAreaOrInput;
    if (useRichEditor) {
      editorTextAreaOrInput = document.querySelector('#editorTextArea');
    } else {
      editorTextAreaOrInput = document.querySelector('#editorInput');
    }
    
    const index = event.currentTarget.dataset['index'];
    const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
    if (editorTextAreaOrInput.value && !confirm('You have stuff in the editor, do you want to replace it with the draft?')) {
      return;
    }
    
    editorTextAreaOrInput.value = drafts[index].title;
    drafts.splice(index, 1);
    localStorage.setItem('drafts', JSON.stringify(drafts));
    renderDrafts();
  }
  
  function onDismissDraftButtonClick() {
    const index = event.currentTarget.dataset['index'];
    const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
    drafts.splice(index, 1);
    localStorage.setItem('drafts', JSON.stringify(drafts));
    renderDrafts();
  }

  function onAttachButtonClick() {
    document.querySelector('#attachmentInput').click();
  }

  function onSubmitButtonClick() {
    submit();
  }
  
  document.addEventListener('visibilitychange', event => {
    let editorTextAreaOrInput;
    if (useRichEditor) {
      editorTextAreaOrInput = document.querySelector('#editorTextArea');
    } else {
      editorTextAreaOrInput = document.querySelector('#editorInput');
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

  function onEditorInputKeypress(event) {
    if (event.key === 'Enter' /* Firefox */ || event.key === '\n' /* Chrome */) {
      if (event.ctrlKey || event.metaKey) {
        useRichEditor = true;
        // TODO: Preserve the cursor position as well
        const value = document.querySelector('#editorInput').value;
        renderEditor();
        const editorTextArea = document.querySelector('#editorTextArea');
        editorTextArea.value = value;
        if (value) {
          editorTextArea.value += '\n';
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

  function onEditorInputOrTextAreaPaste(event) {
    attach(event.clipboardData.files);
  }

  function onAttachmentInputChange(event) {
    attach(event.currentTarget.files);
  }

  exportButton.addEventListener('click', _ => {
    const data = {};
    data.timestamp = Date.now();
    for (const id of iterate()) {
      data[id] = localStorage.getItem(id);
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
      const { timestamp, ...data } = JSON.parse(event.currentTarget.result);
      const ids = Object.keys(data).map(Number).filter(Number.isSafeInteger);
      // TODO: Detect conflicts, if equal, skip, if different, offer UI for resolution (keep old, keep new, keep both)
      for (const id of ids) {
        // TODO: Finalize import of JSON exports
        const value = data[id.toString()];
        if (typeof value === 'string') {
          throw new Error('Old type string import file');
        }
        
        localStorage.setItem(id, JSON.stringify(value));
      }

      renderItems();
    });

    fileReader.addEventListener('error', event => {
      alert(event.currentTarget.error);
    });

    fileReader.readAsText(event.currentTarget.files[0]);
  });

  importButton.addEventListener('click', _ => {
    importInput.click();
  });

  clearButton.addEventListener('click', _ => {
    if (confirm('This will remove all your to-do items. Really continue?')) {
      for (const id of iterate()) {
        localStorage.removeItem(id);
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

  function onEditButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
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

  function onDeleteButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
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

    const ids = iterate();
    const id = ids.length === 0 ? 1 : Math.max(...ids) + 1;
    localStorage.setItem(id, JSON.stringify({ title: value.trim() }));
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
      editorTextArea.addEventListener('paste', onEditorInputOrTextAreaPaste);
      editorDiv.appendChild(editorTextArea);

      hintDiv.innerHTML += ` Press <kbd>Ctrl+Enter</kbd> to submit.`;
    } else {
      const editorInput = document.createElement('input');
      editorInput.id = 'editorInput'; // For styling & `submit`
      editorInput.placeholder = 'Do this/that…';
      editorInput.addEventListener('keypress', onEditorInputKeypress);
      editorInput.addEventListener('paste', onEditorInputOrTextAreaPaste);
      editorDiv.appendChild(editorInput);

      hintDiv.innerHTML += ` Press <kbd>Ctrl+Enter</kbd> to use rich editor.`;
    }

    const attachmentInput = document.createElement('input');
    attachmentInput.id = 'attachmentInput'; // For calling `click` on it
    attachmentInput.type = 'file';
    attachmentInput.multiple = true;
    attachmentInput.addEventListener('change', onAttachmentInputChange);
    editorDiv.appendChild(attachmentInput);

    const attachButton = document.querySelector('button');
    attachButton.addEventListener('click', onAttachButtonClick);
    editorDiv.appendChild(attachButton);

    const submitButton = document.querySelector('button');
    submitButton.addEventListener('click', onSubmitButtonClick);
    editorDiv.appendChild(submitButton);
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

  function renderItems() {
    // TODO: Get rid of this hack once Fragments has support for keys and can properly reconcile sets
    itemsDiv.innerHTML = '';

    reconcile(
      itemsDiv,
      ...iterate().map((id, index, { length }) => {
        const { title, description } = JSON.parse(localStorage.getItem(id));
        return details(
          summary(
            span({ class: 'itemSpan' }, title),
            button({ ['data-id']: id, onclick: onEditButtonClick }, '✎'),
            button({ ['data-id']: id, onclick: onDeleteButtonClick }, '🗑'),
            button({ ['data-id']: id, onclick: onMoveUpButtonClick, disabled: index === 0 ? 'disabled' : undefined }, '▲'),
            button({ ['data-id']: id, onclick: onMoveDownButtonClick, disabled: index === length - 1 ? 'disabled' : undefined }, '▼'),
          ),
          ...(description || []).map(line => {
            // Recognize lines that are a link as a whole
            if ((line.startsWith('http://') || line.startsWith('https://')) && line.endsWith('/')) {
              return p(a({ href: line, target: '_blank' }, line));
            }

            // TODO: Interpret as raw HTML to correctly render data URI image tags
            return p(line);
          }),
          p(`ID: ${id}`)
        );
      })
    );
  }
  
  function render() {
    renderEditor();
    renderDrafts();
    renderItems();
  }

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
});

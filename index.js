window.addEventListener('load', _ => {
  navigator.serviceWorker.register('worker.js');
  
  const editorTextArea = document.querySelector('#editorTextArea');
  const attachmentInput = document.querySelector('#attachmentInput');
  const attachButton = document.querySelector('#attachButton');
  const submitButton = document.querySelector('#submitButton');
  const itemsDiv = document.querySelector('#itemsDiv');
  const exportA = document.querySelector('#exportA');
  const exportButton = document.querySelector('#exportButton');
  const importInput = document.querySelector('#importInput');
  const importButton = document.querySelector('#importButton');
  const clearButton = document.querySelector('#clearButton');
  const bustButton = document.querySelector('#bustButton');
  
  attachButton.addEventListener('click', _ => {
    attachmentInput.click();
  });
  
  submitButton.addEventListener('click', _ => {
    submit();
  });
  
  editorTextArea.addEventListener('keypress', event => {
    if ((event.key === 'Enter' /* Firefox */ || event.key === '\n' /* Chrome */) && (event.ctrlKey || event.metaKey)) {
      submit();
    }
  });
  
  editorTextArea.addEventListener('paste', event => {
    attach(event.clipboardData.files);
  });
  
  attachmentInput.addEventListener('change', event => {
    attach(event.currentTarget.files);
  });
  
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
      for (const id of ids) {
        // TODO: Detect conflicts, if equal, skip, if different, offer UI for resolution (keep old, keep new, keep both)
        localStorage.setItem(id, data[id.toString()]);
      }

      render();
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
      
      render();
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
    const text = prompt('', localStorage.getItem(id));
    if (text === null) {
      return;
    }
    
    localStorage.setItem(id, text);
    render();

    // Do not toggle the `details` element
    event.preventDefault();
  }
  
  function onDeleteButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
    const [text] = localStorage.getItem(id).split('\n', 1);
    if (!confirm(`Delete item '${text}'?`)) {
      return;
    }
    
    localStorage.removeItem(id);
    render();

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
    render();

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
    render();

    // Do not toggle the `details` element
    event.preventDefault();
  }
  
  function iterate() {
    return Object.keys(localStorage).map(Number).filter(Number.isSafeInteger).sort();
  }
  
  function submit() {
    if (!editorTextArea.value) {
      return;
    }
    
    const ids = iterate();
    const id = ids.length === 0 ? 1 : Math.max(...ids) + 1;
    localStorage.setItem(id, editorTextArea.value.trim());
    editorTextArea.value = '';
    render();
  }
  
  function attach(files) {
    for (const file of files) {
      // Skip the images for now, we'll do attachments later
      if (!file.type.startsWith('image/')) {
        continue;
      }
      
      const fileReader = new FileReader();

      fileReader.addEventListener('load', event => {
        editorTextArea.value += `\n<img src="${event.currentTarget.result}" />\n`;
      });
      
      fileReader.addEventListener('error', event => {
        alert(event.currentTarget.error);
      });
      
      fileReader.readAsDataURL(file);
    }
  }
  
  function render() {
    reconcile(
      itemsDiv,
      ...iterate().map((id, index, { length }) => {
        const [title, ...description] = localStorage.getItem(id).split('\n');
        return details(
          summary(
            span({ class: 'itemSpan' }, title),
            button({ ['data-id']: id, onclick: onEditButtonClick }, '✎'),
            button({ ['data-id']: id, onclick: onDeleteButtonClick }, '🗑'),
            button({ ['data-id']: id, onclick: onMoveUpButtonClick, disabled: index === 0 ? 'disabled': undefined }, '▲'),
            button({ ['data-id']: id, onclick: onMoveDownButtonClick, disabled: index === length - 1 ? 'disabled' : undefined }, '▼'),
          ),
          ...description.map(line => {
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

  let hasFragment = false;
  
  const remoteFragmentScript = document.createElement('script');
  console.log('loading remote');
  remoteFragmentScript.src = 'https://cdn.jsdelivr.net/gh/TomasHubelbauer/fragment/lib.js';

  remoteFragmentScript.addEventListener('load', _ => {
    if (!hasFragment) {
      hasFragment = true;
      console.log('loaded remote');
      render();
    }
  });
  
  document.body.appendChild(remoteFragmentScript);

  const localFragmentScript = document.createElement('script');
  console.log('loading local');
  localFragmentScript.src = '../fragment/lib.js';

  localFragmentScript.addEventListener('load', _ => {
    if (!hasFragment) {
      hasFragment = true;
      console.log('loaded local');
      render();
    }
  });
  
  document.body.appendChild(localFragmentScript);
});

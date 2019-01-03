window.addEventListener('load', _ => {
  const logDetails = document.querySelector('#logDetails');
  const debugDiv = document.querySelector('#debugDiv');
  const editorInput = document.querySelector('#editorInput');
  const submitButton = document.querySelector('#submitButton');
  const itemsUl = document.querySelector('#itemsUl');
  
  // Display cache information as a stand-in for version
  fetch('index.js').then(response => {
    const age = response.headers.get('age');
    const now = new Date();
    const expires = Date(response.headers.get('expires'));
    const lastModified = Date(response.headers.get('last-modified'));
    const eTag = Date(response.headers.get('etag'));
    debugDiv.textContent = `
Age: ${age} seconds
Now: ${now}
Expires: ${expires}
LastModified: ${lastModified}
E-Tag: ${eTag}
`;
  });
  
  logDetails.open = localStorage.getItem('_') || false;

  logDetails.addEventListener('click', event => {
    localStorage.setItem('_', event.currentTarget.open);
  });
  
  submitButton.addEventListener('click', _ => {
    submit();
  });
  
  editorInput.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
      submit();
    }
  });
  
  function onDeleteButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
    localStorage.removeItem(id);
    render();
  }
  
  function submit() {
    if (!editorInput.value) {
      return;
    }
    
    const id = localStorage.length === 0 ? 1 : Math.max(...Object.keys(localStorage).map(Number).filter(n => n !== NaN)) + 1;
    localStorage.setItem(id, editorInput.value);
    editorInput.value = '';
    render();
  }
  
  function render() {
    itemsUl.innerHTML = '';
    Object.keys(localStorage).forEach(key => {
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '×';
      deleteButton.dataset['id'] = key;
      deleteButton.addEventListener('click', onDeleteButtonClick);
      
      const itemLi = document.createElement('li');
      itemLi.textContent = `${localStorage.getItem(key)} (${key})`;
      itemLi.appendChild(deleteButton);

      itemsUl.appendChild(itemLi);
    });
  }
  
  render();
});

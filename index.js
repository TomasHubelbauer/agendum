window.addEventListener('load', _ => {
  const debugDiv = document.querySelector('#debugDiv');
  const editorInput = document.querySelector('#editorInput');
  const submitButton = document.querySelector('#submitButton');
  const itemsUl = document.querySelector('#itemsUl');
  
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
  
  function iterate() {
    return Object.keys(localStorage).map(Number).filter(Number.isSafeInteger).sort();
  }
  
  function submit() {
    if (!editorInput.value) {
      return;
    }
    
    const ids = iterate();
    const id = ids.length === 0 ? 1 : Math.max(...ids) + 1;
    localStorage.setItem(id, editorInput.value);
    editorInput.value = '';
    render();
  }
  
  function render() {
    itemsUl.innerHTML = '';
    for (const key of iterate()) {
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '×';
      deleteButton.dataset['id'] = key;
      deleteButton.addEventListener('click', onDeleteButtonClick);
      
      const itemLi = document.createElement('li');
      itemLi.textContent = `${localStorage.getItem(key)} (${key})`;
      itemLi.appendChild(deleteButton);

      itemsUl.appendChild(itemLi);
    }
  }
  
  render();
});

window.addEventListener('load', _ => {
  const debugDiv = document.querySelector('#debugDiv');
  const editorInput = document.querySelector('#editorInput');
  const submitButton = document.querySelector('#submitButton');
  const itemsUl = document.querySelector('#itemsUl');
  
  // Indicate cache having been invalidated after changes have been made
  fetch('index.js').then(response => {
    const age = Number(response.headers.get('age'));
    if (age < 60) {
      debugDiv.textContent = 'Just deployed!';
    }
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
    
    const id = localStorage.length === 0 ? 1 : Math.max(...Object.keys(localStorage).map(Number)) + 1;
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

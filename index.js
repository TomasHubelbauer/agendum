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

  function onEditButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
    const text = prompt('', localStorage.getItem(id));
    if (text === null) {
      return;
    }
    
    localStorage.setItem(id, text);
    render();
  }
  
  function onDeleteButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
    localStorage.removeItem(id);
    render();
  }
  
  function onMoveUpButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
    alert('up');
    render();
  }
  
  function onMoveDownButtonClick(event) {
    const id = event.currentTarget.dataset['id'];
    alert('down');
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
    const ids = iterate();
    for (let index = 0; index < ids.length; index++) {
      const id = ids[index];

      const editButton = document.createElement('button');
      editButton.textContent = '✎';
      editButton.dataset['id'] = id;
      editButton.addEventListener('click', onEditButtonClick);
      
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '🗑';
      deleteButton.dataset['id'] = id;
      deleteButton.addEventListener('click', onDeleteButtonClick);
      
      const moveUpButton = document.createElement('button');
      moveUpButton.textContent = '▲';
      moveUpButton.dataset['id'] = id;
      moveUpButton.addEventListener('click', onMoveUpButtonClick);

      const moveDownButton = document.createElement('button');
      moveDownButton.textContent = '▼';
      moveDownButton.dataset['id'] = id;
      moveDownButton.addEventListener('click', onMoveDownButtonClick);
      
      const itemLi = document.createElement('li');
      itemLi.textContent = `${localStorage.getItem(id)} (${id})`;
      itemLi.appendChild(editButton);
      itemLi.appendChild(deleteButton);
      if (index > 0) itemLi.appendChild(moveUpButton);
      if (index < ids.length - 1) itemLi.appendChild(moveDownButton);

      itemsUl.appendChild(itemLi);
    }
  }
  
  render();
});

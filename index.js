window.addEventListener('load', _ => {
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
      const itemLi = document.createElement('li');
      itemLi.textContent = localStorage.getItem(key);
      itemsUl.appendChild(itemLi);
    });
  }
  
  render();
});

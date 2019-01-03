window.addEventListener('load', _ => {
  const editorInput = document.querySelector('#editorInput');
  const submitButton = document.querySelector('#submitButton');
  const itemsUl = document.querySelector('#itemsUl');

  submitButton.addEventListener('click', _ => {
    if (editorInput.value === '') {
      return;
    }
    
    // TODO: Calculate +1 instead of `length` so that keys are always-growing even after implementing deletion
    localStorage.setItem(localStorage.length, editorInput.value);
    render();
  });
  
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

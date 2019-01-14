export default function renderEditor(
  useRichEditor,
  draft,
  onEditorTextAreaMount,
  onEditorTextAreaInput,
  onEditorTextAreaKeypress,
  onEditorTextAreaPaste,
  onEditorInputMount,
  onEditorInputInput,
  onEditorInputKeypress,
  onEditorInputPaste,
  onAttachmentInputChange,
  onAttachButtonClick,
  onSubmitButtonClick,
  ) {
  /** @type{HTMLDivElement|null} */
  const editorDiv = document.querySelector('#editorDiv');
  if (editorDiv == null) {
    throw new Error('Editor <div> not found');
  }
  
  // TODO: Get rid of this hack once Fragments has support for keys and can properly reconcile sets
  editorDiv.innerHTML = '';
  if (useRichEditor) {
    const editorTextArea = document.createElement('textarea');
    editorTextArea.id = 'editorTextArea'; // For styling & `submit`
    editorTextArea.value = draft;
    editorTextArea.placeholder = 'Do this/that…';
    editorTextArea.addEventListener('input', onEditorTextAreaInput);
    editorTextArea.addEventListener('keypress', onEditorTextAreaKeypress);
    editorTextArea.addEventListener('paste', onEditorTextAreaPaste);
    editorDiv.appendChild(editorTextArea);
    onEditorTextAreaMount(editorTextArea);
  } else {
    const editorInput = document.createElement('input');
    editorInput.id = 'editorInput'; // For styling & `submit`
    editorInput.value = draft;
    editorInput.placeholder = 'Do this/that…';
    editorInput.addEventListener('input', onEditorInputInput);
    editorInput.addEventListener('keypress', onEditorInputKeypress);
    editorInput.addEventListener('paste', onEditorInputPaste);
    editorDiv.appendChild(editorInput);
    onEditorInputMount(editorInput);
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
}

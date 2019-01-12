export default function renderEditor(
  editorDiv,
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

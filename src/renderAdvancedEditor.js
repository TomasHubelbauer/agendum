export default function renderAdvancedEditor(resolution, notBefore, notAfter, onResolutionChange, onNotBeforeChange, onNotAfterChange) {
  /** @type{HTMLDivElement|null} */
  const advancedEditorDiv = document.querySelector('#advancedEditorDiv');
  if (advancedEditorDiv == null) {
    throw new Error('Advanced editor <div> not found');
  }
  
  // TODO: Get rid of this hack once Fragments has support for keys and can properly reconcile sets
  advancedEditorDiv.innerHTML = '';

  const advancedDetails = document.createElement('details');
  advancedEditorDiv.appendChild(advancedDetails);

  const advancedSummary = document.createElement('summary');
  advancedSummary.textContent = 'Advanced';
  advancedDetails.appendChild(advancedSummary);
  
  const resolutionLabel = document.createElement('label');
  resolutionLabel.textContent = 'Resolution:';
  advancedDetails.appendChild(resolutionLabel);

  const resolutionSelect = document.createElement('select');
  resolutionSelect.addEventListener('change', onResolutionChange);
  advancedDetails.appendChild(resolutionSelect);

  const archiveOption = document.createElement('option');
  archiveOption.textContent = 'Archive';
  archiveOption.value = 'archive';
  resolutionSelect.appendChild(archiveOption);

  const deleteOption = document.createElement('option');
  deleteOption.textContent = 'Delete';
  deleteOption.value = 'delete';
  resolutionSelect.appendChild(deleteOption);

  const graftOption = document.createElement('option');
  graftOption.textContent = 'Graft';
  graftOption.value = 'graft';
  resolutionSelect.appendChild(graftOption);
  
  // TODO: See if this can be done before the options are set and added
  resolutionSelect.value = resolution;
  
  const notBeforeLabel = document.createElement('label');
  notBeforeLabel.textContent = 'Not before:';
  advancedDetails.appendChild(notBeforeLabel);

  const notBeforeInput = document.createElement('input');
  notBeforeInput.type = 'date';
  notBeforeInput.addEventListener('change', onNotBeforeChange);
  notBeforeInput.valueAsDate = notBefore;
  advancedDetails.appendChild(notBeforeInput);
  
  const notAfterLabel = document.createElement('label');
  notAfterLabel.textContent = 'Not after:';
  notAfterLabel.valueAsDate = notAfter;
  advancedDetails.appendChild(notAfterLabel);

  const notAfterInput = document.createElement('input');
  notAfterInput.type = 'date';
  notAfterInput.addEventListener('change', onNotAfterChange);
  advancedDetails.appendChild(notAfterInput);
}

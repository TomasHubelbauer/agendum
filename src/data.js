export function createDraft(title) {
  const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
  drafts.push({ title });
  localStorage.setItem('drafts', JSON.stringify(drafts));
}

export function removeDraft(index) {
  const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
  const draft = drafts[index];
  drafts.splice(index, 1);
  localStorage.setItem('drafts', JSON.stringify(drafts));
  return draft.title;
}


export function deleteDraft(index) {
  const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
  drafts.splice(index, 1);
  localStorage.setItem('drafts', JSON.stringify(drafts));
}

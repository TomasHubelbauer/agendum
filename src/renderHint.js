export default function renderHint(useRichEditor) {
  // TODO: Get rid of this hack once Fragments has support for keys and can properly reconcile sets
  hintDiv.innerHTML = '';
  switch (navigator.platform) {
    case 'Win32': hintDiv.innerHTML = 'Press <kbd>Win+.</kbd> for emoji keyboard.'; break;
    case 'MacIntel': hintDiv.innerHTML = 'Press <kbd>Cmd+Ctrl+ </kbd> (space) for emoji keyboard.'; break;
  }
  
  if (useRichEditor) {
    hintDiv.innerHTML += ` Press <kbd>Ctrl+Enter</kbd> to submit.`;
  } else {
    hintDiv.innerHTML += ` Press <kbd>Ctrl+Enter</kbd> to use rich editor.`;
  }
}

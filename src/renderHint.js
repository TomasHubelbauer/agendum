export default function renderHint(useRichEditor) {
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

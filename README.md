# [Agendum](https://agendum.today)

> A to-do list

Agendum is a to-do list which uses local storage on the device it runs on to store its data. No backup.

## Running

Run `index.html`.

See [**online demo**](https://agendum.today) here.

## Contributing

### Roadmap

Addressing [TODO comments](https://github.com/TomasHubelbauer/agenda/search?q=todo) continuously…

- [ ] Improve the editor experience to help with speed:
  - Display the editor as an input with an option to switch to a textarea
  - In input editor, Enter submits and ctrl/cmd+Enter expands to textarea
  - In textarea editor, Enter creates a newline and ctrl/cmd+enter submits
  - Put this information into the input editor placeholder: *Do this/that… meta+Enter to expand* where meta is ctrl/cmd per platform
  - In textarea editor, display a small note underneath that meta+Enter can be used to submit it on desktop
  - In textarea editor, also display the emoji keyboard shortcut on the desktop
  - On mobile, where meta+Enter cannot be typed, a button for expanding the editor is shown and the placeholder doesn't say the shortcut
- [ ] Add a check for image size when attaching to warn about busting through the local storage size limit
- [ ] Implement attaching non-images with an option to download
- [ ] Implement recognizing links anywhere in the description plain text not only whole-line links
  - [ ] Display preview for image links
- [ ] Consider switching to IndexedDB, e.g.: [Storing images and files in IndexedDB](https://hacks.mozilla.org/2012/02/storing-images-and-files-in-indexeddb/)
- [ ] Create and add a favicon
- [ ] Convert to a PWA: [Progressive Web Apps on iOS are here](https://medium.com/@firt/progressive-web-apps-on-ios-are-here-d00430dee3a7)
- [ ] Validate PWA pinning to home screen works on iOS, with icons and standalone window
- [ ] Create iOS home screen icons: https://stackoverflow.com/a/26369790
- [ ] Fix service worker offline serving not working in Firefox
- [ ] Consider support for recurrent tasks
- [ ] Implement the distinction between archiving and deleting
- [ ] Consider a faux context menu using `select` on mobile instead of the item buttons
- [ ] Allow editing the text inline upon click without the `prompt`
- [ ] Detect conflicts during import (non-equal) and offer a UI for resolution (keep old, keep new, keep both)
- [ ] Consider adding support for import from pasted text for iOS Safari import
- [ ] Focus editor upon tab focus
- [ ] Collect drafts upon tab blur with restore/discard button for each and clear button for all
- [ ] Implement sharing a task or multiple by constructing a URL with pre-seeded database - warn on URL length limit

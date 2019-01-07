# [Agendum](https://agendum.today)

> A to-do list

Agendum is a to-do list which uses local storage on the device it runs on to store its data. No backup.

## Running

Run `index.html`.

See [**online demo**](https://agendum.today) here.

## Contributing

### Roadmap

Addressing [TODO comments](https://github.com/TomasHubelbauer/agenda/search?q=todo) continuously…

- [ ] Rewrite the editor in [Fragment](https://github.com/TomasHubelbauer/fragment) once it has support for refs etc.
- [ ] Display a button for toggling the rich editor when in portrait mode (can't do shortcuts)
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
- [ ] Set up a TypeScript type checking pipelines based on QR channel example
- [ ] See if adding Fragment as a Git submodule would allow us to drop the local/remote select logic and dep on JsDelivr
  - It comes down to seeing whether GitHub Pages would download Git submodules and would serve their contents
- [ ] Write Puppeteer UI tests and run them in the CI
- [ ] Allow dismissing the editor hints
- [ ] Fix deleting items not updating the item list due to Fragments lack of support for keys
- [ ] Do some sort of a version call and auto-bust the web worker cache if a new version is found

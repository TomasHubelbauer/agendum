# [Agendum](https://agendum.today)

> A to-do list

Agendum is a to-do list which uses local storage on the device it runs on to store its data. No backup.

## Running

Run `index.html`.

See [**online demo**](https://agendum.today) here.

## Contributing

### Roadmap

- Address [TODO comments](https://github.com/TomasHubelbauer/agenda/search?q=todo) continuously
- [ ] Add a check for image size when attaching to warn about busting through the local storage size limit
- [ ] Implement attaching non-images with an option to download
- [ ] Implement recognizing links anywhere in the description plain text not only whole-line links
  - [ ] Display preview for image links
- [ ] Consider switching to IndexedDB, e.g.: [Storing images and files in IndexedDB](https://hacks.mozilla.org/2012/02/storing-images-and-files-in-indexeddb/)
- [ ] Create and add a favicon
- [ ] Get a custom domain to have own local storage, not `github.io` one
- [ ] Convert to a PWA: [Progressive Web Apps on iOS are here](https://medium.com/@firt/progressive-web-apps-on-ios-are-here-d00430dee3a7)
- [ ] Validate PWA pinning to home screen works on iOS, with icons and standalone window
- [ ] Create iOS home screen icons: https://stackoverflow.com/a/26369790
- [ ] Add offline support
- [ ] Display item button flexed to the right on desktop, on their own line on mobile
- [ ] Implement import/export
- [ ] Consider support for recurrent tasks
- [ ] Implement the distinction between archiving and deleting
- [ ] Consider a faux context menu using `select` on mobile instead of the item buttons
- [ ] Allow editing the text inline upon click without the `prompt`

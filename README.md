# [Agendum](https://agendum.today)

> A to-do list

Agendum is a to-do list which uses local storage on the device it runs on to store its data. No backup.

## Running

Run `index.html`.

See [**online demo**](https://agendum.today) here.

## Testing

Puppeteer UI tests & TypeScript type check run in Azure Pipelines:

[
  ![](https://tomashubelbauer.visualstudio.com/agendum/_apis/build/status/agendum-CI?branchName=master)
](https://tomashubelbauer.visualstudio.com/agendum/_build/latest?definitionId=12?branchName=master)

The badge is red because I am currently working through resolving all the strict mode TypeScript errors and warnings.

## Contributing

### Roadmap

Addressing [TODO comments](https://github.com/TomasHubelbauer/agenda/search?q=todo) continuously…

#### Features

- [ ] Add support for syncing with custom BE instances - locally encrypted using the crypto API and sent
- [ ] Implement adding a forgotten task to the Archived tab, probably by adding a Add to Archived editor button when in archive
- [ ] Support attaching audio/video recordings as attachments / inline elements
- [ ] Check for attachment size and kick or resize (image, video?) attachments that are too big
- [ ] Implement drag & drop on the items
- [ ] Implement editing item contents - recall item in rich editor?
- [ ] Implement task hierarchy using `net-tree`
- [ ] Add support for item tags once net-tree is in
- [ ] Add support for reminders using desktop notifications for upcoming tasks
- [ ] Allow dismissing the editor hints for emoji keyboard and rich editor toggle separately
- [ ] Implement sharing a task or multiple by constructing a URL with pre-seeded database - warn on URL length limit
- [ ] Allow editing the text inline upon click without the `prompt`
- [ ] Consider support for recurrent tasks by "archival behavior": delete, archive, clone (with bump for the not-before date)
- [ ] Group the archived tab by archival date & reconsider ordering of items on it - drop or support?
- [ ] Implement attaching image or non-image files as attachments, not only inline
- [ ] Implement recognizing links anywhere in the description plain text not only whole-line links and storing them as link spans/blocks
  - [ ] Display preview for image links

#### In Progress

- [ ] Implement time comparison in Scheduled tab as well as the Not Before advanced field in the editor
- [ ] Hook up the advanced options controls underneath the editor

#### Improvements

- [ ] Implement [Net Tree](https://github.com/TomasHubelbauer/net-tree) for hierarchical items
- [ ] Pull in Fragment types using NPM for TypeScript and use it as a ES module after changing it so
- [ ] Style the advanced controls section so that it has its own line
- [ ] Render inline images and links from backing objects on the item not using `innerHTML`
- [ ] Do some sort of a version call and auto-bust the web worker cache if a new version is found
- [ ] Do item rendering properly once Fragment supports keys and get rid of the `innerHTML = ''` call
- [ ] See if adding Fragment as a Git submodule would allow us to drop the local/remote select logic and dep on JsDelivr
  - It comes down to seeing whether GitHub Pages would download Git submodules and would serve their contents
- [ ] Consider adding support for import from pasted text for iOS Safari import
- [ ] Detect conflicts during import (non-equal) and offer a UI for resolution (keep old, keep new, keep both)
- [ ] Hide item buttons on mobile except for Archive, Edit can be done by clicking, move by dragging when it is done
- [ ] Create iOS home screen icons: https://stackoverflow.com/a/26369790
- [ ] Validate PWA pinning to home screen works on iOS, with icons and standalone window
- [ ] Consider [Storing images and files in IndexedDB](https://hacks.mozilla.org/2012/02/storing-images-and-files-in-indexeddb/)
- [ ] Create and add a favicon
- [ ] Utilize [Progressive Web Apps on iOS are here](https://medium.com/@firt/progressive-web-apps-on-ios-are-here-d00430dee3a7)
- [ ] Display a button for toggling the rich editor when in portrait mode (can't do shortcuts)
- [ ] Rewrite the editor in [Fragment](https://github.com/TomasHubelbauer/fragment) once it supports keys
- [ ] Pass artifacts directory path to the test script and save screenshots to that and upload that directory not `screenshots`
- [ ] Figure out how to make jUnit produce a HTML report and how to attach Puppeteer screenshots to it
  - Maybe https://www.npmjs.com/package/jest-html-reporter
- [ ] Create UI tests for:
  - Expanding to rich editor - fix Ctrl+Enter not working in Puppeteer
  - Creating a newline in the rich editor
  - Attaching an image when not in rich editor yet by pasting
  - Attaching an image when already in the rich editor by pasting
  - Preserving text when switching from basic to rich editor
  - Warning about the loss of images when switching to the basic editor
  - Creating an item through the Enter press (as opposed to Submit button press) in both editors
  - Not being able to move an item
  - Rendering correct raw HTML in item contents
  - Exporting
  - Importing
  - Resolving import conflicts
  - Busting the web worker cache

#### Bugs

- [ ] Fix mobile task label with multiple lines overlapping into the content (by ditching `details` and keeping state in item)
- [ ] Fix service worker offline serving not working in Firefox & Safari - web worker says `fetch` timed out
- [ ] Fix TypeScript pipeline errors

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

- [ ] Use file system API when available (Chrome, Firefox, Edge) and local storage when not (Safari)
  - Ask on Stack Overflow where are the storage files stored on disk to provide backup instructions
- [ ] Add support for syncing with custom BE instances - locally encrypted using the crypto API and sent
- [ ] Support attaching audio/video recordings as attachments / inline elements
- [ ] Check for attachment size and kick or resize (image, video?) attachments that are too big
- [ ] Implement drag & drop on the items
- [ ] Implement editing item contents - modal with the editor
- [ ] Implement task hierarchy using `net-tree`
- [ ] Add support for item tags
- [ ] Add support for reminders using desktop notifications for upcoming tasks
- [ ] Allow dismissing the editor hints for emoji keyboard and rich editor toggle separately
- [ ] Allow editing the title using an inline input with Enter keypress handler and a Save button
- [ ] Implement the graft resolution behavior which creates the same task again on the next day (for now)
- [ ] Make sure moving works within the groups of the archive tab and jumps between the groups as well
- [ ] Implement attaching image or non-image files as attachments, not only inline
- [ ] Implement recognizing links anywhere in the description plain text not only whole-line links and storing them as link spans/blocks
  - [ ] Display preview for image links
- [ ] Allow sourcing tasks from other places than storage (e.g.: GitHub issues) but mark references as resolved etc. in the storage
- [ ] Implement moving the items with Not After into its own tab, something like Expired or Missed

#### In Progress

- [ ] Hook up the Archive button in the editor when in the Archived tab
- [ ] Pull out more data related functions to `data.js` and include `getIds` in it, too

#### Improvements

- [ ] Add checkboxen alongside the items for bulk operations (archive, delete)
- [ ] Remember the expanded archive tab group title and preserve expansion state after item button action (move etc.)
- [ ] Display item count on each tab button
- [ ] Handle resolution notes with a custom modal:
  - These is an input which adds a line to the description for just attaching a resolution (maybe keep in a different field than desc?)
  - There is a button which allows to recall the item for editing, but then archives it including the changes made
  - There is a button for just archiving as-is
  - If the modal is blurred / dismissed or the tab is switched away (blurred), then archive item and show edtior hint informing it saved
- [ ] Add tests for moving items within tabs when there are items in all tabs to make sure the filtering logic doesn't break
- [ ] Query the set of items per tab first and then render the set to make sure up/down disables and even/odd backgrounds work okay
- [ ] Implement [Net Tree](https://github.com/TomasHubelbauer/net-tree) for hierarchical items
- [ ] Pull in Fragment types using NPM for TypeScript and use it as a ES module after changing it so
- [ ] Render inline images and links from backing objects on the item not using `innerHTML`
- [ ] Do some sort of a version call and auto-bust the web worker cache if a new version is found
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
  - [ ] Get rid of the `innerHTML = ''` call
- [ ] Figure out how to make jUnit produce a HTML report and how to attach Puppeteer screenshots to it
  - Maybe https://www.npmjs.com/package/jest-html-reporter
- [ ] Create UI tests for:
  - Expanding to rich editor
    - [ ] [Fix Ctrl+Enter not working in Puppeteer](https://github.com/TomasHubelbauer/puppeteer-ctrl-enter)
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
  - Up on 1st item is disabled and so is down on last item
  - Reviving
  - Not Before

#### Bugs

- [ ] Fix mobile task label with multiple lines overlapping into the content (by ditching `details` and keeping state in item)
- [ ] Fix service worker offline serving not working in Firefox & Safari - web worker says `fetch` timed out
- [ ] Fix TypeScript pipeline errors
- [ ] Fix Puppeteer not dropping screenshots in CI

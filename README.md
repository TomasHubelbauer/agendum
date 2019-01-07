# [Agendum](https://agendum.today)

> A to-do list

Agendum is a to-do list which uses local storage on the device it runs on to store its data. No backup.

## Running

Run `index.html`.

See [**online demo**](https://agendum.today) here.

## Testing

Puppeteer UI tests run in Azure Pipelines:

[
  ![](https://tomashubelbauer.visualstudio.com/agendum/_apis/build/status/agendum-CI?branchName=master)
](https://tomashubelbauer.visualstudio.com/agendum/_build/latest?definitionId=12?branchName=master)

## Contributing

### Roadmap

Addressing [TODO comments](https://github.com/TomasHubelbauer/agenda/search?q=todo) continuously…

- [ ] Finalize the TypeScript type checking pipeline and fix TypeScript errors
- [ ] Create UI tests for:
  - Creating an item with the basic editor
  - Switching the basic editor into the rich editor
  - Creating a newline in the rich editor
  - Creating an item with the rich editor
  - Attaching an image when not in rich editor yet by pasting
  - Attaching an image when already in the rich editor by pasting
  - Preserving text when switching from basic to rich editor
  - Warning about the loss of images when switching to the basic editor
  - Creating an item through the submit button for both editor types
  - Creating a draft by switching from and back to the page
  - Ignoring a draft when the editor is empty
  - Recalling a draft
  - Dismissing a draft
  - Renaming an item
  - Archiving an item
  - Deleting an item
  - Moving item up
  - Moving item down
  - Not being able to move an item
  - Rendering correct raw HTML in item contents
  - Exporting
  - Importing
  - Resolving import conflicts
  - Clearing all items
  - Busting the web worker cache
- [ ] Figure out why the demo failing test doesn't fail the build (maybe need to call `process.exit`?)
- [ ] Generate an HTML report from the Puppeteer run and display it in the Tests tab in DevOps
  - [ ] Figure out how to keep displaying it when we have unit tests and Jest HTML report also being shown (join the two files?)
- [ ] Pass artifacts directory to the `test` script and upload that
- [ ] Look into [jUnit UI](https://www.eliostruyf.com/setting-up-puppeteer-to-run-on-azure-devops-for-your-automated-ui-tests/)
- [ ] Rewrite the editor in [Fragment](https://github.com/TomasHubelbauer/fragment) once it has support for refs etc.
- [ ] Display a button for toggling the rich editor when in portrait mode (can't do shortcuts)
- [ ] Add a check for image size when attaching to warn about busting through the local storage size limit
- [ ] Implement attaching non-images with an option to download
- [ ] Implement recognizing links anywhere in the description plain text not only whole-line links
  - [ ] Display preview for image links
- [ ] Consider [Storing images and files in IndexedDB](https://hacks.mozilla.org/2012/02/storing-images-and-files-in-indexeddb/)
- [ ] Create and add a favicon
- [ ] Utilize [Progressive Web Apps on iOS are here](https://medium.com/@firt/progressive-web-apps-on-ios-are-here-d00430dee3a7)
- [ ] Validate PWA pinning to home screen works on iOS, with icons and standalone window
- [ ] Create iOS home screen icons: https://stackoverflow.com/a/26369790
- [ ] Fix service worker offline serving not working in Firefox
- [ ] Consider support for recurrent tasks
- [ ] Implement the distinction between archiving and deleting
- [ ] Consider a faux context menu using `select` on mobile instead of the item buttons
- [ ] Allow editing the text inline upon click without the `prompt`
- [ ] Detect conflicts during import (non-equal) and offer a UI for resolution (keep old, keep new, keep both)
- [ ] Consider adding support for import from pasted text for iOS Safari import
- [ ] Implement sharing a task or multiple by constructing a URL with pre-seeded database - warn on URL length limit
- [ ] Set up a TypeScript type checking pipelines based on QR channel example
- [ ] See if adding Fragment as a Git submodule would allow us to drop the local/remote select logic and dep on JsDelivr
  - It comes down to seeing whether GitHub Pages would download Git submodules and would serve their contents
- [ ] Write Puppeteer UI tests and run them in the CI
- [ ] Allow dismissing the editor hints
- [ ] Fix deleting items not updating the item list due to Fragments lack of support for keys
- [ ] Do some sort of a version call and auto-bust the web worker cache if a new version is found
- [ ] Implement task hierarchy using net-tree
- [ ] Add support for tags once net-tree is in
- [ ] Add support for reminders using desktop notifications for upcoming tasks
- [ ] Render inline images and links from backing objects on the item not using `innerHTML`

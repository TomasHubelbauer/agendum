# Agenda

> A to-do list

Agenda is a to-do list which uses local storage on the device it runs on to store its data. No backup.

## Running

Run `index.html`.

See [**online demo**](https://tomashubelbauer.github.io/agenda/) here.

## Contributing

### Roadmap

- Address [TODO comments](https://github.com/TomasHubelbauer/agenda/search?q=todo) (continuously)
- [ ] Allow editing the item text
- [ ] Allow switching to a multi-line editor and split into title and description (for links etc.)
- [ ] Allow attaching images (maybe check for size for now to not bust local cache)
- [ ] Consider switching to IndexedDB for more appropriate storage for attachments or all data
- [ ] Create and add an icon
- [ ] Add application manifest for PWA
- [ ] Validate pinning to home screen works on iOS
- [ ] Fix the subsequent ID calculation in Safari (gives `NaN`)
- [ ] Get a custom domain to have own local storage, not `github.io` one

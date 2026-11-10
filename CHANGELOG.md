# Changelog

Every release lists the icons that were added, renamed, removed, redrawn or moved to another category since the release before.

## 5.3.0

Small status badges for files, folders, notes, users, calendars, servers and databases, chat bubbles with faces, image actions, form controls like combobox, stepper and textarea, git and network icons, boolean operations, more charts, meters and home heating. The calendars get a toned body in Duotone, locks in Bulk are solid now, and the crossed out image, the tent, the warehouse and a few Bulk fills are redrawn.

Search in the MCP server and the CLI now falls back to the closest matches when no icon matches every word and names the words it could not match. The new `list_icons` tool in the MCP server pages through one category.

React and Vue icons take `secondaryColor` and `secondaryOpacity` for the second path of Duocolor, Duotone and Bulk. Both take any CSS value, also variables, so the second path can follow a theme. Without the props the markup stays exactly the same.

1,550 icons with 14 aliases in 30 categories.

### New

`air-vent`, `api`, `atm`, `autoplay`, `bandwidth`, `bell-check`, `billboard`, `binoculars`, `boolean-exclude`, `boolean-intersect`, `boolean-subtract`, `boolean-union`, `border-inner`, `border-outer`, `brackets-dots`, `calendar-lock-corner`, `calendar-settings-corner`, `calendar-sync-corner`, `calendar-warning-corner`, `cassette`, `chapters`, `chart-bar-grouped`, `chart-burndown`, `chart-combo`, `chart-heatmap`, `chart-line-multi`, `chart-pie-circle`, `chart-sparkline`, `chart-value`, `chat-circle-angry`, `chat-circle-laugh`, `chat-circle-neutral`, `chat-circle-sad`, `chat-circle-smile`, `chat-circle-surprised`, `chat-circle-wink`, `circuit-board`, `clapperboard`, `clock-pause`, `coin-jar`, `combobox`, `corner-radius`, `credit-card-clock-corner`, `credit-card-return-corner`, `credit-card-sync-corner`, `crystal-ball`, `cursor-not-allowed`, `cursor-square`, `data-packet`, `database-lock-corner`, `database-share-corner`, `database-sync-corner`, `database-warning-corner`, `database-zap-corner`, `decimal-decrease`, `decimal-increase`, `drone`, `drop-shadow`, `earbuds`, `ethernet`, `file-clock-corner`, `file-pause-corner`, `file-percent`, `file-pin-corner`, `file-share-corner`, `file-shield`, `file-star-corner`, `file-sync-corner`, `file-warning-corner`, `firewall`, `flashlight-off`, `flashlight-on`, `folder-clock-corner`, `folder-help-corner`, `folder-pause-corner`, `folder-pin-corner`, `folder-share-corner`, `folder-star-corner`, `folder-sync-corner`, `folder-warning-corner`, `footprints`, `function-arrow-right`, `gem`, `gif`, `git-cherry-pick`, `git-merge-conflict`, `git-push`, `git-rebase`, `git-stash`, `globe-dots`, `globe-lock-corner`, `globe-search-corner`, `graphics-card`, `hand-heart`, `hdmi`, `head-heart`, `hearing`, `hearing-aid`, `hearing-off`, `heat-pump`, `house-percent`, `house-user`, `image-check`, `image-check-corner`, `image-close`, `image-close-corner`, `image-download`, `image-download-corner`, `image-edit`, `image-edit-corner`, `image-plus`, `image-plus-corner`, `image-search`, `image-search-corner`, `image-upload`, `image-upload-corner`, `image-warning`, `image-warning-corner`, `ip`, `key-sync-corner`, `kite`, `latency`, `letters-ab`, `list-star`, `logs`, `luggage-conveyor`, `magnet`, `mail-search`, `mail-search-corner`, `markdown`, `meter`, `meter-electricity`, `meter-gas`, `meter-water`, `microphone-text`, `mobile-foldable`, `mobile-vibrate`, `modal`, `network-off`, `network-ping`, `network-split`, `note-clock-corner`, `note-help-corner`, `note-lock-corner`, `note-pause-corner`, `note-pin-corner`, `note-settings-corner`, `note-share-corner`, `note-star-corner`, `note-sync-corner`, `note-warning-corner`, `package-return-corner`, `package-tracking-corner`, `page-margins`, `paper-plane-clock-corner`, `parachute`, `parallelogram`, `passkey`, `pipe-droplet`, `poll`, `popover`, `queue`, `radiator`, `rectangle-horizontal`, `rectangle-vertical`, `regex`, `scan-search`, `sd-card`, `search-chart`, `security-key`, `segmented-control`, `server-lock-corner`, `server-minus-corner`, `server-plus-corner`, `server-sync-corner`, `server-warning-corner`, `serverless`, `signal-none`, `skip-back-15`, `skip-forward-15`, `slider-1-sparkle`, `smart-meter`, `square-box`, `square-dashed-arrow-down`, `square-dashed-arrow-left`, `square-dashed-arrow-right`, `square-dashed-arrow-up`, `square-dashed-sparkle`, `squares-sparkle`, `step-into`, `step-over`, `stepper`, `subnet`, `table-transpose`, `tag-minus`, `tag-percent`, `tag-plus`, `text-direction-ltr`, `text-direction-rtl`, `text-edit`, `text-numbers`, `text-segments`, `text-truncate`, `textarea`, `thermostat`, `timer-check`, `touchpad`, `trapezoid`, `upscale-sparkle`, `usb-hub`, `user-clock-corner`, `user-help-corner`, `user-pause-corner`, `user-pin-corner`, `user-share-corner`, `user-sync-corner`, `user-warning-corner`, `vinyl`, `volume-text`, `vr-headset`, `wavy-user`, `websocket`, `window-lock-corner`, `window-settings-corner`, `window-sync-corner`, `window-warning-corner`

### Redrawn

- `archive-restore` in bulk
- `box-taped` in bulk
- `calendar` in duotone
- `calendar-check` in duotone
- `calendar-check-corner` in duotone
- `calendar-clock-corner` in duotone
- `calendar-close` in duotone
- `calendar-close-corner` in duotone
- `calendar-days` in duotone
- `calendar-edit` in duotone
- `calendar-edit-corner` in duotone
- `calendar-event` in duotone
- `calendar-minus` in duotone
- `calendar-minus-corner` in duotone
- `calendar-off` in duotone, bulk
- `calendar-plus` in duotone
- `calendar-plus-corner` in duotone
- `calendar-search` in duotone
- `calendar-search-corner` in duotone
- `calendar-sparkle-corner` in duotone
- `calendar-text` in duotone
- `calendar-week` in duotone
- `chart-bar-stacked` in duotone, fill, bulk
- `chart-pie` in duotone, bulk
- `external-link` in duotone, bulk
- `file-archive` in bulk
- `file-edit` in bulk
- `file-lock-corner` in bulk
- `folder-edit` in bulk
- `folder-lock-corner` in bulk
- `image-off` in line, duocolor, duotone, fill, bulk
- `shield-lock` in bulk
- `tent` in fill, bulk
- `user-lock-corner` in bulk
- `warehouse` in fill, bulk

## 5.2.0

1,324 icons with 12 aliases in 30 categories.

### New

`archive-restore`, `blocks`, `box`, `box-export`, `box-import`, `box-off`, `box-taped`, `calendar-clock-corner`, `chat-circle-heart`, `chat-circle-help`, `chat-circle-off`, `chat-circle-quote`, `chat-circle-share`, `chat-circle-text`, `chat-circle-warning`, `chat-quote`, `chat-share`, `chat-warning`, `database-backup-corner`, `database-restore-corner`, `export`, `face-smile-minus-corner`, `face-smile-plus-corner`, `file-archive`, `file-help`, `file-help-corner`, `file-spreadsheet`, `file-type`, `import`, `life-buoy`, `list-restart`, `mail-check`, `mail-check-corner`, `mail-close`, `mail-close-corner`, `mail-help`, `mail-minus`, `mail-minus-corner`, `mail-off`, `mail-plus`, `mail-plus-corner`, `mail-warning`, `mails`, `monitor-download`, `monitor-upload`, `music-note-double`, `music-notes-double`, `newspaper`, `packages`, `party-popper`, `plug-off`, `plug-zap`, `scan-barcode`, `scan-eye`, `scan-text`, `scroll`, `scroll-text`, `search-check`, `search-close`, `server-check-corner`, `server-close-corner`, `server-settings-corner`, `spinner`, `spinner-rays`, `timer-off`, `variable`

### Redrawn

- `alarm-off` in line, duocolor, duotone
- `bell-off` in line, duocolor, duotone
- `bookmark-off` in line, duocolor, duotone
- `calendar-off` in line, duocolor, duotone, fill, bulk
- `camera-off` in line, duocolor, duotone, fill, bulk
- `chat-off` in line, duocolor, duotone
- `cloud-moon` in line, duocolor, duotone, fill, bulk
- `cloud-off` in line, duocolor, duotone
- `eye-off` in line, duocolor, duotone, fill, bulk
- `filter-off` in line, duocolor, duotone
- `gift` in line, duocolor, duotone, fill, bulk
- `globe-off` in line, duocolor, duotone, fill, bulk
- `hand` in fill, bulk
- `hand-grab` in line, duocolor, duotone, fill, bulk
- `hand-pointer` in fill, bulk
- `heart-off` in line, duocolor, duotone
- `image-off` in line, duocolor, duotone
- `leaf` in line, duocolor, duotone, fill, bulk
- `link-horizontal-off` in line, duocolor, duotone, fill, bulk
- `mail` in fill, bulk
- `mail-dot` in fill, bulk
- `mail-sparkle` in fill, bulk
- `map-pin-off` in line, duocolor, duotone
- `microphone-off` in line, duocolor, duotone, fill, bulk
- `monitor-off` in line, duocolor, duotone
- `monitor-play` in line, duocolor, duotone, fill, bulk
- `moon` in line, duocolor, duotone, fill, bulk
- `moon-star` in line, duocolor, duotone, fill, bulk
- `music-note-off` in duotone
- `phone-off` in line, duocolor, duotone, fill, bulk
- `pin-off` in line, duocolor, duotone
- `planet` in line, duocolor, duotone, fill, bulk
- `server-off` in line, duocolor, duotone
- `shield-off` in line, duocolor, duotone
- `star-off` in line, duocolor, duotone
- `sun-moon` in line, duocolor, duotone, fill, bulk
- `video-off` in line, duocolor, duotone, fill, bulk
- `volume-off` in duotone
- `zap-off` in duotone

## 5.1.0

Keyboard keys, carets in four directions, the Linux logo and a bigger transit set with trams, subways, cable cars, ferries, police cars and side views of trains, planes and ships. The vehicles already in the set are redrawn to match.

1,258 icons with 12 aliases in 30 categories.

### New

`backspace`, `cable-car`, `cable-car-alt`, `caps-lock`, `car-electric-side`, `caret-down`, `caret-left`, `caret-right`, `caret-up`, `caret-up-down`, `coach`, `coach-front`, `cog-railway`, `control`, `escape`, `ferry`, `helicopter-front`, `linux`, `plane-side`, `police-car`, `police-car-side`, `shift`, `ship-side`, `space`, `speedboat`, `square-menu`, `submarine`, `subway`, `suspension-railway`, `suspension-railway-front`, `suv`, `taxi-side`, `train-side`, `train-track`, `tram`, `tram-side`, `tunnel`, `yacht`

### Redrawn

- `ambulance` in line, duocolor, duotone, fill, bulk
- `bus` in line, duocolor, duotone, fill, bulk
- `bus-side` in line, duocolor, duotone, fill, bulk
- `car` in line, duocolor, duotone, fill, bulk
- `car-electric` in line, duocolor, duotone, fill, bulk
- `car-side` in line, duocolor, duotone, fill, bulk
- `sailboat` in line, duocolor, duotone, fill, bulk
- `ship` in line, duocolor, duotone, fill, bulk
- `taxi` in line, duocolor, duotone, fill, bulk
- `train` in line, duocolor, duotone, fill, bulk
- `truck` in line, duocolor, duotone, fill, bulk
- `truck-fast` in line, duocolor, duotone, fill, bulk

## 5.0.0

coolicons v5 is here. Every icon was redrawn from scratch, and the set grew from 440 to over 1,200 icons.

- Five styles instead of three: Line, Duocolor, Duotone, Fill and Bulk.
- Sharp, regular or round corners for every icon.
- Packages for React, Vue and plain SVG, and single icons for shadcn/ui through the registry on [coolicons.cool](https://coolicons.cool).
- Tools for coding agents: an MCP server, a CLI and a skill, so agents look names up instead of guessing.
- A new website with an icon picker to find, adjust and copy any icon.

Icon names are final from this release on. A major version removes or renames icons, a minor version adds icons and a patch redraws them.

1,220 icons with 11 aliases in 30 categories.

## 5.0.0-beta.2

1,220 icons with 11 aliases in 30 categories. Every icon now has search tags.

Two new packages for terminals and coding agents: `@coolicons/cli` finds icons and copies them into a project, and `@coolicons/mcp` is an MCP server, also listed in the MCP Registry. Agents can learn the set with the skill: `npx skills add krystonschwarze/coolicons`.

### New

`raccoon`

### Redrawn

- `calendar-check-corner` in bulk
- `calendar-close-corner` in bulk
- `calendar-edit-corner` in bulk
- `calendar-minus-corner` in bulk
- `calendar-plus-corner` in bulk
- `calendar-search-corner` in bulk
- `calendar-sparkle-corner` in bulk
- `checkbox-partial` in line, duocolor, duotone, fill, bulk
- `cloud-check` in line, duocolor, duotone, fill, bulk
- `cloud-sync-corner` in duotone, fill, bulk
- `database-minus-corner` in line, duocolor, duotone, fill, bulk
- `exit` in line, duocolor, duotone, fill, bulk
- `file-minus-corner` in line, duocolor, duotone, fill, bulk
- `filter-off` in line, duocolor, duotone, fill, bulk
- `folder-minus-corner` in line, duocolor, duotone, fill, bulk
- `git-merge` in line, duocolor, duotone, fill, bulk
- `hexagon` in line, duocolor, duotone, fill, bulk
- `hexagon-check` in line, duocolor, duotone, fill, bulk
- `hexagon-close` in line, duocolor, duotone, fill, bulk
- `hexagon-help` in line, duocolor, duotone, fill, bulk
- `hexagon-info` in line, duocolor, duotone, fill, bulk
- `hexagon-minus` in line, duocolor, duotone, fill, bulk
- `hexagon-plus` in line, duocolor, duotone, fill, bulk
- `hexagon-warning` in line, duocolor, duotone, fill, bulk
- `note-minus-corner` in line, duocolor, duotone, fill, bulk
- `settings` in fill, bulk
- `settings-alt` in line, duocolor, duotone, fill, bulk
- `shower` in line, duocolor, duotone, fill, bulk
- `sort-ascending` in line, duocolor, duotone, fill, bulk
- `sort-descending` in line, duocolor, duotone, fill, bulk
- `table-cells-merge` in line, duocolor, duotone, fill, bulk
- `table-minus-corner` in line, duocolor, duotone, fill, bulk
- `wifi-high` in line, duocolor, duotone, fill, bulk
- `wifi-low` in line, duocolor, duotone, fill, bulk
- `wifi-medium` in line, duocolor, duotone, fill, bulk
- `wifi-none` in line, duocolor, duotone, fill, bulk
- `wifi-off` in line, duocolor, duotone, fill, bulk
- `wifi-problem` in line, duocolor, duotone, fill, bulk
- `window-check-corner` in bulk
- `window-close-corner` in bulk
- `window-minus-corner` in line, duocolor, duotone, fill, bulk
- `window-plus-corner` in bulk

## 5.0.0-beta.1

First release of coolicons v5: 1,219 icons with 11 aliases in 30 categories, each in five styles (Line, Duocolor, Duotone, Fill, Bulk) and three corner radii (Sharp, Regular, Round).

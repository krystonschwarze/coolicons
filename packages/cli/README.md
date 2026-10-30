# @coolicons/cli

<a href="https://coolicons.cool"><img src="https://raw.githubusercontent.com/krystonschwarze/coolicons/main/.github/assets/banner.png" alt="coolicons: Every icon for your next project. Free, wherever you build." width="100%"></a>

Search [coolicons](https://coolicons.cool) and copy them into your project from the terminal: 1,220 icons in five styles and three corner radii. No install, no dependencies, no network. The whole set ships inside the package.

```sh
npx @coolicons/cli search delete
npx @coolicons/cli show trash --style fill > trash.svg
npx @coolicons/cli add trash bell --style bulk --radius round --out src/icons
```

## Commands

| Command | |
| --- | --- |
| `search <query>` | Find icons by name or meaning, ranked like the search on coolicons.cool |
| `show <name>` | Print one icon's SVG to stdout |
| `add <name...>` | Write SVG files into a folder |
| `list` | Print every icon name |

| Option | |
| --- | --- |
| `-s, --style` | `line`, `duocolor`, `duotone`, `fill` or `bulk`. Default `line` |
| `-r, --radius` | `sharp`, `regular` or `round`. Default `regular` |
| `-o, --out` | Folder for `add`. Default `./icons` |
| `-l, --limit` | Results for `search`. Default 20 |
| `-c, --category` | Only one category, for `list` |
| `--size`, `--stroke` | Size and stroke width of the SVG. Default 24 and 2 |
| `--json` | Machine readable output for `search` and `list` |

`show` and `list` write only their result to stdout, everything else goes to stderr, so you can pipe them:

```sh
npx @coolicons/cli list | grep chart
npx @coolicons/cli show mail --style fill | pbcopy
```

A name that does not exist suggests the closest ones: `show chekc` answers with `check`.

More in the [coolicons repository](https://github.com/krystonschwarze/coolicons#readme). MIT license.

# @coolicons/mcp

<a href="https://coolicons.cool"><img src="https://raw.githubusercontent.com/krystonschwarze/coolicons/main/.github/assets/banner.png" alt="coolicons: Every icon for your next project. Free, wherever you build." width="100%"></a>

An MCP server for [coolicons](https://coolicons.cool). Lets a coding agent search 1,220 icons in five styles and three corner radii, read an icon's SVG and get the right import, without guessing names.

## Install

Claude Code:

```sh
claude mcp add coolicons -- npx -y @coolicons/mcp
```

Any other client that speaks MCP over stdio:

```json
{
  "mcpServers": {
    "coolicons": {
      "command": "npx",
      "args": ["-y", "@coolicons/mcp"]
    }
  }
}
```

No API key, no network. The whole set ships inside the package.

## Tools

| Tool | What it does |
| --- | --- |
| `describe_set` | Counts, styles, radii, categories, packages and naming rules. Worth calling first |
| `search_icons` | Find icons by name or meaning. Separate several searches with commas to resolve many names in one call |
| `get_icon` | SVG source of one icon in any style and corner radius, with size and stroke width |
| `get_usage` | Install command and import code for React, Vue, SVG or the shadcn/ui registry, with the entry for the chosen style and radius |

A name that does not exist is answered with the closest names, so a typo resolves in one turn. Names that clash with JavaScript or browser globals, like `map` or `file`, come back with the `Icon` suffix (`MapIcon`).

More in the [coolicons repository](https://github.com/krystonschwarze/coolicons#readme). MIT license.

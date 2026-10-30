# @coolicons/react

<a href="https://coolicons.cool"><img src="https://raw.githubusercontent.com/krystonschwarze/coolicons/main/.github/assets/banner.png" alt="coolicons: Every icon for your next project. Free, wherever you build." width="100%"></a>

[coolicons](https://coolicons.cool) as React components: 1,220 icons in five styles and three corner radii.

```sh
npm install @coolicons/react
```

```jsx
import { House } from "@coolicons/react";
import { Folder } from "@coolicons/react/bulk/round";

<House size={20} />
<Folder strokeWidth={1.5} title="Projects" />
```

`@coolicons/react` is Line in Regular. Other styles are in `@coolicons/react/<style>` and `@coolicons/react/<style>/<radius>`, with the styles `line`, `duocolor`, `duotone`, `fill`, `bulk` and the radii `sharp`, `regular`, `round`. `CooliconsIcon` from `@coolicons/react/dynamic` renders any icon by name for pickers.

Props, names and versions are described in the [coolicons repository](https://github.com/krystonschwarze/coolicons#readme). MIT license.

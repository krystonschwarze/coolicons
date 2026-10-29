# @coolicons/vue

[coolicons](https://coolicons.cool) as Vue 3 components: 1220 icons in five styles and three corner radii.

```sh
npm install @coolicons/vue
```

```vue
<script setup>
import { House } from "@coolicons/vue";
import { Folder } from "@coolicons/vue/bulk/round";
</script>

<template>
  <House :size="20" />
  <Folder :stroke-width="1.5" title="Projects" />
</template>
```

`@coolicons/vue` is Line in Regular. Other styles are in `@coolicons/vue/<style>` and `@coolicons/vue/<style>/<radius>`, with the styles `line`, `duocolor`, `duotone`, `fill`, `bulk` and the radii `sharp`, `regular`, `round`. `CooliconsIcon` from `@coolicons/vue/dynamic` renders any icon by name for pickers.

Props, names and versions are described in the [coolicons repository](https://github.com/krystonschwarze/coolicons#readme). MIT license.

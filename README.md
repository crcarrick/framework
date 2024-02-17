# Metaframework 🤷‍♂️

[example app](./example)

## Development

#### Setup

```shell
git clone git@github.com:crcarrick/metaframework.git
cd metaframework
pnpm install
```

#### Build / watch packages

```shell
pnpm watch
```

#### Run example

```shell
cd example
pnpm debug
```

## Features to copy

```
- Routing    -- Slots
- Routing    -- Route Groups (shared layouts)
- ✅ Routing -- Route metadata (✅ but still need to add many fields)
- ✅ Bundle  -- Bundle route components (page, layout, fallback) together
- ✅ Routing -- Nested layouts
- Rendering  -- __SSP appearing in <head> (maybe ok?)
- Server     -- Can we support RSC?
- Server     -- SSR / Suspense stuff is (less, but still) pretty shitty atm
- Bundle     -- There is a problem where if you export something (metadata, gSSP, etc) from both
                a page, _and_ a layout or fallback, they all stop working
- Bundle     -- For now, the project installing `metaframework` still has to install a ton of peer deps
```

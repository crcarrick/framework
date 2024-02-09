# Framework 🤷‍♂️

[example app](./example)

## Development

#### Setup

```shell
git clone git@github.com:crcarrick/framework.git
cd framework
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
- Routing   -- Slots
- Routing   -- Route Groups (shared layouts)
- Routing   -- Route metadata (✅ but still need to add many fields, also need to merge metadatas)
- Bundle    -- Bundle route components (page, layout, fallback) together
- Rendering -- __SSP appearing in <head> (maybe ok?)
- Server    -- Can we support RSC?
- Server    -- SSR / Suspense stuff is (less, but still) pretty shitty atm
```

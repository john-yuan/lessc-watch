# lessc-watch

[![npm version](https://img.shields.io/npm/v/lessc-watch)](https://www.npmjs.com/package/lessc-watch)
[![install size](https://packagephobia.now.sh/badge?p=lessc-watch)](https://packagephobia.now.sh/result?p=lessc-watch)
[![npm downloads](https://img.shields.io/npm/dm/lessc-watch.svg)](https://npm-stat.com/charts.html?package=lessc-watch)

Watch for file changes and compile [less](https://lesscss.org/usage) files into a single css bundle file.

## Getting started

```sh
# Install `lessc-watch` as a dev dependency locally.
npm i lessc-watch --save-dev

# Watch the `src` directory and build `src/index.less`
# (and all its dependencies) to `dist/bundle.less`.
# Set the `rewrite-urls` option of less to `all`.
npx lessc-watch src/index.less dist/bundle.css -ru=all -d=src

# Build `src/index.less` to `dist/bundle.css` and exit without watching.
npx lessc-watch src/index.less dist/bundle.css -ru=all --build
```

## Command options

```txt
COMMAND
  lessc-watch <entry_file> <output_file> [options ...]

EXAMPLE
  lessc-watch src/index.less dist/bundle.css -d=src -ru=all

OPTIONS
  --watch-dir, -d      The directory to watch (default to "./").

  --rewrite-urls, -ru  The option of less "rewrite-urls".

  --ext                The extra file extensions to watch (separated
                       by comma). The base extensions are .less, .css,
                       .svg, .png, .jpg, .jpeg, .gif, .webp, .bmp.
                       You can use this option to add more.

  --build              Build less to css without watching for the
                       file changes.

  --delay              The milliseconds to delay before building
                       (default to 0).

  --quiet, -q          Disable all logs (not including error message).

  --help, -h           Print this message.
```

## Programmatic usage

```js
const { resolve } = path
const { watch } = require('lessc-watch')

watch({
  entry: resolve(__dirname, './src/index.less'),
  output: resolve(__dirname, './dist/bundle.css'),
  watchDir: resolve(__dirname, './src'),
  lessOptions: {
    rewriteUrls: 'all'
  }
})
```

The options to `watch(options: LesscWatchOptions)` method is:

```ts
interface LesscWatchOptions {
  entry: string
  output: string
  watchDir?: string
  extraWatchExtensions?: string[]
  delay?: number
  quiet?: boolean
  build?: boolean
  lessOptions?: LessOptions
  watchOptions?: WatchOptions
}
```

## Feedback

Any feedback is welcome. Please feel free to [file an issue](https://github.com/john-yuan/lessc-watch/issues/new).

## License

[MIT](https://github.com/john-yuan/lessc-watch/blob/main/LICENSE)

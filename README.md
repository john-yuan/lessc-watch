# lessc-watch

Watch the file changes and compile the less files to a single css bundle file.

## Getting started

```sh
# Install `lessc-watch` as a local dev dependency.
npm i lessc-watch --save-dev

# Watch the `src` directory and build `src/index.less`
# (and all its dependencies) to `dist/bundle.less`.
npx lessc-watch src/index.less dist/bundle.css -ru=all -d=src
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

  --ext                The extra file extensions to watch (separated by comma).
                       The base extensions are .less, .css, .svg, .png, .jpg,
                       .jpeg, .gif, .webp, .bmp. You can use this option to
                       add more.

  --build              Build less to css without watching the file changes.

  --delay              The milliseconds to delay before building (default to 0).

  --quiet, -q          Disable all logs.

  --help, -h           Print this message.
```

## Programmatic Usage

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

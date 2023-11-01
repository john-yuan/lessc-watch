const { resolve } = require('path')
const { watch } = require('../lib/index')

watch({
  entry: resolve(__dirname, './src/index.less'),
  output: resolve(__dirname, './dist/bundle.css'),
  watchDir: resolve(__dirname, './src'),
  lessOptions: {
    rewriteUrls: 'all',
    globalVars: {
      prefix: 'myui'
    }
  }
})

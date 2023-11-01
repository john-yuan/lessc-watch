import path from 'path'
import { LesscWatchOptions } from './types'
import { watch } from './watch'
import { readFileSync } from 'fs'

const resolverArgs = (argv: string[], allowedArgs?: string[]) => {
  const args: Record<string, string> = {}
  const rest = [...argv]
  const unknownArgs: string[] = []
  const ignoredValues: string[] = []

  const setArg = (key: string, value: string) => {
    args[key] = value
    if (allowedArgs) {
      if (!allowedArgs.includes(key)) {
        unknownArgs.push(key)
      }
    }
  }

  while (rest.length > 0) {
    const option = rest.shift()

    if (option) {
      if (option.startsWith('--') || option.startsWith('-')) {
        if (option.includes('=')) {
          const [key, ...values] = option.split('=')
          setArg(key, values.join('='))
        } else {
          const value = rest.shift()

          if (value) {
            if (value.startsWith('--') || value.startsWith('-')) {
              rest.unshift(value)
              setArg(option, '')
            } else {
              setArg(option, value)
            }
          } else {
            setArg(option, '')
          }
        }
      } else {
        ignoredValues.push(option)
      }
    }
  }

  return { args, unknownArgs, ignoredValues }
}

const allowedArgs = [
  '--help',
  '-h',
  '--watch-dir',
  '-d',
  '--config',
  '-f',
  '--rewrite-urls',
  '-ru',
  '--ext',
  '--build',
  '--delay',
  '--quiet',
  '-q',
  '--global-vars',
  '--help',
  '-h'
]
const { args, unknownArgs, ignoredValues } = resolverArgs(process.argv.slice(2), allowedArgs)

const hasArg = (key: string) => typeof args[key] === 'string'

if (unknownArgs.length) {
  console.warn(
    `Warning: Unknown argument${unknownArgs.length > 1 ? 's' : ''} ${unknownArgs.join(', ')}`
  )
}

if (ignoredValues.length > 2) {
  console.warn(
    `Warning: Ignored value${ignoredValues.length > 1 ? 's' : ''} ${ignoredValues
      .slice(2)
      .join(', ')}`
  )
}

const help = [
  'COMMAND',
  '  lessc-watch <entry_file> <output_file> [options ...]',
  '',
  'EXAMPLE',
  '  lessc-watch src/index.less dist/bundle.css -d=src -ru=all',
  '  lessc-watch -f ./config.json',
  '  lessc-watch --config ./config.json',
  '',
  'OPTIONS',
  '  --watch-dir, -d      The directory to watch (default to "./").',
  '',
  '  --rewrite-urls, -ru  The option of less "rewrite-urls".',
  '',
  '  --global-vars        Set less global variables (separated by comma).',
  '                       Example 1: --global-vars=prefix=my-ui',
  '                       Example 2: --global-vars=color1=red,color2=blue',
  '',
  '  --config, -f         Specify the path of the config file.',
  '                       Please note that the path of the file or directory',
  '                       in the config file is relative to the path of the',
  '                       config file.',
  '',
  '  --ext                The extra file extensions to watch (separated',
  '                       by comma). The base extensions are .less, .css,',
  '                       .svg, .png, .jpg, .jpeg, .gif, .webp and .bmp.',
  '                       You can use this option to add more.',
  '',
  '  --build              Build less to css without watching for the',
  '                       file changes.',
  '',
  '  --delay              The milliseconds to delay before building',
  '                       (default to 0).',
  '',
  '  --quiet, -q          Disable all logs (not including error message).',
  '',
  '  --help, -h           Print this message.'
].join('\n')

const printHelp = () => {
  console.log(help)
}

if (hasArg('-h') || hasArg('--help')) {
  printHelp()
  process.exit(0)
}

const readConfigFile = (): LesscWatchOptions => {
  const configFile = args['--config'] || args['-f']

  if (configFile) {
    try {
      const configPath = path.resolve(process.cwd(), configFile)
      const content = readFileSync(configPath).toString()
      const config = (JSON.parse(content) || {}) as LesscWatchOptions
      const configDir = path.dirname(configPath)

      if (config.entry) {
        config.entry = path.resolve(configDir, config.entry)
      }

      if (config.output) {
        config.output = path.resolve(configDir, config.output)
      }

      if (config.watchDir) {
        config.watchDir = path.resolve(configDir, config.watchDir)
      }

      return config
    } catch (err) {
      console.error(`ERROR: Failed reading config.`)
      console.error(err)
      process.exit(1)
    }
  }

  return { entry: '', output: '' }
}

const options: LesscWatchOptions = readConfigFile()

options.entry = ignoredValues[0] ? ignoredValues[0] : options.entry
options.output = ignoredValues[1] ? ignoredValues[1] : options.output

if (!options.entry) {
  console.error(`ERROR: No entry file specified.`)
  process.exit(1)
}

if (!options.output) {
  console.error(`ERROR: No output file specified.`)
  process.exit(1)
}

const watchDir = args['--watch-dir'] || args['-d']

if (watchDir) {
  options.watchDir = watchDir
}

const rewriteUrls = args['--rewrite-urls'] || args['-ru']

if (rewriteUrls) {
  options.lessOptions = options.lessOptions || {}
  options.lessOptions.rewriteUrls = rewriteUrls as 'all' | 'local' | 'off'
}

const globalVars = args['--global-vars']

if (globalVars) {
  const vars: Record<string, string> = options.lessOptions?.globalVars || {}

  globalVars.split(/[&,]/).forEach((item) => {
    const arr = item.split('=')
    if (arr[0] && arr[1]) {
      vars[arr[0]] = arr[1]
    }
  })

  options.lessOptions = options.lessOptions || {}
  options.lessOptions.globalVars = vars
}

const ext = args['--ext']

if (ext) {
  const extraWatchExtensions = options.extraWatchExtensions || []

  extraWatchExtensions.push(...ext.split(/\s*,\s*/))
  options.extraWatchExtensions = extraWatchExtensions
}

if (hasArg('--build')) {
  options.build = true
}

const delay = args['--delay']

if (delay) {
  const delayMs = +delay

  if (!isNaN(delayMs)) {
    options.delay = delayMs
  }
}

if (hasArg('--quiet') || hasArg('-q')) {
  options.quiet = true
}

watch(options)

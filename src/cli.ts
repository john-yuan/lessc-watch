import { LesscWatchOptions } from './types'
import { watch } from './watch'

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
  '-h',
  '--help',
  '--watch-dir',
  '-d',
  '--rewrite-urls',
  '-ru',
  '--ext',
  '--build',
  '--delay',
  '--quiet',
  '-q',
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
  '',
  'OPTIONS',
  '  --watch-dir, -d      The directory to watch (default to "./").',
  '',
  '  --rewrite-urls, -ru  The option of less "rewrite-urls".',
  '',
  '  --ext                The extra file extensions to watch (separated by comma).',
  '                       The base extensions are .less, .css, .svg, .png, .jpg,',
  '                       .jpeg, .gif, .webp, .bmp. You can use this option to',
  '                       add more.',
  '',
  '  --build              Build less to css without watching the file changes.',
  '',
  '  --delay              The milliseconds to delay before building (default to 0).',
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

const options: LesscWatchOptions = {
  entry: ignoredValues[0] || '',
  output: ignoredValues[1] || ''
}

if (!options.entry) {
  console.error(`ERROR: No entry file specified.`)
  console.log('')
  printHelp()
  process.exit(1)
}

if (!options.output) {
  console.error(`ERROR: No output file specified.`)
  console.log('')
  printHelp()
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

const ext = args['--ext']

if (ext) {
  options.extraWatchExtensions = ext.split(/\s*,\s*/)
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

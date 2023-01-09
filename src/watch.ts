import fs from 'fs'
import less from 'less'
import path from 'path'
import chokidar from 'chokidar'

import type { LesscWatchOptions } from './types'

const dateTime = () => {
  const date = new Date()
  const z = (n: number) => (n < 10 ? `0${n}` : n)
  const YYYY = date.getFullYear()
  const MM = date.getMonth() + 1
  const DD = date.getDate()
  const h = date.getHours()
  const m = date.getMinutes()
  const s = date.getSeconds()
  return `${YYYY}-${z(MM)}-${z(DD)} ${z(h)}:${z(m)}:${z(s)}`
}

const ensureDirSync = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { mode: 0o755, recursive: true })
  }
}

export const watch = async (options: LesscWatchOptions) => {
  const entryFilename = path.resolve(options.entry)
  const outputFilename = path.resolve(options.output)
  const outputDir = path.dirname(outputFilename)
  const watchOptions = options.watchOptions ? { ...options.watchOptions } : {}
  const lessOptions = options.lessOptions ? { ...options.lessOptions } : {}
  const watchCwd = watchOptions.cwd ? path.resolve(watchOptions.cwd) : process.cwd()
  const delay = typeof options.delay === 'number' && options.delay > 0 ? options.delay : 0

  watchOptions.cwd = watchCwd
  watchOptions.ignoreInitial = watchOptions.ignoreInitial === undefined
  watchOptions.followSymlinks = watchOptions.followSymlinks === undefined
  watchOptions.disableGlobbing = true
  lessOptions.filename = lessOptions.filename === undefined ? entryFilename : lessOptions.filename

  const relativeOutputFilename = path.relative(process.cwd(), outputFilename)
  const watchExtensions = [
    '.less',
    '.css',
    '.svg',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.webp',
    '.bmp'
  ]

  options.extraWatchExtensions?.forEach((extension) => {
    const lowercaseExtension = extension.trim().toLowerCase()
    if (lowercaseExtension) {
      if (!watchExtensions.includes(lowercaseExtension)) {
        watchExtensions.push(lowercaseExtension)
      }
    }
  })

  const compile = () => {
    return new Promise<string[]>((resolve, reject) => {
      const input = fs.readFileSync(entryFilename).toString()
      less.render(input, lessOptions, (err, output) => {
        if (err || !output) {
          reject(err || new Error('output is undefined'))
        } else {
          try {
            fs.writeFileSync(outputFilename, output.css)
          } catch (err) {
            reject(err)
            return
          }
          resolve(output.imports)
        }
      })
    })
  }

  let mTriggers: { event: string; filename: string }[] = []

  const build = async () => {
    const triggers = mTriggers
    const lockTriggers: typeof mTriggers = []

    mTriggers = lockTriggers

    return compile()
      .then(() => {
        if (lockTriggers === mTriggers) {
          if (!options.quiet) {
            const triggerDescList: string[] = []

            triggers
              .map(({ event, filename }) => {
                const triggerDesc = `${event} ${filename}`
                if (!triggerDescList.includes(triggerDesc)) {
                  triggerDescList.push(triggerDesc)
                }
              })
              .join(', ')

            const times = triggers.length > 1 ? ` x${triggers.length}` : ''

            const triggerText = triggerDescList.length
              ? ` (${triggerDescList.join(', ')})${times}`
              : ' (initial build)'

            console.log(`[${dateTime()}] Compiled to ${relativeOutputFilename}${triggerText}`)
          }
        }
      })
      .catch((err) => {
        if (lockTriggers === mTriggers) {
          try {
            const { line, column, message, filename } = err
            if (typeof filename === 'string') {
              console.error(
                `[${dateTime()}] Error: ${message}. File: ${filename} (Line ${line}, Col ${column})`
              )
            } else {
              console.error(err)
            }
          } catch (e) {
            console.error(err)
          }
        }
      })
  }

  let timerId: NodeJS.Timeout | null = null

  const schedule = (event?: string, filename?: string) => {
    if (event && filename) {
      mTriggers.push({ event, filename })
    }

    if (delay) {
      if (timerId === null) {
        timerId = setTimeout(() => {
          timerId = null
          build()
        }, delay)
      }
    } else {
      build()
    }
  }

  const watchDir = path.resolve(options.watchDir || './')

  if (!options.quiet && !options.build) {
    const shortWatchDir = path.relative(process.cwd(), watchDir).replace(/\\/, '/') || './'
    console.log(`[${dateTime()}] Watching ${shortWatchDir}`)
  }

  ensureDirSync(outputDir)

  if (watchOptions.ignoreInitial) {
    await build()
  }

  if (options.build) {
    if (!options.quiet) {
      console.log(`[${dateTime()}] Build succeeded`)
    }
    return null
  }

  return chokidar.watch(watchDir, watchOptions).on('all', (event, filename) => {
    if (event === 'unlinkDir') {
      schedule(event, filename)
    } else if (event === 'change' || event === 'add' || event === 'unlink') {
      const lowercaseFilename = filename.toLowerCase()
      const absoluteFilename = path.resolve(watchCwd, filename)

      if (absoluteFilename !== outputFilename) {
        if (watchExtensions.some((extension) => lowercaseFilename.endsWith(extension))) {
          schedule(event, filename)
        }
      }
    }
  })
}

import { WatchOptions } from 'chokidar'

export interface LessOptions {
  /**
   * Filename of the main file to be passed to less.render()
   */
  filename?: string;

  /**
   * If the file in an `@import` rule does not exist at that exact location,
   * Less will look for it at the location(s) passed to this option.
   * You might use this for instance to specify a path to a library
   * which you want to be referenced simply and relatively in the Less files.
   *
   * - `lessc --include-path=PATH1;PATH2`
   */
  paths?: string[];

  /**
   * Allows you to add a path to every generated import and url in your css.
   * This does not affect Less import statements that are processed,
   * just ones that are left in the output css.
   *
   * For instance, if all the images the css use are in a folder called
   * resources, you can use this option to add this on to the URL's and then
   * have the name of that folder configurable.
   *
   * - `lessc -rp=resources/`
   * - `lessc --rootpath=resources/`
   */
  rootpath?: string;

  /**
   * By default URLs are kept as-is (off), so if you import a file in a
   * sub-directory that references an image, exactly the same URL will be
   * output in the css. This option allows you to rewrite URLs in imported
   * files so that the URL is always relative to the base file that has
   * been passed to Less.
   *
   * - `lessc -ru=off`
   * - `lessc --rewrite-urls=off`
   * - `lessc -ru=all`
   * - `lessc --rewrite-urls=all`
   * - `lessc -ru=local`
   * - `lessc --rewrite-urls=local`
   */
  rewriteUrls?: 'off' | 'all' | 'local';

  /**
   * Less has re-built math options to offer an in-between feature between the
   * previous `strictMath` setting, which required parentheses all the time,
   * and the default, which performed math in all situations.
   *
   * In order to cause fewer conflicts with CSS, which now liberally uses the
   * `/` symbol between values, there is now a math mode that only requires
   * parentheses for division. (This is now the default in Less 4.)
   * "Strict math" has also been tweaked to operate more intuitively,
   * although the legacy behavior is supported.
   *
   * The four options available for `math` are:
   *
   * - `always` (3.x default) - Less does math eagerly
   * - `parens-division` (4.0 default) - No division is performed outside of
   * parens using `/` operator (but can be "forced" outside of parens
   * with `./` operator - `./` is deprecated)
   * - `parens` | `strict` - Parens required for all math expressions.
   * - `strict-legacy` (removed in 4.0) - In some cases, math will not be
   * evaluated if any part of the expression cannot be evaluated.
   *
   * - `lessc -m=[option]`
   * - `lessc --math=[option]`
   */
  math?: 'always' | 'parens-division' | 'parens' | 'strict' | 'strict-legacy';

  /**
   * Defaults to off/false. Without this option, Less attempts to guess at
   * the output unit when it does maths.
   *
   * - `lessc -su=on`
   * - `lessc --strict-units=on`
   */
  strictUnits?: boolean;

  /**
   * @Deprecated
   *
   * False by default starting in v3.0.0.
   * Enables evaluation of JavaScript inline in .less files.
   * This created a security problem for some developers who
   * didn't expect user input for style sheets to have executable code.
   *
   * - `lessc --js`
   */
  javascriptEnabled?: boolean;

  /**
   * This option defines a variable that can be referenced by the file.
   * Effectively the declaration is put at the top of your base Less file,
   * meaning it can be used but it also can be overridden if this variable
   * is defined in the file.
   *
   * - `lessc --global-var="color1=red"`
   */
  globalVars?: Record<string, string>;

  /**
   * As opposed to the global variable option, this puts the declaration at the
   * end of your base file, meaning it will override anything defined in your
   * Less file.
   *
   * - `lessc --modify-var="color1=red"`
   */
  modifyVars?: Record<string, string>;

  /**
   * This option allows you to specify a argument to go on to every URL.
   * This may be used for cache-busting for instance.
   *
   * - `lessc --url-args="cache726357"`
   */
  urlArgs?: string;

  /**
   * Runs the less parser and just reports errors without any output.
   *
   * - `lessc --lint -l`
   */
  lint?: boolean;

  /**
   * @Deprecated
   *
   * Compress using less built-in compression. This does an okay job but does
   * not utilise all the tricks of dedicated css compression. In general, we
   * recommend looking at third-party tools that clean and compress CSS after
   * your Less has been transformed to CSS.
   *
   * - `lessc --compress -x`
   */
  compress?: boolean;

  /**
   * Allow Imports from Insecure HTTPS Hosts
   *
   * - `lessc --insecure`
   */
  insecure?: boolean;
}

export interface LesscWatchOptions {
  entry: string;
  output: string;
  watchDir?: string;
  extraWatchExtensions?: string[]
  delay?: number;
  quiet?: boolean;
  build?: boolean;
  lessOptions?: LessOptions;
  watchOptions?: WatchOptions;
}

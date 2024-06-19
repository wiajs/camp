/* eslint-disable import/no-extraneous-dependencies */

/**
 * Created by way on 2019/3/12.
 */
const gulp = require('gulp')
const open = require('opn') // open esm
const connect = require('gulp-connect')
const exec = require('exec-sh')
const _ = require('lodash')
const path = require('path')
// const webpack = require('webpack')
const rspack = require('@rspack/core')
const replace = require('gulp-replace')
const rename = require('gulp-rename')
const les = require('gulp-less')
const mincss = require('gulp-clean-css')
const autoprefixer = require('gulp-autoprefixer')
const tap = require('gulp-tap')
const named = require('vinyl-named')
const htmlmin = require('gulp-htmlmin')
// const markdown = require('gulp-markdown');
const through = require('through2')
const buildF7 = require('@wiajs/f7/f7')
const wiapage = require('@wiajs/core/util/wiapage')
const wiafile = require('@wiajs/core/util/wiafile')
const wiacfg = require('./wia.config')
// const wpCfg = require('./webpack.config')
const rsCfg = require('./rspack.config')
const pkg = require('./package.json')

const _prj = pkg.name
const _src = './src'
const _dst = './dist' // 本地测试

let _wping = null
const _mapDelay = 5 // 延迟10秒，执行源代码文件扫描

// NODE_ENV 系统变量
const env = process.env.NODE_ENV || 'development' // development production
const mode = process.env.WIA_MODE || 'local' // local pub
const isProd = env === 'production'
const isDev = !isProd
const isPub = mode === 'pub'

console.log({wiacfg, dst: _dst, src: _src, env, isProd, isPub, mode})

/**
 * 删除已有发布文件，全部重新生成
 * 需全局安装 shx 兼容操作系统 npm i -g shx
 * @returns
 */
async function clean(cb) {
  const toRemove = ['*.map', 'index.*', 'f7.*.*', 'part', 'page'].map(cmd => `shx rm -rf ${cmd}`)

  await exec.promise(`shx rm -rf wiafile.yml`)
  await exec.promise(`cd dist && ${toRemove.join(' && ')}`)
  cb && cb()
}

// 去掉页面空格，拷贝页面到指定目录
async function html(cb) {
  gulp
    .src([`${_src}/**/*.html`], {base: './src'})
    .pipe(replace(/href\s*=\s*"\s*"/gim, 'href="javascript:;"'))
    .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
    .pipe(gulp.dest(_dst))

  cb && cb()
}

function f7(cb) {
  buildF7(__dirname, _prj, cb)
}

function css(cb) {
  buildCss(['page/attend/index.less'], cb)
}

/**
 * less 转换为 css
 * page/attend/index.less
 * #star-etrip-attend-index
 * @param {*} ls less数组
 * @param {*} cb
 */
function buildCss(ls, cb) {
  if (_.isEmpty(ls)) {
    cb()
    return
  }

  ls = ls.map(v => `${_src}/${v}`)
  // console.log('buildCss', {ls});
  gulp
    .src(ls, {base: './src'}) // 带路径输出
    .pipe(
      les().on('error', e => {
        console.error(e.message)
        this.emit('end')
      })
    )
    .pipe(autoprefixer()) // 自动添加浏览器兼容前缀如：-webkit-
    // .pipe(replace(/#page-id/gim, function (match) {
    //   console.log(this.relative);
    // }))
    .pipe(
      // 按文件名称 替换 #wiapage-id
      through.obj(function (file, enc, callback) {
        // page/attend/index.js => owner-name-attend-index
        const name = file.relative
          .replace(/^page[/\\]/, `${wiacfg.owner}-${wiacfg.name}-`)
          .replace(/[/\\]/, '-')
          .replace(/\.css$/, '')

        // console.log('update css #wiapage-id to:', name);
        let tx = String(file.contents)
        tx = tx.replace(/#wiapage-id(?=\s+|\.|\s*\{)/gim, `#${name}`)

        file.contents = Buffer.from(tx)
        this.push(file)
        callback()
      })
    )
    // .pipe(header('#${wiacfg.owner}-${wiacfg.name}-{\n', {name: 'World'}))
    // .pipe(footer('\n}'))
    .pipe(gulp.dest(`${_dst}`))
  // .pipe(mincss())
  // .pipe(rename({ suffix: '.min' }))
  // .pipe(gulp.dest(dst));

  cb && cb()
}

async function updatePages(cb) {
  if (_wping) {
    _wping.close(() => {
      console.log('JS watching ended.')
    })
  }

  buildjs(cb)
}

/**
 * 扫描变化的dist目录js文件
 * @param {*} cb
 */
async function pub(cb) {
  const dir = process.cwd()
  try {
    const rs = await wiafile.pub(dir)

    console.log('pub file:', {rs})

    // 上传
    // if (!_.isEmpty(rs)) upcode.upload(appcfg.owner, appcfg.name, dir, rs);

    cb && cb()
    // css(rs.less, () => {
    //   wiamap.builded(dir, true);
    //   cb && cb();
    // });
  } catch (ex) {
    console.log('pub exp:', ex.message)
    wiafile.pubed(dir, false)
    cb && cb()
  }
}

/**
 * js 打包
 * 开发模式打包所有js文件到index.js，调用 webpack的 watch，自动监视文件，
 * 文件变化自动重新打包
 * 发布模式每个js文件独立打包
 * @param {*} cb
 */
async function js(cb) {
  // isProd = true
  buildjs(cb)
}

/**
 * swc 编译 js 代码
 * @param {*} cb
 */
async function swcjs(cb) {
  // swc
  exec('swc --config-file ./.swcrc src -w -d dist')

  if (cb) cb()
}

/**
 * swc 编译 js 代码
 * @param {*} cb
 */
async function serve(cb) {
  // swc
  // exec('vite')
  exec('cross-env NODE_ENV=development rspack serve')

  if (cb) cb()
}

/**
 * page 目录生成 pages.js 文件
 */
async function pages(cb) {
  let ps = {index: `${_src}/entry.js`}
  if (isPub) {
    console.log('clear pages...')
    await wiapage.clear()
    ps = await wiapage.pack()
    if (!_.isEmpty(ps)) ps.entry = `${_src}/entry.js`
    else ps = {entry: `${_src}/entry.js`}
  } else {
    console.log('clear pages...')
    await wiapage.clear()
    console.log('make pages...')
    await wiapage.pages(__dirname, wiacfg)
    ps = {index: `${_src}/entry.js`}
  }
  if (cb) cb()
  else return ps
}

async function buildjs(cb) {
  // 创建webpack编译入口文件
  const r = wiapage.makeFile({Index: './index.js'}, 'entry')
  const ps = await pages()

  const cfg = _.merge(rsCfg, {
    // 替换 webpack.config.js 里的设置
    mode: 'development', // isProd ? 'production' : 'development', // 'development', // env, 'production'
    watch: true, // isPub || isProd,
    devtool: isProd ? false : isPub ? 'eval' : 'source-map', // 单步跟踪调试
    entry: ps,
    output: {
      filename: '[name].js',
    },
  })

  console.log('webpack config:', cfg)

  function rep(err, stats) {
    if (err) {
      console.error('buildjs rep:', err)
    } else {
      console.log(
        'buildjs rep:',
        stats.toString({
          chunks: false, // Makes the build much quieter
          colors: true, // Shows colors in the console
        })
      )

      // server();
    }
    if (cb) cb()
    else console.warn('buildjs no cb!')
  }

  const wp = rspack(cfg)
  // 调用 webpack 进行编译打包，调试模式webpack监控（watch）文件变化后，自动编译打包
  process.nextTick(() => {
    // _wping = isPub || isProd ? wp.run(rep) : wp.watch(cfg.watchOptions, rep);
    _wping = wp.watch(cfg.watchOptions, rep)
  })
}

// function md(cb) {
//   gulp
//     .src([`${_src}/doc/**/*.md`], {base: './src'})
//     .pipe(markdown())
//     // 统一转换到 doc 目录
//     .pipe(gulp.dest(`${_dst}/doc/`));

//   cb && cb();
// }

// 监控文件变化，变化了则自动刷新本地浏览器
function reload() {
  gulp.watch([`${_dst}/**/*.html`, `${_dst}/**/*.css`, `${_dst}/**/*.js`], () => connect.reload())
}

function build(cb) {
  let cbs = 0

  function oncb() {
    cbs += 1
    // 最后一次回调
    if (cbs === 1 && cb) cb()
  }

  // html(oncb);
  // f7(oncb);
  // les(oncb);
  buildjs(oncb)
}

/**
 * 扫描变化的less文件，每个less生成独立的css，便于动态加载
 * @param {*} cb
 */
async function less(cb) {
  const dir = process.cwd()
  try {
    const rs = await wiafile.build(dir, wiacfg)

    if (rs && rs.update && rs.update.less) {
      console.log('wiafile less:', {rs: rs.update.less})

      buildCss(rs.update.less, () => {
        wiafile.builded(dir, true)
        cb && cb()
      })
    } else {
      wiafile.builded(dir, true)
      console.log('less: no change.')
      cb && cb()
    }
  } catch (ex) {
    console.log('less exp:', ex.message)
    wiafile.builded(dir, false)
    cb && cb()
  }
}

/**
 * 文件变化触发编译
 * @param {*} delay 延迟多少秒执行，防抖动，避免文件改动频繁执行
 * @param {*} cb
 */
function autoLess(cb) {
  const dir = process.cwd()
  let cbs = 0

  function oncb() {
    cbs += 1
    // 最后一次回调
    if (cbs === 1) {
      cb && cb()
    }
  }
  // 文件扫描，避免频繁执行，设定定时，默认5秒
  setTimeout(async () => {
    less(cb)
  }, _mapDelay * 1000)
}

/**
 * 清除pages文件，触发webpack
 * @param {*} cb
 */
async function clear(cb) {
  console.log('page.clear...')
  await wiapage.clear(process.cwd())
  if (cb) cb()
}

gulp.task('clean', cb => clean(cb))

// exports.md = md; // md 转换为 html
exports.build = build // wia pages 执行！
exports.pub = pub // wia pages 执行！
exports.autoLes = autoLess // 延时 less 处理
exports.less = less // less 处理 测试 自动检测 less变化，变化less转换css
exports.css = css // gulp css 执行！测试 less 转换 css
exports.f7 = f7 // gulp f7css 执行！
exports.pages = pages // gulp pages 执行！
exports.js = js // gulp js 执行！
exports.swcjs = swcjs // gulp swc 执行 swc 编译
// 监视html文件任务，文件被修改，自动触发该任务
// js 文件由 webpack自己的监控编译，更快
exports.html = html // html 太多了，可单独 使用 gulp html 执行！
// 缺省任务，gulp 任务名称，不带任务名称时，执行该任务
// gulp.task('default', gulp.parallel('watch', 'js', 'css', 'html', 'md', 'web', 'reload'));
// eslint-disable-next-line
// parallel html, f7, less,
if (isDev)
  exports.default = gulp.series(
    clean,
    pages,
    // swcjs,
    // gulp.parallel(html, f7, less, buildjs)
    gulp.parallel(html, f7, less),
    serve,
    // server, // 使用 live server 需屏蔽
    gulp.parallel(() => {
      // js
      // 由 webpack watch 监视
      // page目录新增、删除变化，自动修改 src/pages.js文件，重新编译
      gulp.watch(
        ['./src/page/**/*.js'],
        {events: ['add', 'unlink'], delay: 600},
        pages // clear
      )

      // gulp.watch('./src/**/*.js', {delay: 600}, swcjs);

      // html
      gulp.watch('./src/**/*.html', {delay: 600}, html)

      // css
      // gulp.watch('./src/**/*.less', {delay: 600}, css);
      gulp.watch(
        // ['./src/**/*.{html,less,js}', '!./src/f7.config.js', '!./src/page.bak/**'],
        ['./src/**/*.less', '!./src/page.bak/**'],
        // {queue: false, ignoreInitial: false}, // 不排队，可重入，首次启动运行
        // {queue: false, delay: 600}, // 不排队，可重入，首次启动运行
        {queue: false}, // 不排队，可重入，首次启动运行
        autoLess
      )

      // f7配置变化，自动修改 src/app.js文件，触发 webpack js 重新编译
      gulp.watch('./src/config/f7.js', {delay: 600}, f7)
    })
  )
else
  exports.default = gulp.series(
    clean,
    gulp.parallel(html, f7, less, buildjs),
    // server, // 使用 live server 需屏蔽
    gulp.parallel(() => {
      // js
      // 由 webpack watch 监视
      // page目录新增、删除变化，自动修改 src/pages.js文件，重新编译
      gulp.watch(
        ['./src/page/**/*.js'],
        {events: ['add', 'unlink'], delay: 600},
        pages // clear
      )

      // html
      gulp.watch('./src/**/*.html', {delay: 600}, html)

      // css
      // gulp.watch('./src/**/*.less', {delay: 600}, css);
      gulp.watch(
        // ['./src/**/*.{html,less,js}', '!./src/f7.config.js', '!./src/page.bak/**'],
        ['./src/**/*.less', '!./src/page.bak/**'],
        // {queue: false, ignoreInitial: false}, // 不排队，可重入，首次启动运行
        // {queue: false, delay: 600}, // 不排队，可重入，首次启动运行
        {queue: false}, // 不排队，可重入，首次启动运行
        autoLess
      )

      // f7配置变化，自动修改 src/app.js文件，触发 webpack js 重新编译
      gulp.watch('./src/config/f7.js', {delay: 600}, f7)
    })
  )

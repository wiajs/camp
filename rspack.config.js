const path = require('path')
const rspack = require('@rspack/core')
const refreshPlugin = require('@rspack/plugin-react-refresh')
const {getJsOpt, getTsOpt} = require('./swc.config')
const pkg = require('./package.json')
const cfg = require('./wia.config')

const env = process.env.NODE_ENV || 'development'
const isDev = env === 'development'

// const jsOpt = getJsOpt(isDev)
const jsOpt = getJsOpt(false)
const tsOpt = getTsOpt(isDev)

// console.log({jsOpt, tsOpt})

/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = {
  mode: 'development', // production development
  context: __dirname,
  entry: {
    index: './src/entry.js',
    // index: './src/index.tsx',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    publicPath: 'https://cos.wia.pub',
  },
  devServer: {
    open: false, // 自动打开浏览器
    // static: path.resolve(__dirname, './dist'),
    static: './dist',
    port: cfg.dev.port,
    server: 'http', // 'http' | 'https' | 'spdy'
  },
  optimization: {
    usedExports: false, // 关闭es6摇树 tree-shaking，
    moduleIds: 'named', // 保留名称，named production时需要 deterministic size natural
    // sideEffects: true, // 检测 npm 包的 sideEffects 设置
  },
  watch: true, // gulp 不需要，单独运行时用，监控js 文件变化，变化后自动再次触发编译，以增量方式生成，速度快
  watchOptions: {
    // aggregateTimeout: 600, // 防抖，多少毫秒后再次触发
    // poll: 10000, // 通過轮询监听，true 时默认的轮询间隔为 5007 毫秒
    ignored: ['**/test/**/*.js', '**/node_modules'], // 忽略监控文件，數組中不能用正則
  },
  // profile: true,
  cache: true,
  resolve: {
    // options for resolving module requests
    // (does not apply to resolving to loaders)
    modules: ['node_modules', path.resolve(__dirname, '.')],
    // directories where to look for modules
    extensions: ['...', '.js', '.ts', '.cjs', '.mjs', '.tsx', '.jsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: 'asset',
      },
      {
        test: /\.(js|jsx|cjs|mjs)$/,
        resolve: {
          fullySpecified: false,
        },
        use: [
          {
            loader: 'builtin:swc-loader',
            options: jsOpt,
          },
        ],
      },
      {
        test: /\.html$/i,
        use: 'raw-loader',
      },
      {
        test: /\.(less|css)$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          'less-loader',
        ],
      },
      // {
      //   test: /\.less$/,
      //   use: [
      //     {
      //       loader: 'less-loader',
      //       // options: {
      //       //   modules: true,
      //       // },
      //     },
      //   ],
      //   type: 'css/auto', // 如果你需要将 '*.module.less' 视为 CSS Module 那么将 'type' 设置为 'css/auto' 否则设置为 'css'
      // },
      {
        test: /\.(ts|tsx)$/,
        resolve: {
          fullySpecified: false,
        },
        use: [
          {
            loader: 'builtin:swc-loader',
            options: tsOpt,
          },
        ],
      },
    ],
  },
  plugins: [
    new rspack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
      __DEV__: !env.production,
      __VERSION__: JSON.stringify(pkg.version),
      __TEST__: JSON.stringify('false'),
      'process.env.REACT_SPINKIT_NO_STYLES': JSON.stringify('false'),
    }),
    new rspack.ProgressPlugin({}),
    // new rspack.HtmlRspackPlugin({
    //   template: './src/index.html',
    //   chunks: [], // 手动注入
    //   // inject: 'body',
    // }),
    isDev ? new refreshPlugin() : null,
  ].filter(Boolean),
}

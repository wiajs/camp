import path from 'node:path'
import {fileURLToPath} from 'node:url'
import rspack from '@rspack/core'
import refreshPlugin from '@rspack/plugin-react-refresh'
import {getJsOpt, getTsOpt} from './swc.config.js'
import cfg from './wia.config.js'
import pkg from './package.json' with {type: 'json'} // asset 报错

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename) // 不带 /

const env = process.env.NODE_ENV || 'development'
const isDev = env === 'development'

// const jsOpt = getJsOpt(isDev)
const jsOpt = getJsOpt(false)
const tsOpt = getTsOpt(isDev)

// console.log({jsOpt, tsOpt})

/**
 * @type {import('@rspack/cli').Configuration}
 */
export default {
  mode: 'development', // production development
  context: __dirname,
  entry: {
    index: './src/entry.js',
    // enzyme: './src/enzyme.js',
    // index: './src/index.tsx',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    publicPath: 'https://cos.wia.pub',
    // chunkLoadingGlobal: '__webpack_require__', // 指定保留全局变量名
    // globalObject: 'this', // 确保全局变量一致
  },
  devServer: {
    open: false, // 自动打开浏览器
    // static: path.resolve(__dirname, './dist'),
    static: './dist',
    port: cfg.local.port,
    server: 'http', // 'http' | 'https' | 'spdy'
  },
  optimization: {
    usedExports: false, // 关闭es6摇树 tree-shaking，
    chunkIds: 'named',
    moduleIds: 'named', // 保留名称，named production时需要 deterministic size natural
    // mangleExports: false, // 禁用导出压缩
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
    extensions: [
      '...',
      '.js',
      '.ts',
      '.cjs',
      '.mjs',
      '.tsx',
      '.jsx',
      '.json',
      '.css',
      '.svg',
      '.wasm',
    ],
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
            loader: 'builtin:swc-loader', // rspack 内置 swc，支持 env，标准swc不支持env
            options: jsOpt,
          },
        ],
      },
      {
        test: /\.html$/i,
        use: 'raw-loader',
      },
      {
        test: /\.css$/, // 匹配 .css 文件
        use: [
          'style-loader', // 将 CSS 插入到 <style> 标签
          {
            loader: 'css-loader', // 解析 CSS 文件
            options: {
              importLoaders: 1, // 确保 @import 的文件也走 css-loader
              // modules: true, // CSS 类名会被编译为一个唯一的哈希值，从而将样式局部化
              modules: {
                localIdentName: '[local]_[hash:base64:3]', // 默认 16位 hash
              },
            },
          },
        ],
      },
      {
        test: /\.less$/, // 匹配 .less 文件
        use: [
          'style-loader', // 将解析后的 CSS 插入到 <style> 标签
          {
            loader: 'css-loader', // 解析 .less 中的 CSS
            options: {
              importLoaders: 1, // 确保 @import 的文件也走 css-loader
              // modules: true, // CSS 类名会被编译为一个唯一的哈希值，从而将样式局部化
              modules: {
                localIdentName: '[local]_[hash:base64:3]', // 默认 16位 hash
              },
            },
          },
          {
            loader: 'less-loader', // 将 LESS 编译为 CSS
            options: {
              lessOptions: {
                strictMath: true, // 启用严格的数学运算
              },
            },
          },
        ],
      },
      // {
      //   test: /\.(less|css)$/i,
      //   use: [
      //     'style-loader',
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         // modules: true,
      //         modules: {
      //           localIdentName: '[local]_[hash:base64:3]', // 默认 16位 hash
      //         },
      //       },
      //     },
      //     'less-loader',
      //   ],
      // },
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
    // isDev ? new refreshPlugin() : null,
  ].filter(Boolean),
}

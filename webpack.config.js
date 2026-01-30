const path = require('path')
const webpack = require('webpack')
const {getJsOpt, getTsOpt} = require('./swc.config')
const pkg = require('./package.json')

const env = process.env.NODE_ENV || 'development'

module.exports = {
  mode: 'development', // production development
  // devtool: 'source-map', // 'inline-source-map', 'source-map' 单步跟踪调试时需要
  // devServer: {
  //   port: 8080, // 控制端口
  //   contentBase: './dist',
  // },
  optimization: {
    // usedExports: false, // 关闭摇树 tree-shaking，
    moduleIds: 'named', // 保留名称，named production时需要 deterministic size natural
    // sideEffects: true, // 检测 npm 包的 sideEffects 设置
  },
  watch: true, // gulp 不需要，单独运行时用，监控js 文件变化，变化后自动再次触发编译，以增量方式生成，速度快
  watchOptions: {
    aggregateTimeout: 600, // 防抖，多少毫秒后再次触发
    // poll: 1000, // 每秒检查一次
    ignored: ['**/test/**/*.js', '**/node_modules'], // 忽略监控文件
  },
  // profile: true,
  cache: true,
  entry: {index: './src/index.js'}, // gulp中定义
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    publicPath: 'https://cos.wia.pub',
  },
  resolve: {
    // options for resolving module requests
    // (does not apply to resolving to loaders)
    modules: ['node_modules', path.resolve(__dirname, '.')],
    // directories where to look for modules
    extensions: ['.js', '.ts', '.mjs', '.cjs', '.jsx', '.tsx', '.json', '.css', '.svg', '.wasm'],
    // fallback: {crypto: false},
    // extensions that are used
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs|cjs)$/,
        // use: 'babel-loader',
        use: [
          {
            loader: 'swc-loader',
            options: getJsOpt(false, false),
          },
        ],
      },
      {
        test: /\.html$/i,
        use: 'raw-loader',
      },
      {
        test: /\.svg$/,
        use: [{loader: 'svg-sprite-loader', options: {}}],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          'less-loader', // compiles Less to CSS
        ],
      },
      {
        test: /\.(ts|tsx)$/,
        // use: [
        //   {
        //     loader: 'ts-loader',
        //     options: {configFile: 'tsconfig.build.json'},
        //   },
        // ],
        // exclude: /\.test\.tsx$|\.stories\.tsx$|node_modules/, // 排除 文件及目录
        use: [
          {
            loader: 'swc-loader',
            options: getTsOpt(false, false),
          },
        ],
      },
    ],
  },
  plugins: [
    // 变量替换
    new webpack.DefinePlugin({
      __DEV__: !env.production,
      __VERSION__: JSON.stringify(pkg.version),
      __TEST__: JSON.stringify('false'),
    }),
  ],
}

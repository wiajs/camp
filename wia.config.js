/*
 * 项目配置文件，编译打包需要
 */
const cfg = {
  owner: 'nuoya',
  name: 'camp',
  ver: '1.1.2',
  theme: 'pc',

  master: 'master', // 'master', master-detail路由，master -> detail
  home: 'course/', // 不带hash，应用默认首页：page/index
  login: true, // 是否登录，包括微信网页或小程序静默登录、密码登录、手机验证登录
  bindMobile: false, // 绑定手机，如微信自动登录，需手机验证绑定用户手机

  appid: 7,
  sid: '6', // '11', 指定登录的哪个平台（不同网站、不同服务号等），用于区分不同平台用户
  file: ['index.*', 'page'], // 'img' 限定发布文件或目录，目录中不能有“.”，基于src
  exclude: [
    '*.json',
    '*.ts',
    'page/chall/ttt.*',
    'page/chall/math.js',
    'img/meal/fw',
    'img/meal/zhitu-des',
  ], // 排除file中的文件或目录，，目录中不能有“.”
  pubPath: 'pub', // 发布路径
  mode: 'local', // 运行模式，local：本地独立运行，一般用于调试，pub：wia 模式运行
  vite: false, // vite 调试模式，不使用webpack打包
  // 本地调试，mode 为 local时生效
  local: {
    debug: true, // 调试模式
    port: 3008,
    // !测试 token 写入本地存储便于调用后台接口，等于锁定该用户，生产或local发布务必删除，避免token泄露
    // 测试 token 的获取方法：浏览器通过 https://wia.pub 网站登录后F12,从本地存储中获取
    token: '',
    state: '', // 电脑模拟微信服务号入口
    // state: 'from=wxauth&to=join/edit&sid=2', // 电脑模拟微信服务号入口
    // state: 'from=pc&to=fee/edit&sid=1', // 调试模拟入口及sid，
    host: 'http://localhost:3008', // 本地调试
    cos: 'http://localhost:3008', // 本地资源
    api: 'https://test.lianlian.pub', // api接口
    // api: 'http://localhost:3009'; // 本地调试
    sinkHost: 'http://localhost:3008', // 本地调试
    sink: 'http://localhost:3008/sink/#!/nuoya/sink/play/', // 本地调试
    ws: 'wss://test.lianlian.pub', // websocket server 'ws://113.105.26.9:17249'
    vite: false, // vite 调试模式，不使用webpack打包
  },
  // 生产发布，mode 为 pub 时生效
  pub: {
    host: 'https://wia.pub', // 启动域名
    cos: 'https://cos.wia.pub',
    // api: 'https://api.wia.pub',
    api: 'https://test.lianlian.pub',
    // api: 'https://wia.pub',
    sinkHost: 'https://lianlian.pub/sink',
    sink: 'https://lianlian.pub/sink/#!/nuoya/sink/play/',
    ws: 'ws://113.105.26.9:17249',
    load: ['wiajs/wia.js?v=1.0.0'], // 加载依赖资源，启动器需配置，一般应用(非启动器)无需配置，
    // 本地调试wia库
    // cos: 'http://localhost:3009', // 资源主机
    // load: ['wia.js?v=1.0.0'], // 加载依赖资源
    press: true, // 压缩代码，压缩时自动删除代码中的debugger、console.log，如需发布后调试，可不压缩
  },
}

// module.exports.default = cfg
// module.exports = cfg
export default cfg

/*
 * 项目配置文件，编译打包需要
 */

const pkg = require('./package.json')

const cfg = {
  owner: pkg.author,
  name: pkg.name,
  ver: pkg.version,

  appid: 7,
  sid: '6', // '11', 指定登录的哪个平台（不同网站、不同服务号等），用于区分不同平台用户

  // 指定编译文件
  file: ['index.js', 'page'], // 打包的入口，文件或路径
  exclude: ['ui', 'tmp', 'doc', 'test', 'page.bak'], // 排除

  mode: 'local', // 打包代码， 是否压缩， 生产时需设置为 prod，调试 dev, 本地调试 local
  vite: false, // vite 调试模式，不使用webpack打包

  dev: {
    status: 1, // 调试模式
    port: 3003,
    token: '', // 测试token，发布时需删除！！！
    state: '', // 电脑模拟微信服务号入口
    // state: 'from=wxauth&to=join/edit&sid=2', // 电脑模拟微信服务号入口
    // state: 'from=pc&to=fee/edit&sid=1', // 调试模拟入口及sid，
  },
  // api: 'https://api.wia.pub';
  // api: 'http://localhost:3000'; // 本地调试
  // local: 'https://fin.wia.pub/wia', // 服务器调试
  local: 'http://localhost:3003', // 本地调试
  // local: 'http://192.168.0.23:3003', // 手机调试
  // local: 'http://192.168.0.104:3003', // 手机调试
  load: ['/nuoya/wia/wia.js?v=1.0.42', '/nuoya/mall/page.js?v=${ver}'], // 加载依赖资源
  // load: ['/wia.js?v=1.0.42', '/page.js?v=${ver}'], // 加载依赖资源
}

module.exports.default = cfg
module.exports = cfg

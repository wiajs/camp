/*
 * 应用配置文件，切勿配置敏感数据
 */
import cfg from '../../wia.config'

const {
  owner,
  name,
  ver,
  theme,
  appid,
  sid,
  file,
  exclude,
  mode,
  local,
  pub,
  master,
  home,
  login,
  bindMobile,
} = cfg

const app = {
  owner,
  name,
  ver,
  theme,
  appid,
  sid,
  file,
  exclude,
  mode,
  local,
  pub,

  master,
  home,
  login, // 是否登录，包括微信网页或小程序静默登录、密码登录、手机验证登录
  bindMobile, // 绑定手机，如微信自动登录，需手机验证绑定用户手机

  // 微信授权获取用户头像、昵称，默认打开自动授权，微信中打开页面，自动跳转到授权页面
  wx: {
    autoAuth: 3, // 三次
    url: 'https://open.weixin.qq.com/connect/oauth2/authorize',
    appid: 'wxec3dd59f1b556a2a',
    redirect: 'https://wia.pub/', // 注意最后的/符号，必须带
    scope: 'snsapi_userinfo', // snsapi_base 只有 snsapi_userinfo 可获得昵称、头像，其他接口关闭
    token: 'wx.token', // 微信auth后获取用户头像、昵称的token
    code: 'wx.code',
    lastCode: 'wx.lastCode',
  },

  token: 'token', // wia统一token
  docker: 'wia.docker',
  uri: 'wia.uri',
  // sid: 'nuoya.sid',
  state: 'wia.state',
  view: 'wia.view',
  email: 'wia.email',
  site: 'wia.site',
  auth: 'wia.auth',
  dept: 'wia.dept',
  userInfo: 'wia.userInfo',
  addrInfo: 'wia.addrInfo',
  hotCount: 20, // 热门分享一次获取数量
  imgWHR: 1.9, // 上传图片宽高比
  imgCompress: 0.3, // 图片压缩比
  nyService: 'https://cos.wia.pub/mall/img/public/', // 诺亚客服二维码
  loading: 'https://cos.wia.pub/mall/img/public/load.gif',
  nydl: 'https://app.nuoyadalu.com',
  listImg: 'imageView2/2/w/210/q/85',
  bannerImg: 'imageView2/2/w/720/h/720/q/85',
  wImg: 'imageView2/2/w/720/q/85',
  shopImg: 'imageView2/2/w/720/h/165/q/85',
  isWebp: false,
}

export default app

import $ from '@wiajs/dom'
import Router from '@wiajs/router'
// import Router from './router'
import {log as Log} from '@wiajs/util'
import App from './app'
import {getUser, getToken} from './api/user'
import * as store from './util/store'
import pages from './pages' // 请保留，用于自动引入page模块调试打包

import cfg from './config/app'
import api from './api'

const log = Log({m: 'index'})

const vite = false // vite or  webpack

// 应用必备参数
const def = {
  owner: cfg.owner, // 所有者
  name: cfg.name, // 应用名称
  ver: cfg.ver, // 应用版本
  theme: cfg.theme || 'auto', // 主题：auto ios md pc
}

/**
 * 应用类，由router动态加载后创建实例
 * 页面实例通过 $.app 引用应用实例，获得应用配置参数，如 api等
 * 跳转应用页面时，会检查当前应用是否与页面匹配，不匹配，自动切换创建应用，确保页面与当前应用一致
 */
export default class WiaApp extends App {
  /**
   * 应用构造函数，由 Router 创建应用实例
   * @param {*} opts
   */
  constructor(opts) {
    const opt = {...def, ...opts}
    console.log('WiaApp constructor:', {opt})
    super(opt)
    const {owner, name, ver, theme} = opt
    this.owner = owner // 所有者
    this.name = name // 应用名称
    this.ver = ver // 应用版本
    this.theme = theme // 主题
    this.opt = opt
    this.cfg = cfg // 应用设置
    this.api = api
  }

  /**
   * 应用被加载时触发
   */
  load() {
    log('wia app load')
  }

  /**
   * 应用创建就绪时触发，整个生命周期只触发一次
   */
  ready() {
    log('wia app ready...')
  }

  /**
   * 应用切换到前台显示事件，可多次触发
   * 路由切换应用时，触发该事件
   * 首页加载，不触发该事件
   * @param {*} hash
   * @param {*} param
   */
  show(hash, param) {
    // super.show(url, data);
    console.log('app show:', {hash, param})
    main(hash, param)
  }

  /**
   * 应用切换到后台
   */
  hide() {
    super.hide()
    console.log('app hide.')
  }
}

// @ts-ignore
pages['./src/index'] = WiaApp // 传递给route，用于vite模式创建应用实例

/**
 * 应用启动/切换时，将路由控制交给应用处理，应用需处理hash加载
 * 如缺省路由、master/detail 路由等
 * 应用在当前运行时，通过 hash 直接加载页面，不再通过当前函数
 * @param {*} hash hash
 * @param {*} param 参数
 *  state 微信oAuth通过state传参数
 *  from:从哪里启动 to:去哪里 sid:site id，appid：app id
 */
async function main(hash, param) {
  try {
    // 微信菜单进入，需在state中配置一下四个参数
    const {code} = param
    let {state} = param
    // 测试 token，生产环境务必删除
    if (cfg.debug.status) {
      if (cfg.debug.token) store.set(cfg.token, cfg.debug.token)
      if (!state && cfg.debug.state) state = cfg.debug.state
    }

    console.log('main', {hash, param})

    let v = {}
    // 微信网页授权参数在state中传递
    if (state) {
      const ps = state.split('&')
      ps.forEach(p => {
        const arr = p.split('=')
        if (!v) v = {}
        // eslint-disable-next-line prefer-destructuring
        v[arr[0]] = arr[1]
      })
    }

    const {from, to} = v
    let {sid, appid} = v
    if (sid) sid = Number.parseInt(sid)
    else sid = cfg.sid
    if (appid) appid = Number.parseInt(appid)
    else appid = cfg.appid

    // 微信授权打开，通过微信code获取用户信息
    // 优先本地缓存，缓存默认 30天过期
    const token = await getToken(sid, code)

    console.log('main', {appid, sid, from, to, token})

    // sid 保存到去全局
    if (sid) $.app.sid = sid
    if (appid) $.app.id = appid
    // 用户身份已确认（微信图像和昵称）
    // 如需手机验证码确认，在需要时调用login登录页面！！！
    if (token) {
      const u = $.app.user
      // 没有手机，则需使用手机短信验证码绑定手机
      // 已经绑定手机无需再次绑定
      if (cfg.bindMobile && !u?.mobile)
        $.go('login', {
          hash,
          from,
          to,
          param,
        })
      // 已经绑定手机无需再次绑定
      // 指定去向优先，微信菜单、授权页面通过to指定去向
      else if (to) $.go(to, param)
      // 数据链融资 pc 主从双网页
      // else if (hash.match('/class/|/exam/|/mine/|/msg/|/dist'))
      // 先加载master页面，由master加载detail页面 $.go('pay/index');
      // $.go('master', {path: hash, param})
      else if (hash) $.go('master', {to: hash, param})
      // $.go(hash, param)
      // 打开指定 hash
      // else $.go('index', param) // 默认加载首页
      else $.go('master', {to: 'course/index'})
    } else if ($.device.wx && cfg.wx.autoAuth) wxAuth()
    // 非微信环境，手机验证登录进入
    else if (cfg.login) $.go('login')
    // 无需验证登录，不识别用户身份，匿名访问
    else if (hash) $.go(hash, param)
    else $.go('index') // 默认加载首页
  } catch (e) {
    console.error(`main exp:${e.message}`)
  }
}

/**
 * 微信授权获取用户头像、昵称，获取后保存到数据库，并产生token保存单客户端本地
 * 如处理不当，微信中会反复跳转页面
 */
function wxAuth() {
  const k = 'wxAuthCnt'
  let cnt = store.get(k) ?? 0
  if (cnt === '') cnt = 0
  cnt = Number.parseInt(cnt)
  cnt++
  store.set(k, cnt, 1) // 1分钟后失效，重新开始计数

  if (cnt <= cfg.wx.autoAuth) {
    console.log(`wxAuth cnt:${cnt} max:${cfg.wx.autoAuth}`)

    let state = $.urlParam('state')
    if (!state) state = encodeURIComponent(`from=wx&to=index&sid=${cfg.sid}`)
    const href =
      `${cfg.wx.url}?appid=${cfg.wx.appid}&redirect_uri=${cfg.wx.redirect}&response_type=code&scope=${cfg.wx.scope}` +
      `&state=${state}#wechat_redirect`
    window.location.href = href
  }
}

/**
 * 以下为wia应用启动代码，需保留，用于加载当前应用及其他wia应用
 * 创建的路由器为所有wia应用全局共用
 * 所有应用、页面均有路由器下载、加载、运行
 * wia 属于spa应用，只有一个页面，启动应用运行时触发 该函数
 * 启动后，跳转其他wia应用时，通过动态加载index代码，不再加载index页面，不会触发该函数
 * index.html 页面仅作为wia应用容器，不能放应用相关内容
 */
// @ts-ignore
$.ready(() => {
  try {
    // alert(`ver:${cfg.ver}`);
    log(`wia app(ver:${cfg.ver}) start...`)

    // 所有应用共享一个路由，每个应用都可能作为入口，需创建路由
    // 路由创建 应用
    // 创建带版本号的路由器，通过版本号控制页面文件版本
    const router = new Router({
      // app,
      el: '#wia-app',
      view: 'wia-view',
      cos: cfg.cos, // 托管网址
      local: cfg.local, // 调式模式打包路径
      ver: cfg.ver,
      mode: cfg.mode, // 本地调试时，需设置为 local，生产发布时需设置为 pub
      pages: vite ? pages : undefined, // 用于 vite 本地调试
    })
  } catch (ex) {
    console.log(`ready exp:${ex.message}`)
  }
})

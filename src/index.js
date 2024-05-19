import $ from '@wiajs/dom'
// import {$} from '@wiajs/dom';
import Router from '@wiajs/router'
// import Router from './router'
import {log as Log} from '@wiajs/util'
import App from './app'
import {getUser, getToken} from './api/user'
import * as store from './util/store'
import pages from './pages' // 请保留，用于自动引入page模块打包

import cfg from './config/app'
import api from './api'

const log = Log({m: 'index'})

const vite = false // vite or  webpack

// 创建初始应用，所有页面均通过初始应用加载
export default class WiaApp extends App {
  constructor(opts) {
    opts = opts || {}
    // super(opt.app);
    super(opts)
    console.log('app constructor:', {opt: opts})
    this.cfg = cfg
    this.api = api
  }

  /**
   * 应用被加载时触发
   * @param {*} param
   */
  load() {
    log('wia app load')
  }

  /**
   * 应用创建就绪时触发，整个生命周期只触发一次
   * @param {*} param
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

pages['./src/index'] = WiaApp

/**
 * wia 独立运行时，页面就绪触发，其他wia应用跳转不会触发
 * 所有wia 共享一个全局路由器
 */
$.ready(() => {
  try {
    // alert(`ver:${cfg.ver}`);
    log(`wia app(${cfg.ver}) start...`)

    // 所有应用共享一个路由，每个应用都可能作为入口，需创建路由
    // 路由创建 应用
    // 创建带版本号的路由器，通过版本号控制页面文件版本
    const router = new Router({
      // app,
      el: '#wia-app',
      view: 'wia-view',
      theme: 'pc', // 主题：auto ios md pc
      owner: cfg.owner,
      name: cfg.name,
      cos: cfg.cos,
      local: cfg.local,
      ver: cfg.ver,
      mode: cfg.mode, // 本地调试时，需设置为 local，生产发布时需设置为 pub
      pages: vite ? pages : undefined, // 用于 vite 本地调试
    })
  } catch (ex) {
    console.log(`ready exp:${ex.message}`)
  }
})

/**
 * wia应用容器显示时调用
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
      else if (hash) $.go('master', {path: hash, param})
      // $.go(hash, param)
      // 打开指定 hash
      // else $.go('index', param) // 默认加载首页
      else $.go('master', {path: 'chall/index'})
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

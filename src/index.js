import $ from '@wiajs/dom'
// import Router from '@wiajs/router'
import Router from './router'
import {log as Log} from '@wiajs/util'
import App from './app'
import {getUser, getToken} from './api/user'
import * as store from './util/store'
import pages from './pages' // 请保留，用于自动引入page模块调试打包

import cfg from './config/app'
import api from './api'

const log = Log({m: 'index'})

const {vite} = cfg.local // debug use vite or rspack

// 应用必备参数
const def = {
  owner: cfg.owner, // 所有者
  name: cfg.name, // 应用名称
  ver: cfg.ver, // 应用版本
  theme: cfg.theme || 'auto', // 主题：auto ios md pc
  login: cfg.login, // 是否登录，包括微信网页或小程序静默登录、密码登录、手机验证登录
  bindMobile: cfg.bindMobile, // 绑定手机，如微信自动登录，需手机验证绑定用户手机
  master: cfg.master, // master-detail路由，master -> detail
  home: cfg.home, // 不带hash，应用默认首页：page/index
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
    console.log('new Camp', {opt})
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
   * @returns {Promise<{hash:string, param:*}>}
   */
  show(hash, param) {
    // super.show(url, data);
    console.log('app show:', {hash, param})
    return show(hash, param)
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
 * 应用启动/切换时，触发 show方法后启动路由
 * 路由已处理hash、state等，此方法中不可有路由
 * master/detail，请设置 master参数
 * 默认首页，请设置 home
 * 可通过修改 返回值 作为后续路由函数的参数(hash, param)
 * hash为路由目的路径
 * param中的state可覆盖hash，如：state='from=xx&to=xx&sid=1&appid=6'
 * @param {string} hash hash
 * @param {*} param 参数
 *  state 微信oAuth通过state传参数
 *  from:从哪里启动 to:去哪里 sid:site id，appid：app id
 * @returns {Promise<{hash:string, param:*}>}
 */
async function show(hash, param) {
  const R = {hash, param}
  try {
    if (!R.param) R.param = {}

    console.log('show', {hash, param})
    const {state} = param
    // !测试 token 写入本地存储便于调用后台接口，等于锁定该用户，生产或local发布务必删除，避免token泄露
    // 测试 token 的获取方法：浏览器通过 https://wia.pub 网站登录后F12,从本地存储中获取
    if (cfg.mode === 'local' && cfg.local.debug) {
      if (cfg.local.token) store.set(cfg.token, cfg.local.token, 432_00, true)
      // 模拟手机微信，配置 state 用于测试
      if (!state && cfg.local.state) R.param.state = cfg.local.state
    }

    R.param.to = 'course/' // 默认进入课程列表
  } catch (e) {
    console.error(`show exp:${e.message}`)
  }
  return R
}

/**
 * 创建的路由器为所有wia应用全局共用，用于加载当前应用及其他wia应用
 * 应用启动代码，本地调试时需要，发布wia时，不会执行
 * 所有应用、页面均有路由器下载、加载、运行
 * wia 属于spa应用，只有一个页面，启动应用运行时触发 该函数
 * 启动后，跳转其他wia应用时，通过动态加载index代码，不再加载index页面，不会触发该函数
 * index.html 页面仅作为wia应用容器，不能放应用相关内容
 */
if (cfg.mode === 'local') {
  // @ts-ignore
  $.ready(() => {
    try {
      // alert(`ver:${cfg.ver}`);
      const {ver, mode, owner, name} = cfg
      // @ts-ignore
      const cos = cfg[cfg.mode].cos

      log({owner, name, ver, mode, cos}, 'start wia...')

      // 所有应用共享一个路由，每个应用都可能作为入口，需创建路由
      // 路由创建 应用
      // 创建带版本号的路由器，通过版本号控制页面文件版本
      const router = new Router({
        // app,
        el: '#wia-app',
        view: 'wia-view',
        cos, // 托管网址
        ver,
        mode, // 本地调试时，需设置为 local，生产发布时需设置为 pub
        // pages: vite ? pages : undefined, // 用于 vite 本地调试
        // 可选传入，传则自动加载 page/index，该页面需确保存在！！！
        owner,
        name,
      })
    } catch (ex) {
      console.log(`ready exp:${ex.message}`)
    }
  })
}

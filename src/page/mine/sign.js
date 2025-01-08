// @ts-nocheck
import {Page} from '@wiajs/core'
import {log as Log} from '@wiajs/util'
import {delay} from '../../util/tool'

/** @type {*} */
const {$} = window

/** @typedef {{app?:*, name?: string, title?: string}} OptType */

/** @type {OptType} */
const def = {
  app: $.app,
  name: 'sign',
  title: '签名',
}

const log = Log({m: def.name}) // 创建模块日志实例

// 全局数据
/** @type {*} */
let _ = null // current page

/** @type {Signature} */
let _sign

export default class Sign extends Page {
  /** @param {OptType} opts */
  constructor(opts = {}) {
    /** {OptType} */
    const opt = {...def, ...opts}
    super(opt.app, opt.name, opt.title)
  }

  load(param) {
    super.load(param)
    log({param}, 'load')
  }

  /**
   * 在已就绪的视图上绑定事件
   * @param {*} v
   * @param {*} param
   */
  ready(v, param) {
    super.ready(v, param)
    _ = v
    init(this)
    bind(this)
  }

  /**
   * 显示页面
   * @param {*} v
   * @param {*} param
   */
  show(v, param) {
    super.show(v, param)
    show()
  }

  /**
   * 参数变化
   * @param {*} v
   * @param {*} param
   * @param {*} lastParam
   */
  change(v, param, lastParam) {
    // super.show(v, param);
    console.log(`${def.name} change:`, {v, param, lastParam})
  }

  back(v, param) {
    super.back(v, param)
  }

  hide(v) {
    console.log(`${def.name} hide:`, {v})
  }
}

/**
 *
 * @param {*} pg
 */
function init(pg) {
  loadQrCode()
  qrcode()
}

/**
 *
 * @param {*} pg
 */
function bind(pg) {
  _.btnQrcode.click(() => qrcode())
}

/**
 * 生成二维码
 */
async function qrcode() {
  const u = $.app.user
  if (!u.studentid) $.go('mine/user')

  if (!(await qred(10))) return

  window.QRCode.toCanvas(
    _.cvPad.dom,
    `https://lianlian.pub/sign/#!/nuoya/sign/mine/sign?id=${u.studentid}`,
    function (error) {
      if (error) log.error(error)
      log('success!')
    }
  )
}

async function show() {
  // _.class('header').setViews(_u)
}

/**
 * 页面加载的QR是否就绪
 * @param {number} tm 单位 秒
 * @returns
 */
async function qred(tm) {
  let R = false
  try {
    const start = Date.now()
    while (Date.now() - start < tm * 1000) {
      // @ts-ignore
      if (window.QRCode?.toCanvas) {
        log({wait: Date.now() - start}, 'qred')
        R = true
        break
      } else await delay(200)
    }
  } catch (e) {
    log.err(e, 'qred')
  }

  return R
}

/**
 * 向页面添加qrcode
 */
function loadQrCode() {
  const sc1 = document.createElement('script') // 创建一个script标签
  sc1.type = 'text/javascript'
  sc1.src = 'https://cdn.bootcdn.net/ajax/libs/qrcode/1.5.1/qrcode.min.js'
  $('body').append(sc1)
}

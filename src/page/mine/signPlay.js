// @ts-nocheck
import {Page} from '@wiajs/core'
import {log as Log} from '@wiajs/util'
import {delay} from '../../util/tool'
import Signature from '../../lib/signature'
import Api from '../../util/api'
import {height, width} from '@wiajs/dom'

/** @type {*} */
const {$} = window

/** @typedef {{app?:*, name?: string, title?: string}} OptType */

/** @type {OptType} */
const def = {
  app: $.app,
  name: 'signPlay',
  title: '签名回放',
}

const log = Log({m: def.name}) // 创建模块日志实例

// 全局数据
/** @type {*} */
let _ = null // current page

/** @type {*} */
let _api

/** @type {Signature} */
let _sign
/** @type {Signature} */
let _sign2

export default class SignPlay extends Page {
  /** @param {OptType} opts */
  constructor(opts = {}) {
    /** {OptType} */
    const opt = {...def, ...opts}
    super(opt.app, opt.name, opt.title)
    _api = new Api('camp/student')
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
  const opts = {
    // width: window.innerWidth - 100,
    // height: window.innerHeight - 50,
    // width: Math.min(window.innerWidth, 1000),
    // height: 600,
    height: 617,
    width: 275,
    minWidth: 1, // 笔迹宽度
    maxWidth: 4, // 笔迹宽度
    // color: "#1890ff",
    bgColor: '#f6f6f6',
    track: true,
  }

  _sign = new Signature(_.cvPad.dom, opts)
  const opts2 = {
    // width: window.innerWidth - 100,
    // height: window.innerHeight - 50,
    // width: Math.min(window.innerWidth, 1000),
    // height: 600,
    height: 275,
    width: 617,
    minWidth: 1, // 笔迹宽度
    maxWidth: 4, // 笔迹宽度
    // color: "#1890ff",
    bgColor: '#f6f6f6',
    track: true,
  }
  _sign2 = new Signature(_.cvPad2.dom, opts2)
}

/**
 *
 * @param {*} pg
 */
function bind(pg) {
  _.btnPlay.click(() => play(1))
  _.btnView.click(() => view())
}

function view() {
  const canvas = _sign.getRotateCanvas(-90)
  const pngUrl = canvas.toDataURL()
  _.imgPad.dom.src = pngUrl
}

/**
 * 播放绘制路径
 * @param { number } speed - 播放速度
 * 如果传入的speed为0，应当直接同步绘制，不需要定时器
 */
async function play(speed = 10) {
  try {
    const q = {sign: {$exists: true}}
    const rs = await _api.find({q, field: 'sign', limit: 20})
    if (rs?.data?.length) {
      // _sign.play(speed, rs.data[12].sign)
      _sign2.play(speed, rs.data[12].sign)
    }
    // _sign.play(speed)
  } catch (e) {
    log.err(e, 'play')
  }
}

async function show() {
  // _.class('header').setViews(_u)
}

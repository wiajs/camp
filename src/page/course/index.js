/** @jsxImportSource @wiajs/core */

import {Page} from '@wiajs/core'
import {log as Log} from '@wiajs/util'
import Navbar from '../../part/navbar'
import * as store from '../../util/store'
import Api from '../../util/api'

/** @type {*} */
const {$} = window

/** @typedef {{app?:*, name?: string, title?: string}} OptType */

/** @type {OptType} */
const def = {
  app: $.app,
  name: 'course',
  title: '课程大纲',
}

const log = Log({m: def.name}) // 创建模块日志实例

// 全局数据
/** @type {*} */
let _
/** @type {*} */
const _from = {}

/** @type {*} */
let _cs // 课程
/**
 * @type {*}
 */
let _api

export default class Index extends Page {
  /** @type {OptType} opts */
  constructor(opts = {}) {
    /** {OptType} */
    const opt = {...def, ...opts}
    super(opt.app, opt.name, opt.title)
    _api = new Api('camp/quote')
  }

  /** @param {*} param */
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
    log({v, param, id: this.id}, 'ready')
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
    log({v, param}, 'show')
    _ = v
    $.assign(_from, param)
    show()
  }

  /**
   * url hash 参数变化
   * @param {*} v
   * @param {*} param 新参数
   * @param {*} lastParam 旧参数
   */
  change(v, param, lastParam) {
    super.change(v, param, lastParam)
    log({v, param, lastParam}, 'change')
  }

  /**
   * 返回
   * @param {*} v
   * @param {*} param
   */
  back(v, param) {
    super.back(v, param)
    log({v, param}, 'hide')
    show()
  }

  /** @param {*} v */
  hide(v) {
    log({v}, 'hide')
  }
}

/**
 * 初始化
 * @param {*} pg
 */
async function init(pg) {
  try {
    const nav = new Navbar(pg, {
      el: _.class('navbar'),
      // active: 'btnHome',
    })
  } catch (e) {
    log.err(e, 'init')
  }
}

/**
 * 事件绑定
 * @param {*} pg
 */
function bind(pg) {
  try {
    // @ts-ignore
    _.btnMap.click(async ev => {
      const cat = $(ev.target).upper('.link-btn').data('cat')
      if (cat < 4 || cat == 16) {
        store.set('courseCat', cat) // 本地保存当前课程类别
        $.go('course/list', {cat})
      } else alert('暂未上线，将于近期上线，请选择【1、2、3】，谢谢！')
    })
  } catch (e) {
    log.err(e, 'bind')
  }
}

async function show() {
  const u = $.app.user
  if (!u.studentid) $.go('mine/user')
  const q = [{$match: {lang: 2}}, {$project: {quote: 1, author: 1, _id: 0}}, {$sample: {size: 1}}]
  const rs = await _api.aggregate({q})
  log({rs}, 'show')
  if (rs?.data?.length) {
    _.txQuote.html(rs.data[0].quote)
    _.txAuthor.html(rs.data[0].author)
  }
}

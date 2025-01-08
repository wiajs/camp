/** @jsxImportSource @wiajs/core */
import {Page} from '@wiajs/core'
import {log as Log} from '@wiajs/util'
import Navbar from '../../part/navbar'
import {post} from '../../util/tool'
import * as store from '../../util/store'
import Api from '../../util/api'
import api from '../../api'

/** @type {*} */
const {$} = window

/** @typedef {{app?:*, name?: string, title?: string}} OptType */

/** @type {OptType} */
const def = {
  app: $.app,
  name: 'list',
  title: '课程列表',
}

const log = Log({m: def.name}) // 创建模块日志实例

// 全局数据
/** @type {*} */
let _
/** @type {*} */
const _from = {}

/** @type {*} */
let _cs = {} // 课程
/**
 * @type {*}
 */
let _api

export default class List extends Page {
  /** @type {OptType} opts */
  constructor(opts = {}) {
    /** {OptType} */
    const opt = {...def, ...opts}
    super(opt.app, opt.name, opt.title)
    _api = new Api('camp/course')
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
    _.course.click(ev => {
      const el = $(ev.target).upper('.lies')
      if (el) {
        const challid = el.data('challid')
        const courseid = el.data('courseid')

        if (challid && courseid) {
          // 保存课程到本地
          if (_cs[courseid]) store.set('course', _cs[courseid])
          store.set('courseid', courseid)
          store.set('challid', challid)
          $.go('chall/exam', {challid})
        }
      }
    })
  } catch (e) {
    log.err(e, 'bind')
  }
}

/**
 * 按指定分类显示课程列表
 */
async function show() {
  try {
    // 课程分类
    let {cat} = _from
    if (!cat) cat = store.get('courseCat')
    if (!cat) $.go('course/index')

    if (cat) {
      _.course.html('')

      const u = $.app.user
      if (!u.studentid) $.go('mine/user')
      else {
        let cs = await _api.find({q: {cat}, limit: 100, sort: 'order', field: '-_id -__v'})
        if (cs.data) cs = cs.data

        if (cs?.length) {
          _.course.prepend('<span class="course_title">课程</span>')
          // eslint-disable-next-line no-restricted-syntax
          for (const c of cs) {
            const {id} = c
            // const r = await _api.get({q: {id}})
            _cs[id] = c
            await loadCourse(c, u.studentid)
          }
        }
      }
    }
  } catch (e) {
    log.err(e, 'show')
  }
}

/**
 * 加载课程明细
 * @param {*} r -  课程
 * @param {number} stuid - 学生id
 * @param {number} [count] - 完成数量
 */
async function loadCourse(r, stuid) {
  const {challenge: chs, id} = r

  /** @type {number[]} */
  const pas = (await getPassed(stuid, id)) ?? [] // 过关
  const count = pas?.length ?? 0

  // @ts-ignore
  const detail = chs.map(ch => {
    const pass = pas.includes(ch.id)
    return (
      <div class='list lies' data-challid={ch.id} data-courseid={id}>
        <ul>
          <li>
            <div class='item-content'>
              <div class='item-media'>
                <label class='checkbox'>
                  <div class='icon iconfont' style='color: #00ff00;'>
                    {pass ? '&#xe664;' : ''}
                  </div>
                </label>
              </div>
              <div class='item-inner'>
                <div class='item-title'>{ch.title}</div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    )
  })
  const el = (
    <div class='container' data-courseid={id}>
      <span class='title'>{r.title}</span>
      <p>{r.describe}</p>
      <div class='list list-strong list-dividers-ios inset-md accordion-list'>
        <ul>
          <li class='accordion-item'>
            <a class='item-link item-content'>
              <div class='item-inner'>
                <div class='item-title'>课程明细</div>
                <label class='item-checkbox item-checkbox-icon-start item-content'>
                  <p class='ps'>
                    {String(count)}/{chs.length}
                  </p>
                </label>
              </div>
            </a>
            <div class='accordion-item-content'>{detail}</div>
          </li>
        </ul>
      </div>
    </div>
  )

  _.class('course').append(el)
}

/**
 * 获取已过关挑战id
 * @param {number} studentid
 * @param {number} courseid
 * @return {Promise<number[]>}
 */
async function getPassed(studentid, courseid) {
  let R
  try {
    const rs = await new Api('camp/exam').find({
      q: {studentid, courseid, passed: true},
      limit: 200,
      sort: 'addTime',
      field: 'challid',
    })
    log({rs}, 'getPassed')

    if (rs.data) R = rs.data.map(d => d.challid)
  } catch (e) {
    log.err(e, 'getPassed')
  }
  return R
}

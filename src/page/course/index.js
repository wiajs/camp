/** @jsx jsx */
import {Page, jsx} from '@wiajs/core'
import {log as Log} from '@wiajs/util'
import Navbar from '../../part/navbar'
import {post, promisify} from '../../util/tool'
import Api from '../../util/api'

/** @type {*} */
const {$} = window

/** @typedef {{app?:*, name?: string, title?: string}} OptType */

/** @type {OptType} */
const def = {
  app: $.app,
  name: 'course',
  title: '课程',
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
/**
 * @type {{data:Array<any>,limit:number,skip:number,total:number}} userCoures
 */
let userCoures
export default class Index extends Page {
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
    bind()
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

    const u = $.app.user
    if (!u.studentid) $.go('mine/user')
    else getCoures()
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
    getCoures()
    _.course.html('')
    init()
  }

  /** @param {*} v */
  hide(v) {
    log({v}, 'hide')
  }
}

/**
 * 初始化
 * @param {Page} pg
 */
async function init(pg) {
  try {
    const nav = new Navbar(pg, {
      el: _.class('navbar'),
      // active: 'btnHome',
    })

    const u = $.app.user
    const stu = await new Api('camp/student').get({q: {id: u.studentid}})
    if (stu?.course?.length) {
      // _.class('coures').html().remove();
      _.class('coures').prepend('<span class="course_title">课程</span>')
      // eslint-disable-next-line no-restricted-syntax
      for (const c of stu.course) {
        const {id, count} = c

        const r = await _api.get({q: {id}})
        console.log(r)
        if (r) loadCourse(r, count)
      }
    }
  } catch (e) {
    log.err(e, 'init')
  }
}

function bind() {
  try {
    // @ts-ignore
    _.course.click(ev => {
      const input = $(ev.target).closest('.accordion-list').siblings('.title').text()
      let type = ''
      let couresId
      switch (input) {
        case 'CSS基础':
          couresId = 1
          type = 'html'
          break
        case 'flexbox布局':
          couresId = 2
          type = 'html'
          break
        case 'HTML5基础':
          couresId = 5
          type = 'html'
          break
        case 'JavaScript':
          couresId = 4
          type = 'javascript'
          break
        default:
          type = 'html'
          break
      }
      localStorage.setItem('coures', JSON.stringify({type, couresTitle: input, couresId}))
      const id = $(ev.target).upper('.lies').data('id')
      if (id) $.go('chall/exam', {challid: id})
    })
  } catch (e) {
    log.err(e, 'bind')
  }
}

/**
 * 加载课程明细
 * @param {*} r -  课程记录
 * @param {*} count - 完成数量
 */
function loadCourse(r, count) {
  const {challenge: cs, id} = r
  if (!count) count = 0
  // @ts-ignore
  const detail = cs.map(c => {
    let falg = userCoures.data.filter(r => (r.challid == c.id ? {id: r.challid} : false))
    return (
      <div class='list lies' data-id={c.id}>
        <ul>
          <li>
            <div class='item-content'>
              <div class='item-media'>
                <label class='checkbox'>
                  <div class='icon iconfont' style='color: #00ff00;'>
                    {falg.length ? '&#xe664;' : ''}
                  </div>
                </label>
              </div>
              <div class='item-inner'>
                <div class='item-title'>{c.title}</div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    )
  })
  const el = (
    <div class='container' data-id={id}>
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
                    {String(count)}/{cs.length}
                  </p>
                </label>
              </div>
            </a>
            <div class='accordion-item-content'>{detail.join('')}</div>
          </li>
        </ul>
      </div>
    </div>
  )

  _.class('course').append(el)
}

async function getCoures() {
  userCoures = await new Api('camp/exam').find({
    limit: 150,
    sort: '+addTime',
    q: {studentid: $.app.user.studentid, passed: true},
    field: 'challid',
  })
  console.log(userCoures)
}

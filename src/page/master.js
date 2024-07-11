/**
 * master-detail's master
 */
import {Page} from '@wiajs/core'
import Leftbar from '../part/leftbar'
import {promisify, post} from '../util/tool'

// 菜单
const _data = [
  {
    p: ['&#xe655;', '编程挑战'],
    c: ['我的课程', '我的挑战'],
    a: ['course/index', 'chall/exam'],
  },
  {
    p: ['&#xe669;', '通信'],
    c: ['消息', '通知', '邮件'],
    a: ['msg/chat', 'msg/chat', 'msg/chat'],
  },
  // {
  //   p: ['&#xeb94;', '结算管理'],
  //   c: ['结算列表', '待清结算', '已清结算'],
  //   a: ['pay/index', 'pay/index?status=0', 'pay/index?status=1'],
  // },
  // {
  //   p: ['&#xe8bf;', '清分管理'],
  //   c: ['清分列表', '清分提交'],
  //   a: ['dist/index', '/dist/apply'],
  // },
  {
    p: ['&#xe608;', '我的'],
    // c: ['我的信息', '我的设置'],
    // a: ['mine/user', 'mine/index'],
    c: ['我的信息'],
    a: ['mine/user'],
  },
]

const def = {
  active: {p: '首页'},
}

const _name = 'master'
const _title = ''

// 全局数据
let _from = {}
let _

export default class Master extends Page {
  /**
   *
   * @param {*} page 页面实例
   * @param {*} opt 选项，激活名称
   */
  constructor(opt) {
    opt = opt || {}
    super(opt.app || $.app, opt.name || _name, opt.title || _title)
  }

  load(param) {
    super.load(param)
    console.log(`${_name} load:`, {param})
  }

  // 在已就绪的视图上绑定事件
  ready(v, param) {
    super.ready(v, param)
    _ = v
    _from = param

    init.bind(this)()
    bind()
  }

  show(v, param) {
    super.show(v, param)
    $.assign(_from, param)
    if (_from.path) $.go(_from.path, _from.param)
    initRouter()
  }

  back(v, param) {
    super.back(v, param)
    console.log(`${_name} back:`, {pg: v, param})
  }

  hide(v) {
    console.log(`${_name} hide:`, {pg: v})
  }
}

function init() {
  // 左菜单
  const leftbar = new Leftbar(this, {
    el: _.name('leftMenu'),
    active: _from?.path || 'exam/index', // {p: '贷款管理', c: '贷款列表'},
    data: _data,
  })
}

function bind() {}

function initRouter() {
  const u = $.app.user
  if (!u.studentid) $.go('mine/user')
  else $.go('course/index')
}

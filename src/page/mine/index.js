// @ts-nocheck
import {Page} from '@wiajs/core'
import Toolbar from '../../part/toolbar'


const _name = 'index'
const _title = '我的'

// 全局数据
const _from = {}
let _

const _u = {
  avatar:
    'http://thirdwx.qlogo.cn/mmopen/x4icnictNGicLZHY4p6crbX6CpB2kibWicYAgmkhPUHvJ279icL0LMxJxFJU6Wouc9gqia54djlHvF0ROicJoKNH2QOxVp7ic7mibq9Otw/132',
  name: '喻华锋',
  tag: ['管理员', '总经理'],
  stats: {单据: 12, 费用: 2600, 审批: 6, 报销: 3600},
}

export default class Mine extends Page {
  constructor(opt) {
    opt = opt || {}
    super(opt.app || $.app, opt.name || _name, opt.title || _title)
    console.log(`${_name} constructor:`, {opt})
  }

  load(param) {
    super.load(param)
    console.log(`${_name} load:`, {param})
  }

  // 在已就绪的视图上绑定事件
  ready(v, param, bk) {
    super.ready(v, param, bk)
    _ = v
    const toolbar = new Toolbar(this, {
      el: _.class('toolbar-bottom'),
      active: 'btnMine',
    })

    bind()
  }

  show(v, param) {
    super.show(v, param)
    $.assign(_from, param)
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
    console.log(`${_name} change:`, {v, param, lastParam})
  }

  back(v, param) {
    super.back(v, param)
  }

  hide(v) {
    console.log(`${_name} hide:`, {v})
  }
}

function bind() {
  _.register.click(() => {
    $.go('./user')
  })
}

async function show() {
  _.class('header').setViews(_u)
}



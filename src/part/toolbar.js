/**
 * 应用底部菜单
 */
import {Event} from '@wiajs/core'

// webpack
// const _html = require('./toolbar.html').default;
import _html from './toolbar.html'
// vite
// import _html from './toolbar.html?raw'; // eslint-disable-line

const def = {
  active: 'btnHome',
}

export default class Toolbar extends Event {
  /**
   *
   * @param {*} page 页面实例
   * @param {*} opts 参数，el容器，激活名称
   */
  constructor(page, opts) {
    super(opts, [page])
    this.page = page
    this.opt = {...def, ...opts}
    this.render(this.opt.el)
  }

  render(el) {
    el.html(_html)
    el.bindName()
    el.name(this.opt.active).addClass('tab-link-active', true)
    this.bind(el)
  }

  bind(el) {
    try {
      const _n = el.n

      _n.btnHome.click(e => {
        $.go('index')
      })
      _n.btnFee.click(e => {
        $.go('fee/', {import: false})
      })
      _n.btnApprove.click(e => {
        $.go('approve/')
      })
      _n.btnForm.click(e => {
        $.go('form/')
      })

      _n.btnMine.click(e => {
        $.go('mine/')
      })

      this.page.on('show', () => {
        el.name(this.opt.active).addClass('tab-link-active', true)
      })
      this.page.on('back', () => {
        el.name(this.opt.active).addClass('tab-link-active', true)
      })
    } catch (e) {
      console.error(`bind exp:${e.message}`)
    }
  }
}

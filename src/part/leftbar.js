/** @jsx-x jsx */
/** @jsxImportSource @wiajs/core */
import {Event} from '@wiajs/core'
import cfg from '../config/app'

const {$} = window

const def = {
  active: {p: '首页'},
}

/**
 * 应用左边菜单
 * 共用部件，不要使用全局变量！
 */
export default class Leftbar extends Event {
  /**
   *
   * @param {*} page 页面实例
   * @param {*} opt 选项，激活名称
   */
  constructor(page, opt) {
    super(opt, [page])
    this.page = page
    this.opt = {...def, ...opt}
    this.render(opt.data)
  }

  render(data) {
    try {
      if (!data) {
        console.log('menu data is null.')
        return
      }
      console.log('menu', {data, len: data.length})
      // href=""
      const gs = data.map(d => {
        const rs = d.c?.map((r, i) => {
          // const act = d.p[1] === this.opt.active.p && r === this.opt.active.c;
          const act = false
          return (
            <li>
              <a path={d.a?.[i] ?? ''} class={`item-content item-link ${act ? 'active' : ''}`}>
                <div class='item-inner'>
                  <div class='item-title'>{r}</div>
                </div>
              </a>
            </li>
          )
        })

        // const act = d.p[1] === this.opt.active.p;
        const act = false
        // 生成导航菜单，是否存在child
        return rs && rs.length > 0 ? (
          <li class={`accordion-item ${act ? 'accordion-item-opened' : ''}`}>
            <a class='item-content item-link'>
              <div class='item-media'>
                <i class='icon iconfont'>{d.p[0]}</i>
              </div>
              <div class='item-inner'>
                <div class='item-title'>{d.p[1]}</div>
              </div>
            </a>
            <div class='accordion-item-content'>
              <div class='list'>
                <ul>{rs}</ul>
              </div>
            </div>
          </li>
        ) : (
          <li class='accordion-item'>
            <a path={`${d.a?.[0] ?? ''}" class="item-content item-link`}>
              <div class='item-media'>
                <i class='icon iconfont'>{d.p[0]}</i>
              </div>
              <div class='item-inner'>
                <div class='item-title'>{d.p[1]}</div>
              </div>
            </a>
          </li>
        )
      })
      let v
      if (gs.length > 0) v = $(<ul>{gs}</ul>)
      this.opt.el.child(v)

      this.active(this.opt.active)

      this.bind(this.opt.el)
    } catch (ex) {
      console.log('render', {ex: ex.message})
    }
  }

  /**
   * 绑定点击事件
   */
  bind(el) {
    const _ = this

    // 点击菜单
    el.click(ev => {
      const lk = $(ev.target).upper('.item-link')
      const path = lk.attr('path')
      if (path) {
        // this.active(path, false);
        $.go(path)
      }
    })

    // 捕获应用级别页面事件;
    $.app.on('pageShow', p => {
      if (p?.path) {
        console.log('pageShow:', p.path)
        _.active(p.path)
      }
    })

    // 捕获应用级别页面事件;
    $.app.on('pageBack', p => {
      if (p?.path) {
        console.log('pageBack:', p.path)
        _.active(p.path)
      }
    })
  }

  active(path) {
    if (!path) return

    try {
      path = path.replace(`/${cfg.owner}/${cfg.name}/`, '')
      const {el} = this.opt
      const lk = el.find(`a[path="${path}"]`)
      if (lk.length) {
        if (!lk.hasClass('active')) {
          el.find('.active').removeClass('active')
          lk.addClass('active')
        }

        // 手风琴打开切换！
        let nd = lk.upper('li.accordion-item')
        if (nd.length && !nd.hasClass('accordion-item-opened')) {
          nd = nd.find('.item-link').eq(0)
          if (nd.length) $.app.accordion.toggleClicked.call($.app, nd)
        }
      }
    } catch (ex) {
      console.log('active exp:', ex.message)
    }
  }
}

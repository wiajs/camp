/**
 * 应用左边菜单
 */
import {Event} from '@wiajs/core'
import Api from '../util/api'

const _html = require('./navbar.html').default

const def = {
  active: {p: '首页'},
}

export default class Navbar extends Event {
  /**
   * @param {*} page 页面实例
   * @param {*} opt 选项，激活名称
   */
  constructor(page, opt) {
    super(opt, [page])
    this.page = page // 页面实例
    this.opt = {...def, ...opt}
    this.render(opt.data)
  }

  render(data) {
    try {
      const v = $(_html)
      this.opt.el.child(v)
      this.bind(this.opt.el)
    } catch (ex) {
      console.log('render', {ex: ex.message})
    }

    loadUserImg().then(res => {
      if (res) this.opt.el.class('userimg')[0].src = res
    })
  }

  /**
   * 绑定点击事件
   */
  bind(n) {
    // 点击菜单
    n.class('menu').click(ev => {
      const lk = $(ev.target).upper('.menu-item')
      // n.find('.active').removeClass('active');
      // lk.addClass('active');
      // const path = lk.attr('path');
      // console.log({path});
      // if (path) $.go(path);
    })

    n.name('btnLogin').click(ev => {
      $.go('login', {relogin: true})
    })

    n.name('fullScreen').click(ev => {
      let falg = true
      if (!document.fullscreenElement && falg === true) {
        $('#wia-app').get(0).requestFullscreen()
        n.name('fullScreen').html('&#xeb08;')
        falg = false
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
          n.name('fullScreen').html('&#xe610;')
          falg = true
        }
      }
    })
    // 捕获页面事件
    // this.page.on('show', () => {
    //   this.opt.el.name(this.opt.active).addClass('tab-link-active', true);
    // });

    // this.page.on('back', () => {
    //   this.opt.el.name(this.opt.active).addClass('tab-link-active', true);
    // });
  }
}

async function loadUserImg() {
  let R
  try {
    const u = $.app.user
    if (!u.studentid) $.go('mine/user')
    else {
      const stu = await new Api('camp/student').get({q: {id: u.studentid}})
      R = stu.avatar ?? 'img/avator.png'
    }
  } catch (e) {}

  return R
}

/**
 * 应用左边菜单
 */
import {Event} from '@wiajs/core'
import {log as Log} from '@wiajs/util'
import Api from '../util/api'
import * as store from '../util/store'

const _html = require('./navbar.html').default

const def = {
  active: {p: '首页'},
  name: 'navbar',
}

const log = Log({m: def.name}) // 创建模块日志实例

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
    this.show(opt.data)
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
      console.log(res)
      if (res) this.opt.el.class('userimg')[0].src = res
    })
  }

  show(data) {
    loadUserImg().then(res => {
      this.opt.el.class('userimg')[0].src = res
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
      // ???
      // store.remove('coures')
      // store.remove('token')
      // store.remove('chall')
      // store.remove('mobile')
      $.go('login', {relogin: true})
    })

    n.name('fullScreen').click(ev => {
      let full = false
      if (document.fullscreenElement) {
        document
          .exitFullscreen()
          .then(() => {
            n.name('fullScreen').html('&#xe610;')
            $('.page-master-detail').removeClass('full')
            $('.page-master').show()
          })
          .catch(err => console.error(err))
      } else {
        document.documentElement.requestFullscreen()
        n.name('fullScreen').html('&#xeb08;')
        $('.page-master').hide()
        $('.page-master-detail').addClass('full')
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

/**
 * 加载用户头像
 * @returns
 */
async function loadUserImg() {
  let R
  try {
    const avatar = store.get('student.avatar')
    if (avatar) R = avatar
    else {
      const u = $.app.user
      if (u.studentid) {
        const stu = await new Api('camp/student').get({q: {id: u.studentid}, field: 'avatar'})
        await store.set('student.avatar', stu.avatar)
        R = stu.avatar
      }
    }
    R = R ?? 'https://camp.wia.pub/img/avator.png'
  } catch (e) {
    log.err(e, 'loadUserImg')
  }

  return R
}

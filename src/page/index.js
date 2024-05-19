import {Page} from '@wiajs/core'
import {log as Log} from '@wiajs/util'

/** @type {*} */
const {$} = window

/** @typedef {{app?:*, name?: string, title?: string}} OptType */

/** @type {OptType} */
const def = {
  app: $.app,
  name: 'index',
  title: '注册',
}

const log = Log({m: def.name}) // 创建模块日志实例

// 全局数据
/** @type {*} */
let _
/** @type {*} */
const _from = {}

export default class Index extends Page {
  /** @type {OptType} opts */
  constructor(opts = {}) {
    /** {OptType} */
    const opt = {...def, ...opts}
    super(opt.app, opt.name, opt.title)
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
  }

  /** @param {*} v */
  hide(v) {
    log({v}, 'hide')
  }
}

function bind() {
  // 绑定事件
  _.class('btn').click(() => {
    // 'HTML','CSS','JS'
    let courseDetail = [
      {
        HTML: '',
        title: 'HTML',
      },
      {
        CSS: '',
        title: 'CSS',
      },
      {
        JS: '',
        title: 'JS',
      },
    ]
    /**
     * @type {Array<string>} checkboxArr
     */
    let checkboxArr = []
    let newArr = []
    newArr = courseDetail.filter((item, index) => {
      if (_.class('checkbox-list').find('input').selector[index].checked) {
        {
          return (
            item.title.toLocaleLowerCase() ==
            _.class('checkbox-list').find('input').selector[index].value
          )
        }
      }
    })
    //  console.log(newArr);
    // console.log(_.class('checkbox-list').find('input').selector[0].checked);
    // console.log(checkboxArr);
    // console.log(courseDetail);
    $.go('classList/', {checkboxArr}, {courseDetail})
  })

  _.class('headerbtn').click(() => {
    _.class('menu_list').css({
      display: 'block',
    })
  })

  $(document).click(e => {
    if (e.target !== $('.headerbtn')[0]) {
      _.class('menu_list').css({
        display: 'none',
      })
    }
  })
}

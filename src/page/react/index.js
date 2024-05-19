import React from 'react'
import {createRoot} from 'react-dom/client'
// import i18n from 'i18next'
// import {useTranslation, initReactI18next} from 'react-i18next'

// import {Menu} from '@headlessui/react'
// import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
// import {faCaretDown, faCaretUp} from '@fortawesome/free-solid-svg-icons'
// import {Props} from '@headlessui/react/dist/types'

import {Page} from '@wiajs/core'
import {log as Log} from '@wiajs/util'
// import Footer from '../comp/Footer'

/** @type {*} */
const {$} = window

/** @typedef {{app?:*, name?: string, title?: string}} OptType */

/** @type {OptType} */
const def = {
  app: $.app,
  name: 'index',
  title: '首页',
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
    render()
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
    const ps = new URLSearchParams(param)
    const name = ps.get('name')
    _.name(name).dom.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'})
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

function bind() {}

function Comp() {
  // return <h1>Hello from React!</h1>
  // return (
  //   <Alert variant="info">
  //     <p>
  //       <Link to="https://www.freecodecamp.org">Go to freeCodeCamp</Link>
  //     </p>
  //   </Alert>
  // )
  // return <Footer />
  // const {t} = useTranslation()

  return <h2>{'Welcome to React'}</h2>
}

function render() {
  /*   i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
      // the translations
      // (tip move them in a JSON file and import them,
      resources: {
        en: {
          translation: {
            'Welcome to React': 'Welcome to React and react-i18next',
          },
        },
      },
      lng: 'en', // if you're using a language detector, do not define the lng option
      fallbackLng: 'en',

      interpolation: {
        escapeValue: false,
      },
    })

  // append comp to dom
  const root = createRoot(document.getElementById('comp'))
  root.render(<Comp />)
 */
}

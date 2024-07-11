import {Page} from '@wiajs/core'
import {assert, AssertionError} from 'chai' // v4.4.1， 5 只支持 esm ReferenceError
import * as __helpers from '@freecodecamp/curriculum-helpers'
import {log as Log} from '@wiajs/util'
import {delay, post} from '../../util/tool'
import * as store from '../../util/store'
import Navbar from '../../part/navbar'
import Api from '../../util/api'
import api from '../../api'

/** @type {*} */
const {$} = window

window.assert = assert

/** @typedef {{app?:*, name?: string, title?: string}} OptType */

/** @type {OptType} */
const def = {
  app: $.app,
  name: 'exam',
  title: '挑战',
}

const log = Log({m: def.name}) // 创建模块日志实例

/** @type {*} */
let _editor

let startTime = new Date()
let stopTime = new Date()

/** @type {*} */
let _api

// 全局数据
/** @type {*} */
let _
/** @type {*} */
const _from = {}

/** @type {*} */
let _r
/**
 * @type {{type:string,couresTitle:string}} _store
 */
let _store
export default class Exam extends Page {
  /** @type {OptType} opts */
  constructor(opts = {}) {
    /** {OptType} */
    const opt = {...def, ...opts}
    super(opt.app, opt.name, opt.title)
    _api = new Api('camp/challenge')
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
    bind(param)
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
    show(param)
    _store = getLocal()
    _.class('course').text(_store.couresTitle)
    setCourseProgress()
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
    log({v, param}, 'back')
    _ = v
    back(param)
    setCourseProgress()
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
function init(pg) {
  const nav = new Navbar(pg, {
    el: _.class('navbar'),
    // active: 'btnHome',
  })
  loadEditor()
  // _rs = JSON.parse(localStorage.getItem('coures'))
  // loadChall(4, 1) // 82
  // _.class('course_title').text(param.couresTitle)
}

/**
 * 事件绑定
 * @param {*} param
 */
function bind(param) {
  // @ts-ignore
  _.btnRun.click(ev => {
    loadFrame()
    const cnt = check(_r)
    submit(_r, cnt)
    setCourseProgress()
  })

  _.btnReset.click(() => reset(_r))

  _.btnClose.click(() => _.passed.hide())

  _.btnNext.click(async () => {
    _.passed.hide()
    log({id: _r.id}, 'btnNext')
    loadChall(_r.courseid, _r.step + 1)
  })

  _.txCode.on('editor:ready', () => {})
}

/**
 *
 * @param {*} param
 */
function show(param) {
  if (param?.challid) loadChall(param.challid)
  else loadChall()
}

/**
 *
 * @param {*} param
 */
function back(param) {
  if (param?.challid) loadChall(param.challid)
}

/**
 * 加载挑战
 * @param {number=} courseid|challid - 课程id 或 挑战id
 * @param {number} [step = 0] 课程id 必须带 step
 */
async function loadChall(courseid, step = 0) {
  try {
    let r
    if (!courseid) {
      if (_r) r = _r
      else {
        r = JSON.parse(store.get('chall'))
        if (r) _r = r
      }
    } else {
      let challid = 0
      if (step === 0) challid = courseid
      r = await _api.get({q: challid ? {id: challid} : {courseid, step}})
    }

    log({r}, 'loadChall')

    if (!r || !r.tests.length) return

    _r = r // 全局保存
    store.set('chall', JSON.stringify(r)) // 本地保存

    _.title.html(r.title)
    // 加载挑战说明
    _.desc.setView(r)

    // 加载测试说明
    // @ts-ignore
    const ts = r.tests.map(t => ({text: t.text, icon: '&#xe6e7;', color: 'white'}))
    _.prompt.setView(ts)

    const challF = r.challengeFiles[0]
    log(r, challF, 'loadChall')
    const {name, ext} = challF
    const code = challF.contents
    const lang = ext === 'js' ? 'javascript' : ext

    await showCode(code, lang)

    if (ext === 'html') _.frUi.show()
    else _.frUi.hide()

    loadFrame()
    startTime = new Date()
  } catch (e) {
    log.err(e, 'loadChall')
  }
}

/**
 * 重置挑战
 * @param {*} r
 */
function reset(r) {
  if (!r || !r.tests.length) return

  try {
    // @ts-ignore
    const ts = r.tests.map(t => ({text: t.text, icon: '&#xe6e7;', color: 'white'}))
    _.prompt.setView(ts)

    const challF = r.challengeFiles[0]
    const {name, ext} = challF
    const code = challF.contents

    _editor.setValue(code)

    if (ext === 'html') _.frUi.show()
    else _.frUi.hide()
    loadFrame()
  } catch (e) {
    log.err(e, 'resetChall')
  }
}

/**
 * 创建编辑器，显示代码
 * @param {string} code
 * @param {string} lang
 */
async function showCode(code, lang) {
  try {
    if (!(await edited(5))) return

    log({code, lang}, 'showCode')

    if (_editor) _editor.dispose()
    _editor = window.monaco.editor.create(_.txCode.dom, {
      value: code,
      language: lang,
      theme: 'vs', // 可以设置编辑器主题vs-dark
      // 是否启用了代码自动补全
      autoClosingBrackets: 'always',
      // 是否启用了代码折叠
      folding: true,
      // 是否启用了选中文本的高亮显示
      selectionHighlight: true,
      automaticLayout: true,
      wordWrap: 'on',
    })

    _editor.onDidChangeModelContent(e => {
      loadFrame()
    })
  } catch (e) {
    log.err(e, 'showCode')
  }
}

/**
 * 加载 iframe
 * 
        {
            "link" : "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.css"
        }, 
        {
            "src" : "https://code.jquery.com/jquery-3.6.0.min.js"
        }, 
        {
            "link" : "https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.2.0/animate.css"
        } */
function loadFrame() {
  const {required: req} = _r
  // @ts-ignore
  let link = req.filter(f => f.link)
  // @ts-ignore
  if (link.length) link = link.map(lk => `<link rel="stylesheet" href="${lk.link}" />`)
  // @ts-ignore
  let src = req.filter(f => f.src)
  // @ts-ignore
  if (src.length) src = src.map(sc => `<script src="${sc.src}"></script>`)

  const code = _editor.getValue()

  _.frUi.dom.srcdoc = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    ${link.length ? link.join('\n') : ''}
  </head>
  <body>
    ${src.length ? src.join('\n') : ''}
    ${code}
    <script>    
      function run(code, test, x, head='', tail='') {        
        let R = { pass: false }
        const {assert, AssertionError, ReferenceError, __helpers} = x
        try { 
          eval(head + ';' + tail + ';' + test)
          R = { pass: true }
        } catch (err) {
          if (!(err instanceof AssertionError)) console.error(err)
          R = {
            pass: false,
            err: {
              message: err.message || '',
              stack: err.stack,
              expected: err.expected || '',
              actual: err.actual || ''
            }
          }
        }
        return R
      }

      function jqueryTest(assert,user_code,code){
        try { 
          eval(user_code + code)
        } catch (err) {
          return err
        }
      }
    </script>
  </body>
</html>
`
}

/**
 * 检测输入代码
 * @param {*} rs
 * @returns {number}
 */
function check(rs) {
  let R = 0
  try {
    if (!rs.tests.length) return
    const {title, tests, challengeFiles} = rs
    const {head, tail, runType} = challengeFiles[0]
    log({title}, 'check')

    /** @type {*} */
    const ts = []

    let code = _editor.getValue()
    let cnt = 0
    const x = {assert, AssertionError, ReferenceError, __helpers, runType} // ReferenceError
    // 测试输入代码
    tests.forEach(t => {
      let passed = true
      let flag = true
      let rt = {pass: false}
      try {
        if (_store.type === 'html')
          rt = _.frUi.dom.contentWindow.run(code, t.testString, x, head, tail)
        else rt = run(code, t.testString, x, head, tail)

        log({rt}, 'check')

        if (!rt.pass) {
          flag = false
          passed = false
        }
        // 样式函数
        // assertExcption
      } catch (err) {
        console.log(err)
        flag = false
        passed = false
      }

      if (flag) ts.push({text: t.text, icon: '&#xe664;', color: '#00ff00', passed})
      else ts.push({text: t.text, icon: '&#xe86d;', color: 'red', passed})
      if (passed) cnt++
    })

    _.prompt.setView(ts)

    if (cnt === rs.tests.length) _.passed.show()

    R = cnt
  } catch (e) {
    log.err(e, 'run')
  }

  return R
}

/**
 * 运行代码测试
 * 替代 eval，减少安全漏洞，eval 会带入了所有内存上下文变量，导致数据泄露！
 *
 * @param {string} code 编写代码
 * @param {string} test 测试代码
 * @param {*} [x] 辅助变量
 * @param {string} [head] 头部代码
 * @param {string} [tail] 尾部代码
 * @returns
 */
function run(code, test, x, head = '', tail = '') {
  const body = `
    "use strict"
    let R =  { pass: false }
    const {code, assert, AssertionError, ReferenceError, __helpers} = x // ReferenceError
    try {   
      ${head}      
      ;${x.runType === 1 ? '' : code}
      ;${tail}
      ;${test}

      R = { pass: true }
    } catch(err) {
      if (!(err instanceof AssertionError)) console.error(err)
        
      // to provide useful debugging information when debugging the tests, we
      // have to extract the message, stack and, if they exist, expected and
      // actual before returning
      R = {
        pass: false,
        err: {
          message: err.message || '',
          stack: err.stack,
          expected: err.expected || '',
          actual: err.actual || ''
        }
      }
    }
    
    return R
  `

  log({body}, 'run')

  // eslint-disable-next-line no-new-func
  return Function('x', body)(x)
}

// async function getData() {
//   const id = 'basic-html-and-html5'
//   const rs = await post('https://test.lianlian.pub/camp/courseByName', {name:id})
//   console.log(rs)
// }

/**
 * 提交当前挑战
 * @param {*} r
 * @param {number} count - 正确数
 */
async function submit(r, count = 0) {
  try {
    if (!r || !r.id || !$.app.user) return

    stopTime = new Date()

    const {id: challid, courseid} = r
    const d = {
      courseid,
      challid,
      code: _editor.getValue(),
      start: $.date('yyyy-MM-dd hh:mm:ss', startTime),
      stop: $.date('yyyy-MM-dd hh:mm:ss', stopTime),
      count,
    }
    const rs = await post(`${api.camp.addExam}`, d)
    log({d, rs}, 'submit')
  } catch (e) {
    log.err(e, 'submit')
  }
}

/**
 * 页面加载的编辑器对象是否就绪
 * @param {number} tm 单位 秒
 * @returns
 */
async function edited(tm) {
  let R = false
  try {
    const start = Date.now()
    while (Date.now() - start < tm * 1000) {
      // @ts-ignore
      if (window.monaco?.editor) {
        log({wait: Date.now() - start}, 'edited')
        R = true
        break
      } else await delay(200)
    }
  } catch (e) {
    log.err(e, 'edited')
  }

  return R
}

async function setCourseProgress() {
  const u = $.app.user
  if (!u.studentid) $.go('mine/user')
  let {couresId} = getLocal()
  let progress = '0'
  const stu = await new Api('camp/student').get({q: {id: u.studentid}})
  if (stu?.course?.length) {
    for (const c of stu.course) {
      c.count && c.id == parseInt(couresId) ? (progress = computedSch(c.count, c.total)) : progress
    }
    $.app.progressbar.set(_.class('progressbar'), progress, 0.5)
    _.class('center_text').text(`完成${progress}%`)
  }
}

/**
 *
 * @param {*} count
 * @param {*} total
 */
function computedSch(count, total) {
  return ((count / total) * 100).toFixed(0)
}

/**
 * 向页面添加样式
 */
function loadEditor() {
  if (_editor) return

  const sc1 = document.createElement('script') // 创建一个script标签
  sc1.type = 'text/javascript'
  // sc1.src = 'https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.43.0/min/vs/loader.min.js'
  sc1.src = 'https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.49.0/min/vs/loader.min.js'
  $('body').append(sc1)

  // 在页面加载完成后初始化 Monaco Editor
  const sc2 = document.createElement('script') // 创建一个script标签
  sc2.type = 'text/javascript'
  const code = `
      let _editor = false

      // 指定Monaco Editor的路径
      require.config({
        paths: {
          vs: 'https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.49.0/min/vs/',
        },
      })

      // 配置 Monaco Editor 的基本路径和工作区路径
      // Monaco Editor是基于Web Worker的，因此我们需要配置它的基本路径，以便它能够正确加载
      window.MonacoEnvironment = {
        getWorkerUrl: function (workerId, label) {
          const r = encodeURIComponent(
            'self.MonacoEnvironment = {' +
              'baseUrl: "https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.49.0/min/"};' +
              'importScripts("https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.49.0/min/vs/base/worker/workerMain.min.js");'
          )
          return 'data:text/javascript;charset=utf-8,' + r
        },
      }
      
      // 加载 Monaco Editor 的核心模块
      require(['vs/editor/editor.main'], function () {
        if (!_editor) { 
          _editor = true
          console.log({monaco: window.monaco})
          $('.page-master-detail').name('txCode').trigger('editor:ready')
        }
      })    
`
  sc2.appendChild(document.createTextNode(code))

  $('body').append(sc2)
}

function getLocal() {
  return JSON.parse(localStorage.getItem('coures'))
}

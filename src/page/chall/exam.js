import {Page, jsx} from '@wiajs/core'
import {log as Log} from '@wiajs/util'
import {assert} from 'chai' // Using Assert style
import {delay, post, promisify} from '../../util/tool'
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
    init(param)
    bind(param)
  }

  /**
   * 显示页面
   * @param {*} v
   * @param {*} param
   */
  async show(v, param) {
    super.show(v, param)
    log({v, param}, 'show')
    _ = v
    $.assign(_from, param)
    if (JSON.parse(localStorage.getItem('coures'))) {
      show(param)
    } else {
      console.log('1111')
      await promisify($.app.dialog.alert, 0)('请选择课程!', '温馨提示!')
      $.go('course/index')
    }

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
 * @param {any} param
 */
function init(param) {
  const nav = new Navbar(this, {
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
  _.btnRun.click((/** @type {any} */ ev) => {
    loadFrame()
    const cnt = run(_r)
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
 * @param {number} courseid|challid - 课程id 或 挑战id
 * @param {number} [step = 0] 课程id 必须带 step
 */
async function loadChall(courseid, step = 0) {
  $.app.dialog.preloader()
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
  $.app.dialog.close()
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

    _editor.onDidChangeModelContent((/** @type {any} */ e) => {
      loadFrame()
    })
  } catch (e) {
    log.err(e, 'showCode')
  }
}

/**
 *
 */
function loadFrame() {
  const code = _editor.getValue()
  _.class('testUi')[0].srcdoc = `
  ${code}
  <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.7.1/jquery.min.js">
  </script>
  <script>
  function test(assert,user_code,code){
    try { 
      eval(user_code)
    } catch (err) {
      return err
    }
  }

  function jqueryTest(assert,user_code,code){
    try { 
      eval(user_code + code)
    } catch (err) {
      return err
    }
  }
  </script>
  `
}

/**
 * 运行输入代码
 * @param {*} rs
 * @returns {number}
 */
function run(rs) {
  let R = 0
  try {
    if (!rs.tests.length) return

    /** @type {*} */
    const ts = []

    let code = _editor.getValue()
    let cnt = 0
    // 测试输入代码
    rs.tests.forEach((/** @type {{ testString: string; text: any; }} */ test) => {
      let passed = true
      let flag = true
      try {
        if (_store.type === 'html') {
          console.log(test.testString)
          const err = _.class('testUi')[0].contentWindow.test(window.assert, test.testString, code)
          console.log(err)
          if (err) {
            flag = false
            passed = false
          }
        } else {
          code = code.replace(/export\s*/g, '')
          console.log(test.testString)
          eval(code + rs.challengeFiles[0].tail + '\n' + test.testString)
        }
        // 样式函数
        // assertExcption
      } catch (err) {
        console.log(err)
        flag = false
        passed = false
      }

      if (flag) ts.push({text: test.text, icon: '&#xe664;', color: '#00ff00', passed})
      else ts.push({text: test.text, icon: '&#xe86d;', color: 'red', passed})
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
  console.log(count);
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
      count ,
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
  console.log(stu);
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
  console.log(count)
  return ((count / total) * 100).toFixed(0)
}

/**
 * 向页面添加样式
 */
function loadEditor() {
  if (_editor) return

  const sc1 = document.createElement('script') // 创建一个script标签
  sc1.type = 'text/javascript'
  sc1.src = 'https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.43.0/min/vs/loader.min.js'
  $('body').append(sc1)

  // 在页面加载完成后初始化 Monaco Editor
  const sc2 = document.createElement('script') // 创建一个script标签
  sc2.type = 'text/javascript'
  const code = `
      let _editor = false

      // 指定Monaco Editor的路径
      require.config({
        paths: {
          vs: 'https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.43.0/min/vs/',
        },
      })

      // 配置 Monaco Editor 的基本路径和工作区路径
      // Monaco Editor是基于Web Worker的，因此我们需要配置它的基本路径，以便它能够正确加载
      window.MonacoEnvironment = {
        getWorkerUrl: function (workerId, label) {
          const r = encodeURIComponent(
            'self.MonacoEnvironment = {' +
              'baseUrl: "https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.43.0/min/"};' +
              'importScripts("https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.43.0/min/vs/base/worker/workerMain.min.js");'
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

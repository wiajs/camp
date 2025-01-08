// eslint-disable-next-line max-classes-per-file
import {Page} from '@wiajs/core'
import {assert, AssertionError} from 'chai' // v4.4.1， 5 只支持 esm ReferenceError
import * as __helpers from '@freecodecamp/curriculum-helpers'
import {log as Log} from '@wiajs/util'
// import * as Enzyme from 'enzyme'
// import Adapter from 'enzyme-adapter-react-16'
import {delay, post} from '../../util/tool'
import * as store from '../../util/store'
import Navbar from '../../part/navbar'
import Api from '../../util/api'
import api from '../../api'
import cfg from '../../config/app'

// Enzyme.configure({adapter: new Adapter()})

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

let _startTime = new Date()
let _stopTime = new Date()

/** @type {*} */
let _api

// 全局数据
/** @type {*} */
let _
/** @type {*} */
const _from = {}

/** @type {*} */
let _r

let _ext = 'html'

/**
 * @type {*}
 */
let _course

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
    _.class('course').text(_course.title)
    // setProgress()
    $('.page-master').hide()
    $('.page-master-detail').addClass('full')
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
    // setProgress()
    $('.page-master').hide()
    $('.page-master-detail').addClass('full')
  }

  /** @param {*} v */
  hide(v) {
    log({v}, 'hide')
    $('.page-master-detail').removeClass('full')
    $('.page-master').show()
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

  // 处理错误：ResizeObserver loop completed with undelivered notifications
  // 组件重新绘制大小时dev环境出现报错提示，如在VUE3中使用ant-design-vue表格自适应窗口大小时webpack会报错。
  // 本页报错，估计是编辑器与弹性盒子调整宽度时导致
  // 常用解决方案有重写ResizeObserver或者时间间隔内限制执行方式，可以设置屏蔽方式跳过提示。

  const _ResizeObserver = window.ResizeObserver
  window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback) {
      callback = debounce(callback, 200)
      super(callback)
    }
  }

  _course = store.get('course')

  loadEditor()
}

/**
 * 事件绑定
 * @param {*} param
 */
function bind(param) {
  // @ts-ignore
  _.btnRun.click(async ev => {
    // if (_ext === 'wia') loadWia()

    const cnt = check(_r)
    const rs = await submit(_r, cnt)
    // 检测成功、提交成功，显示进度
    if ((cnt === _r.tests.length && rs.code) === 200 && rs.data.passed) {
      await setProgress(rs.data)
      _.passed.show()
    } else _startTime = new Date() // 重新计时
  })

  _.btnReset.click(() => reset(_r))

  _.btnClose.click(() => _.passed.hide())

  _.btnNext.click(async () => {
    _.passed.hide()
    log({id: _r.id}, 'btnNext')
    loadChall(_r.courseid, _r.challengeOrder + 1)
  })

  _.txCode.on('editor:ready', () => {})
  _.name('btnBack').click(() => {
    // debugger
    $.go('master', {path: 'course/last'})
  })

  window.addEventListener(
    'message',
    ev => {
      const {data} = ev

      // 通过origin对消息进行过滤，避免遭到XSS攻击
      if (
        // ev.origin === 'https://lianlian.pub' &&
        data?.from === 'sink:play' &&
        data?.act === 'ready'
      ) {
        // debugger
        loadWia()
      }
    },
    false
  )
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
 * @param {number} [challengeOrder = 0] 课程id 必须带 challengeOrder
 */
async function loadChall(courseid, challengeOrder = 0) {
  try {
    let r
    if (!courseid) {
      if (_r) r = _r
      else {
        r = store.get('chall')
        if (r) _r = r
      }
    } else {
      let challid = 0
      if (challengeOrder === 0) challid = courseid
      r = await _api.get({
        q: challid ? {id: challid} : {courseid, challengeOrder},
        field: '-solutions',
      })
      if (r) _r = r
      store.set('chall', r) // 本地保存当前挑战
    }

    // log({r}, 'loadChall')

    if (!r || !r.tests.length) {
      $.go('course/index')
      return
    }

    _.title.html(r.title)
    if (r.author) {
      _.txAuthor.text(`作者：${r.author}`)
      _.txAuthor.show()
    } else _.txAuthor.hide()

    // 加载挑战说明
    _.desc.setView(r)

    // 加载测试说明
    // @ts-ignore
    const ts = r.tests.map(t => ({
      text: t.text,
      icon: '&#xe6e7;',
      color: 'white',
    }))
    _.prompt.setView(ts)

    const challF = r.challengeFiles[0]
    // log(r, challF, 'loadChall')
    const {name, ext} = challF
    _ext = ext // 全局保存

    const code = challF.contents
    const lang = ['js', 'jsx'].includes(ext) ? 'javascript' : ext

    await showCode(code, lang)

    if (['html', 'jsx', 'vue', 'wia'].includes(ext)) {
      loadFrame()
      showFrame()
    } else hideFrame()

    _startTime = new Date()
  } catch (e) {
    log.err(e, 'loadChall')
  }
}

function showFrame() {
  // $('.monaco-editor').css({width: '500px'})
  if (_ext === 'wia') {
    if (!_.frSink.dom.src) {
      _.frSink.dom.src = cfg.sink
      _.frSink.dom.onload = function () {
        console.log('wia iframe loaded.')
        // frSink.window.childConsole(data)
        // sendMsg(data)
      }
    }

    _.dvSink.show()
    _.frUi.hide()
  } else {
    _.dvSink.hide()
    _.frUi.show()
  }
}

function hideFrame() {
  // $('.monaco-editor').css({width: '700px'})
  _.dvSink.hide()
  _.frUi.hide()
}

/**
 * 重置挑战
 * @param {*} r
 */
function reset(r) {
  if (!r || !r.tests.length) return

  try {
    // @ts-ignore
    const ts = r.tests.map(t => ({
      text: t.text,
      icon: '&#xe6e7;',
      color: 'white',
    }))
    _.prompt.setView(ts)

    const challF = r.challengeFiles[0]
    const code = challF.contents

    _editor.setValue(code)

    if (['html', 'jsx', 'vue', 'wia'].includes(_ext)) {
      loadFrame()
      showFrame()
    } else hideFrame()
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
    if (!(await edited(10))) return

    log({code, lang}, 'showCode')

    if (_editor) _editor.dispose()
    _editor = window.monaco.editor.create(_.txCode.dom, {
      value: code,
      language: ['vue', 'wia'].includes(lang) ? 'html' : lang,
      theme: 'vs', // 可以设置编辑器主题vs-dark
      // 是否启用了代码自动补全
      autoClosingBrackets: 'always',
      // 是否启用了代码折叠
      folding: true,
      // 是否启用了选中文本的高亮显示
      selectionHighlight: true,
      tabSize: 2,
      insertSpaces: true,
      automaticLayout: true, // 自动调节
      wordWrap: 'on',
    })

    // 编辑器与容器等宽
    // $('.monaco-editor').css({width: '100%'})

    _editor.onDidChangeModelContent(e => {
      if (['html', 'jsx', 'vue', 'wia'].includes(_ext)) loadFrame()
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
  try {
    if (!['html', 'jsx', 'vue', 'wia'].includes(_ext)) return

    if (_ext === 'jsx') loadJsx()
    else if (_ext === 'vue') loadVue()
    else if (_ext === 'wia') loadWia()
    else {
      const {required: req} = _r

      // @ts-ignore
      let link = req?.filter(f => f.link)
      // @ts-ignore
      if (link?.length) link = link.map(lk => `<link rel="stylesheet" href="${lk.link}" />`)
      // @ts-ignore
      let src = req?.filter(f => f.src && !/jquery/gi.test(f.src)) ?? []
      // "https://code.jquery.com/jquery-3.6.0.min.js"
      src.push({
        // src: 'https://cdn.staticfile.net/jquery/3.7.1/jquery.min.js',
        src: 'https://lib.baomitu.com/jquery/3.6.4/jquery.min.js',
      })

      // @ts-ignore
      if (src?.length) src = src.map(sc => `<script src="${sc.src}"></script>`)

      const code = _editor.getValue()

      const html = `
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
      _.frUi.dom.srcdoc = html
    }
  } catch (e) {
    log.err(e, 'loadFram')
  }
}

function loadJsx() {
  try {
    const {required: req, template, challengeFiles} = _r
    const {head, tail, runType} = challengeFiles[0]

    // @ts-ignore
    let link = req?.filter(f => f.link)
    // @ts-ignore
    if (link?.length) link = link.map(lk => `<link rel="stylesheet" href="${lk.link}" />`)
    // @ts-ignore
    let src = req?.filter(f => f.src) ?? []
    // let src = req?.filter(f => f.src && !/jquery/gi.test(f.src)) ?? []
    // "https://code.jquery.com/jquery-3.6.0.min.js"
    // src.push({src: 'https://cdn.bootcdn.net/ajax/libs/jquery/3.7.1/jquery.min.js'})
    src.push({
      src: 'https://lib.baomitu.com/babel-standalone/7.25.6/babel.min.js',
    })
    src.push({src: 'https://camp.wia.pub/wia/enzyme.js'})

    // @ts-ignore
    if (src?.length) src = src.map(sc => `<script src="${sc.src}"></script>`)

    const code = _editor.getValue()

    const source = `
    ${src.length ? src.join('\n') : ''} 
    <script>    
      let code = \`${head ? ';' + head + '\n' : ''}\` + \`${code}\n\` + \`${tail ? ';' + tail + '\n' : ''}; \` 
      const trans = window.Babel.transform(code, { presets: ['es2015', 'react'] }); // 编译 jsx字符串代码为 js字符串代码    
      if (trans) {
        code = trans.code; // + ';return JSX;'
        // let functionReactJsx = new Function(code); // 定义代码执行函数
        // functionReactJsx(); // 执行代码
        eval(code)
      }
      
      function run(code, test, x) {        
        let R = { pass: false }

        const {assert, AssertionError, ReferenceError, __helpers} = x
        try { 
          eval(trans.code + ';' + test)
          // eval(test)
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
    </script>
    `
    const body = template ? eval(`\`${template}\``) : `<body>${source}</body>`
    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    ${link.length ? link.join('\n') : ''}
  </head>
  ${body}
</html>
`
    _.frUi.dom.srcdoc = html
  } catch (e) {
    log.err(e, 'loadJsx')
  }
}

function loadVue() {
  try {
    const {required: req, template, challengeFiles} = _r
    const {head, tail} = challengeFiles[0]

    // @ts-ignore
    let link = req?.filter(f => f.link)
    // @ts-ignore
    if (link?.length) link = link.map(lk => `<link rel="stylesheet" href="${lk.link}" />`)
    // @ts-ignore
    let src = req?.filter(f => f.src) ?? []

    // @ts-ignore
    if (src?.length) src = src.map(sc => `<script src="${sc.src}"></script>`)

    let code = _editor.getValue()
    let style = ''
    let tp = ''
    let js = ''
    let mt = code.match(/<template>([\s\S]+)<\/template>/)
    if (mt) [, tp] = mt
    mt = code.match(/(<style>[\s\S]+<\/style>)/)
    if (mt) [, style] = mt
    mt = code.match(/<script>([\s\S]+)<\/script>/)
    if (mt) [, js] = mt

    if (js) {
      if (tp) code = js.replace(/export\s+default\s*\{/, `const Comp = {template: \`${tp}\`,`)
      else code = js.replace(/export\s+default\s*/, `const Comp = `)
    } else if (tp) code = `const Comp = {template: \`${tp}\`}`
    if (!code) return

    const source = `
    ${src.length ? src.join('\n') : ''} \n 
    <script>    
      const pgCode = \`${head ? ';' + head + '\n' : ''}\` + \`${code.replaceAll('`', '\\`')}\n\` + \`${tail ? ';' + tail + '\n' : ''}; \` 
      const runCode = \`${code.replaceAll('`', '\\`')}\n\` 

      try { 
        eval(pgCode)
      } catch(err) {
        console.error(err) 
      }
        
      function run(code, test, x) {        
        let R = { pass: false }

        const {assert, AssertionError, ReferenceError, __helpers} = x
        try { 
          // debugger
          eval(runCode + test)
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
    </script>
    `
    const body = template ? eval(`\`${template}\``) : `<body>${source}</body>`
    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    ${link.length ? link.join('\n') : ''}
    \n${style} 
  </head>
  ${body}
</html>
`
    _.frUi.dom.srcdoc = html
  } catch (e) {
    log.err(e, 'loadVue')
  }
}

/**
 * 向 iframe 发送消息
 * @param {*} data
 */
function sendMsg(data) {
  _.frSink.dom.contentWindow.postMessage(data, cfg.sinkHost)
}

function loadWia() {
  try {
    const {title, challengeFiles} = _r
    const {head, tail} = challengeFiles[0]

    let code = _editor.getValue()
    const data = {from: 'camp', act: 'show', path: 'play', title, code}
    sendMsg(data)
  } catch (e) {
    log.err(e, 'loadWia')
  }
}

function testWia() {
  try {
    const {title, challengeFiles} = _r
    const {head, tail} = challengeFiles[0]

    let code = _editor.getValue()
    if (!code) return

    const data = {from: 'camp', act: 'test', path: 'play', title, code}
    sendMsg(data)

    let js = ''
    let mt = code.match(/<script>([\s\S]+)<\/script>/)
    if (mt) [, js] = mt

    const source = `
    <script>    
      function run(code, test, x) {        
        let R = { pass: false }

        const {assert, AssertionError, ReferenceError, __helpers} = x
        try { 
          // debugger
          eval(runCode + test)
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
    </script>
    `
  } catch (e) {
    log.err(e, 'loadWia')
  }
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

    const code = _editor.getValue()
    let cnt = 0
    const x = {assert, AssertionError, ReferenceError, __helpers, runType} // ReferenceError
    // 测试输入代码
    tests.forEach(t => {
      let passed = true
      let flag = true
      let rt = {pass: false}
      try {
        if (['html', 'jsx', 'vue'].includes(_ext))
          rt = _.frUi.dom.contentWindow.run(code, t.testString, x, head, tail)
        else if (_ext === 'wia')
          rt = _.frSink.dom.contentWindow.run(code, t.testString, x, head, tail)
        else rt = run(code, t.testString, x, head, tail)

        log({rt}, 'check')

        if (!rt.pass) {
          flag = false
          passed = false
        }
        // 样式函数
        // assertExcption
      } catch (err) {
        log.err(err, 'check')
        flag = false
        passed = false
      }

      if (flag) ts.push({text: t.text, icon: '&#xe664;', color: '#00ff00', passed})
      else ts.push({text: t.text, icon: '&#xe86d;', color: 'red', passed})
      if (passed) cnt++
    })

    _.prompt.setView(ts)

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
  x.code = code
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

  // log({body}, 'run')

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
  let R
  try {
    if (!r || !r.id || !$.app.user) return

    _stopTime = new Date()

    const {id: challid, courseid} = r
    const d = {
      courseid,
      challid,
      code: _editor.getValue(),
      start: $.date('yyyy-MM-dd hh:mm:ss', _startTime),
      stop: $.date('yyyy-MM-dd hh:mm:ss', _stopTime),
      count,
    }
    const rs = await post(`${api.camp.addExam}`, d)
    if (rs) R = rs
    log({d, rs}, 'submit')
  } catch (e) {
    log.err(e, 'submit')
  }

  return R
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

/**
 * 完成比例、得分
 * @param {*} rs 提交返回数据
 */
async function setProgress(rs) {
  if (!rs || !rs.course) return

  try {
    const {count, total} = rs.course
    const progress = ((count / total) * 100).toFixed(0)
    $.app.progressbar.set(_.class('progressbar'), progress, 0.5)
    _.class('center_text').text(
      `完成：${progress}%，本关得分：${rs.score}，课程平均得分：${rs.course.score}`
    )
  } catch (e) {
    log.err(e, 'setProgress')
  }
}

/**
 * 向页面添加编辑器
 */
function loadEditor() {
  if (_editor) return

  const sc1 = document.createElement('script') // 创建一个script标签
  sc1.type = 'text/javascript'
  sc1.src = 'https://lib.baomitu.com/monaco-editor/0.51.0/min/vs/loader.min.js'

  $('body').append(sc1)

  // 在页面加载完成后初始化 Monaco Editor
  const sc2 = document.createElement('script') // 创建一个script标签
  sc2.type = 'text/javascript'
  const code = `
      let _editor = false

      // 指定Monaco Editor的路径
      require.config({
        paths: {
          vs: 'https://lib.baomitu.com/monaco-editor/0.51.0/min/vs/',
        },
      })

      // 配置 Monaco Editor 的基本路径和工作区路径
      // Monaco Editor是基于Web Worker的，因此我们需要配置它的基本路径，以便它能够正确加载
      window.MonacoEnvironment = {
        getWorkerUrl: function (workerId, label) {
          const r = encodeURIComponent(
            'self.MonacoEnvironment = {' +
              'baseUrl: "https://lib.baomitu.com/monaco-editor/0.51.0/min/"};' +
              'importScripts("https://lib.baomitu.com/monaco-editor/0.51.0/min/vs/base/worker/workerMain.js");'
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

function debounce(fn, delay) {
  /** @type {*} */
  let timer
  return (...args) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

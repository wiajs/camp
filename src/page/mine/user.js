/** @jsx-x jsx */
/** @jsxImportSource @wiajs/core */
import {Page, jsx} from '@wiajs/core'
import Uploader from '@wiajs/ui/uploader'
// import * as echarts from 'echarts' // 4M size
// import Uploader from '../../ui/uploader'; // eslint-disable-line
// import {signal, computed, effect, batch} from '@preact/signals-core';
// import {signal, effect, batch} from '@wiajs/lib/signal'
// import {reactive, ref, effect} from '@vue/reactivity'
import {log as Log} from '@wiajs/util'
import Navbar from '../../part/navbar'
import {promisify, post} from '../../util/tool'
import Api from '../../util/api'
import api from '../../api'
import {bindStudent} from '../../api/user'

/** @type {*} */
const {$} = window

/** @typedef {{app?:*, name?: string, title?: string}} OptType */

/** @type {OptType} */
const def = {
  app: $.app,
  name: 'user',
  title: '用户',
}

const log = Log({m: def.name}) // 创建模块日志实例

/** @type {*} */
let _ = null // current page

const _url = 'https://test.lianlian.pub/img/upload'

/** @type {*} */
let _fm = null // main form
let stu
const _data = {
  name: '喻华锋',
  nick: 'way',
  gender: '1',
  no: '2021666',
  schoolid: 55, // '重庆邮电大学',
  collegeid: 56, // 计算机学院
  majorid: 3, // 人工智能
  grade: '2021',
  clas: '2021006',
  avatar:
    // eslint-disable-next-line max-len
    'http://thirdwx.qlogo.cn/mmopen/x4icnictNGicLZHY4p6crbX6CpB2kibWicYAgmkhPUHvJ279icL0LMxJxFJU6Wouc9gqia54djlHvF0ROicJoKNH2QOxVp7ic7mibq9Otw/132',
  email: 'walteryu@126.com',
}

/** @type {*} */
let _sig

/** @type {*} */
let _uploader = null

/** @type {*} */
let _api

/** @type {*} */
let _r

export default class User extends Page {
  /** @param {OptType} opts */
  constructor(opts = {}) {
    /** {OptType} */
    const opt = {...def, ...opts}
    super(opt.app, opt.name, opt.title)
    _api = new Api('camp/student')
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
    _ = v
    _fm = _.name('fmData')

    log({v, param, id: this.id}, 'ready')
    init(this)
    bind()
  }

  /**
   * 显示页面
   * @param {*} v
   * @param {*} param
   */
  show(v, param) {
    super.show(v, param)

    _ = v
    _fm = v.name('fmData')
    log({v, param}, 'show')
    show()
    initEcharts()
  }

  /**
   * url hash 参数变化
   * @param {*} v
   * @param {*} param
   * @param {*} lastParam
   */
  change(v, param, lastParam) {
    super.change(v, param, lastParam)
    // super.show(v, param);
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
    back(param)
    initEcharts()
  }

  /** @param {*} v */
  hide(v) {
    log({v}, 'hide')
  }
}

/**
 * 初始化
 * @param {Page} pg 页面实例
 */
function init(pg) {
  const nav = new Navbar(this, {
    el: _.class('navbar'),
    // active: 'btnHome',
  })

  _uploader = new Uploader({
    dir: 'img/mine/', // 图片存储路径
    url: _url, // 上传网址
    el: _.class('uploader'), // 组件容器
    input: _.avatar, // 上传成功后的url填入输入框，便于提交
    choose: _.choose, // 点击触发选择文件
    // accept: 'application/pdf', // 选择文件类型
    accept: 'image/jpg,image/jpeg,image/png', // 选择文件类型
    compress: true, // 启动压缩
    quality: 0.8, // 压缩比
    maxSize: 200, // 压缩后最大尺寸单位 KB
    // width: 80, // 指定宽
    // height: 80, // 指定高
    // resize: 'cover', // 按指定宽高自动居中裁剪
    aspectRatio: 1, // 宽高比
    crop: 'img/crop', // 按宽高比人工裁剪

    multiple: false, // 可否同时选择多个文件
    limit: 1, // 选择图片数限制 -1 0 不限
    left: 250, // 预览偏移，左边有导航栏

    // xhr配置
    data: {bucket: 'camp'}, // 腾讯云存储桶
  })
}

function bind() {
  let i = 0
  _.btnCancel.click(() => {
    // const els = $('input[type=file]')
    // els[1].click()
    // 测试信号量
    // i++
    // // 批量改变数据
    // batch(() => {
    //   Object.assign(_sig, {name: `名称${i}`, nick: `昵称${i}`})
    //   // _sig.value = `名称${i}`
    //   // _sig.value = i
    // })
  })

  _.btnSave.click(() => save())

  // 链式调用
  _uploader.on(
    'success',
    /** @param {*} rs, @param {*} file, @param {*} files */ (rs, file, files) => {
      console.log('uploader succ', {rs, file, files})
    }
  )

  _.collegeid.on('change', () => {
    const collid = Number.parseInt(_.collegeid.val())
    loadMajor(collid)
  })
  // _.no.on('input', () => autoFill(500))
}

async function show() {
  let r = _r
  if (!r) {
    const u = $.app.user // _data
    const q = {userid: u.id}
    r = await _api.get({q})
  }

  if (r) {
    _r = r
    const collid = r.collegeid
    await loadMajor(collid, collid)
    _fm.setForm(r)
  }

  // rs 数据与view单向绑定，数据变化，view自动变化
  // _sig = _fm.bindForm(r)
}

/** @param {*} param */
function back(param) {
  if (param.src === 'crop') {
    const {id, blob} = param
    if (id && blob && _uploader) _uploader.update(id, blob)
  }
}

async function save() {
  try {
    const d = _fm.getForm()
    log({d}, 'save')
    // 数组处理
    // if (d.avatar.length) [d.avatar] = d.avatar

    if (!(await check(d))) return

    // if (r.avatar) r.avatar = `${r.avatar.dir}/${r.avatar.file}`;

    let r
    if (_r?.id > 0) {
      r = await _api.up({id: _r.id}, d)
      if (r) {
        _r = r
        loadUserImg().then(res => {
          _.class('userimg')[0].src = res
        })
        await promisify($.app.dialog.alert, 0)('修改成功!', '温馨提示!')
      }
    } else {
      d.course = [{id: 5}, {id: 1}, {id: 2}, {id: 4}]
      r = await _api.add(d)
      if (r) {
        _r = r // 保存
        const u = await bindStudent(r.id)
        log({u}, 'save')
        if (u) $.app.user = u
        await promisify($.app.dialog.alert, 0)('注册成功!', '温馨提示!')
      }
    }

    log({r}, 'save')
    if (r) $.go('course/')
  } catch (e) {
    log.err(e, 'save')
  }
}

/**
 * 检查输入
 * @param {*} d
 */
async function check(d) {
  let R = true
  if (
    !d.schoolid ||
    !d.collegeid ||
    !d.majorid ||
    !d.no ||
    !d.grade ||
    !d.clas ||
    !d.gender ||
    !d.avatar ||
    !d.name ||
    !d.nick ||
    !d.email
  ) {
    R = false
    await promisify($.app.dialog.alert, 0)('必填不能为空!', '温馨提示!')
  }

  return R
}

/**
 * 更新专业
 * @param {number} collid
 * @param {number} [val = 0]
 */
async function loadMajor(collid, val = 0) {
  if (collid) {
    let rs = await post(`${api.camp.getMajor}`, {unitid: collid})
    // log({rs}, 'getMajor')
    if (rs.code === 200) {
      rs = rs.data
      // 清空专业下拉菜
      _.majorid.html('<option value="0" selected>请选择专业</option>')
      // @ts-ignore
      const opts = Object.keys(rs).map(k => <option value={k}>{rs[k]}</option>)
      _.majorid.append(opts).val(`${val}`)
    }
  }
}

async function loadUserImg() {
  const u = $.app.user
  if (!u.studentid) return
  const stu = await new Api('camp/student').get({q: {id: u.studentid}})
  return stu.avatar
}

async function initEcharts() {
  const u = $.app.user
  if (!u.studentid) return

  /**
   * @type {Array<object>}
   */
  let data = []
  let r = await _api.get({q: {id: u.studentid}})
  let rs = JSON.parse(localStorage.getItem('coures'))
  r.course.forEach(async (/** @type {any} */ r) => {
    // console.log(r.score);
    // console.log(
    //   await post('https://test.lianlian.pub/camp/getRank', {
    //     couresid: rs.couresId,
    //     challid: rs.challid,
    //     studentid: u.studentid,
    //     score: r.score,
    //   })
    // )
    data.push(computedSch(r.count, r.total, r.id))
  })
  let myChart = echarts.init(document.querySelector('.schedule'))

  let option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    title: [
      {
        left: 'center',
        text: '课程完成进度表',
      },
    ],
    xAxis: [
      {
        type: 'category',
        data: data.map(function (item) {
          return item.name
        }),
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: [
      {
        name: 'Direct',
        type: 'bar',
        barWidth: '60%',
        data: data.map(function (item) {
          return parseFloat(item.value) // 将百分比字符串转换为数值
        }),
        itemStyle: {
          normal: {
            label: {
              show: true, // 开启显示
              position: 'top', // 标签的位置,outer外面，inner里面，top上面
              textStyle: {
                // 数值样式
                color: '#5470C6',
                fontSize: 14,
              },
              formatter: '{c}%', // 格式化显示的样式
            },
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: '#347CDD',
              },
              {
                offset: 1,
                color: '#56fb93',
              },
            ]),
          },
        },
      },
    ],
  }

  myChart.setOption(option)
}

/**
 *
 * @param {*} count
 * @param {*} total
 * @param {*} id
 */
function computedSch(count, total, id) {
  let data
  switch (id) {
    case 5:
      data = {name: 'HTML', value: ((count / total) * 100).toFixed(0)}
      break
    case 1:
      data = {name: 'CSS', value: ((count / total) * 100).toFixed(0)}
      break
    case 2:
      data = {name: 'flexbox', value: ((count / total) * 100).toFixed(0)}
      break
    case 4:
      data = {name: 'Javascript', value: ((count / total) * 100).toFixed(0)}
      break
  }
  return data
}

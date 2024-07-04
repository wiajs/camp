import {Page} from '@wiajs/core'
import {log as Log} from '@wiajs/util'
import {canvasToBlob} from '@wiajs/lib/img/util'
import Cropper from '@wiajs/ui/cropper'

/** @type {*} */
const {$} = window

/** @typedef {{app?:*, name?: string, title?: string}} OptType */

/** @type {OptType} */
const def = {
  app: $.app,
  name: 'crop',
  title: '裁剪',
}

// 创建模块专用 log
const log = Log({m: def.name}) // 类日志实例

/** @type {*} */
let _ = null // current page

/** @type {*} */
const _from = {}

/** @type Cropper */
let _cropper

export default class Crop extends Page {
  /** @param {OptType} opts */
  constructor(opts = {}) {
    /** {OptType} */
    const opt = {...def, ...opts}
    super(opt.app, opt.name, opt.title)
    this.opt = opt
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
    _.opt = this.opt
    log({v, param, id: this.id}, 'ready')
    init(param)
    bind()
  }

  /**
   *
   * @param {*} v
   * @param {*} param
   */
  show(v, param) {
    super.show(v, param)
    $.assign(_from, param)
    show(param)
  }

  /**
   * 参数变化
   * @param {*} v
   * @param {*} param
   * @param {*} lastParam
   */
  change(v, param, lastParam) {
    // super.show(v, param);
    log({v, param, lastParam}, 'change')
  }

  /**
   *
   * @param {*} v
   * @param {*} param
   */
  back(v, param) {
    super.back(v, param)
  }

  /**
   *
   * @param {*} v
   */
  hide(v) {
    log({v}, 'hide')
  }
}

/**
 * 初始化组件
 * @param {*} param
 */
function init(param) {
  const {img} = _
  img.dom.src = 'img/pic.jpg' // param?.url ?? img.dom.src
  _cropper = new Cropper($.app, {
    aspectRatio: param?.aspectRatio ?? 1, // 裁剪宽高比
    // autoCropArea: 1, // 裁剪框比例, default 0.8
    el: _.class('crop'), // 组件容器
    // viewMode: 3, // 1：不超过画布的大小 3: 画布填充容器（会变形）
    preview: '.preview', // 需固定宽度，宽度不变，高度变
  })
}

// 在已经加载的视图上操作
function bind() {
  _.btnCrop.click(
    /** @param {*} ev */ async ev => {
      const canvas = _cropper.getCroppedCanvas()
      const blob = await canvasToBlob(canvas)
      $.back({src: _from.src, id: _from.id, blob}) // 返回裁剪结果
    }
  )

  _.btnCancel.click(
    /** @param {*} ev */ ev => {
      $.back()
    }
  )
}

/**
 *
 * @param {*} param
 */
function show(param) {
  // 更新图片
  if (_cropper && param?.url) _cropper.replace(param.url)
}

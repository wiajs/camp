import {Page} from '@wiajs/core'
import {log as Log} from '@wiajs/util'
import Verify from '@wiajs/ui/verify'
import * as store from '../util/store'
// import {getCode} from '../api/user';

/** @type {*} */
const {$} = window

/** @typedef {{app?:*, name?: string, title?: string}} OptType */

/** @type {OptType} */
const def = {
  app: $.app,
  name: 'login',
  title: '登录',
}

const log = Log({m: def.name}) // 创建模块日志实例

/** @type {*} */
let _ = null

/** @type {*} */
const _from = {}

/** @type {Verify} */
let _verify

export default class Login extends Page {
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
    _ = v
    log({v, param, id: this.id}, 'ready')
    init(this)
    bind(this)
  }

  /**
   * 显示页面
   * @param {*} v
   * @param {*} param
   */
  show(v, param) {
    super.show(v, param)
    const lastData = $.lastPage && $.lastPage.data
    console.log('login show:', {param, lastData})
    $.assign(_from, param)
    show()
  }

  /**
   * 返回
   * @param {*} v
   * @param {*} param
   */
  back(v, param) {
    super.back(v, param)
    _verify?.reload()
  }
}

/**
 * 初始化
 * @param {Login} pg
 */
function init(pg) {
  let R

  try {
    /** @type {string|number} */
    // eslint-disable-next-line
    let width = getComputedStyle($('.verify').upper('ul')[0]).width
    if (width && width !== '300px') width = Number.parseInt(width.replace('.px', ''))
    width = width ?? 0 < 300 ? 300 : width

    _verify = new Verify(pg, {
      el: '.verify',
      url: 'https://test.lianlian.pub/auth',
      width, // iPhone 需缩小避免页面左右滑动
      // url: 'img/verify',
    })

    _verify.onSuccess = () => {
      console.log('success')
      onSucc(_verify.mobile)
    }
    _verify.onFail = () => {
      console.log('fail')
    }
    _verify.onRefresh = () => {
      console.log('refresh')
    }
  } catch (e) {
    console.error(`init exp:${e.message}`)
  }

  return R
}

/**
 * 绑定事件
 * @param {Login} pg
 */
function bind(pg) {
  try {
    _.class('checkbox').click(async ev => {
      // console.log(_.ckAgree.val(_));
      const mobile = _.txMobile.val()
      if (/1\d{10}/.test(mobile)) {
        store.set('mobile', mobile)

        if (_.ckAgree.dom.checked) _.liVerify.hide()
        else {
          // 通过手机号码加载验证图片
          if (!_verify.status) await _verify.loadImg(mobile)
          _.liVerify.show()
        }
      } else {
        alert('请输入正确手机号码')
        ev.preventDefault()
        _.ckAgree.dom.checked = false
      }
    })

    // _.btnReset.click(async () => {
    //   if (!_.ckAgreement.dom.checked) {
    //     alert('请先阅读并同意协议');
    //     return;
    //   }
    //   const mobile = _.txMobile.val();
    //   if (mobile?.length < 11) {
    //     alert('请输入正确手机号码');
    //     return;
    //   }
    //   const rs = await getCode(mobile);
    //   // const rs = {code: 200, data: {time: Date.now()}};
    //   if (rs.code === 200) {
    //     console.log('getCode go loginCode ', {rs});
    //     // $.nextTick(() => $.go('loginCode', {mobile: '18605812888', time: 120}));
    //     // window.location.hash.replace('!loginCode');
    //     $.go('loginCode', {
    //       mobile,
    //       hash: _from.hash,
    //       from: _from.from,
    //       to: _from.to,
    //       param: _from.param,
    //       time: rs.data.time,
    //     });
    //   }
    // });
  } catch (e) {
    console.error(`bind exp: ${e.message}`)
  }
}

/**
 * 图片拖动验证成功
 * @param {string} mobile
 * @returns
 */
function onSucc(mobile) {
  let R

  try {
    // $.nextTick(() => $.go('loginCode', {mobile: '18605812888', time: 120}));
    // window.location.hash.replace('!loginCode');
    $.go('loginCode', {
      mobile,
      hash: _from.hash,
      from: _from.from,
      to: _from.to,
      param: _from.param,
    })
  } catch (e) {
    console.error(`onSucc exp:${e.message}`)
  }

  return R
}

function show() {
  let {mobile} = _from
  if (!mobile) mobile = store.get('mobile')

  const $tx = _.txMobile
  if (mobile) $tx.val(mobile)
  $tx.dom.focus()

  // 复位验证图
  if (_from.relogin && _verify) _verify.reload()
}

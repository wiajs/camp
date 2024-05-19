// import sha256 from 'crypto-js/sha256';
/* eslint-disable import/no-extraneous-dependencies */
// import sha1 from 'crypto-js/sha1';
// import sha1 from '../util/sha1';

import Sha from 'jssha'
import {log as Log} from '@wiajs/util'

import * as store from '../util/store'
import {get, post} from '../util/tool'

import cfg from '../config/app'

import api from './index'

const log = Log({m: 'api/user'})

function sha1(tx) {
  const sha = new Sha('SHA-1', 'TEXT', {encoding: 'UTF8'})
  sha.update(tx)
  return sha.getHash('HEX')
}

/**
 * 通过手机获得动态密码登录，获得身份token
 */
async function getCode(mobile) {
  let R = ''

  log({mobile}, 'getCode')

  try {
    if (/^1\d{10}$/.test(mobile)) {
      store.set('mobile', mobile)
      const rs = await $.get(`${api.getCode}`, `mobile=${mobile}`)
      if (rs) {
        log({mobile, rs}, 'getCode')
        R = rs
      }
    }
  } catch (e) {
    log.err(e, 'getCode')
  }

  return R
}

/**
 * 登录
 * 通过手机验证码code获取token
 * 如已登录则注销原登录
 * 微信小程序可以直接获取用户手机号码
 * TODO:如该手机在其他服务号绑过，需后台合并user，对应多个siteUser
 * TODO:api响应token过期或不存在，需删除本地token，重新登录在get、post中实现
 * @param {string} sid - siteid
 * @param {string} mobile
 * @param {string} code - 手机验证码
 * @returns {Promise<string>}
 */
async function login(sid, mobile, code) {
  let R = ''

  try {
    const u = $.app.user
    code = sha1(mobile + code)

    log({sid, mobile, code}, 'login')

    const r = await post(api.login, {sid, mobile, code})
    let msg
    if (r) {
      log({token: cfg.token, r}, 'login')
      if (r.code === 200) {
        if (u) await logout() // 注销旧的token
        // alert('登录成功！')
        store.set(cfg.token, r.data.token)
        R = r.data.token
      } else if (r.code === 4039) msg = '错误次数太多，请重新验证！'
      else msg = '验证码不正确，请重新输入！'
    } else msg = '服务器响应超时，请稍后再试'

    if (msg) {
      alert(msg)
      log.error({r}, 'login fail!')
    }
  } catch (e) {
    log.err(e, 'login')
  }

  return R
}

/**
 * 登录后绑定手机
 * 通过手机验证码code获取token
 * TODO:如该手机在其他服务号绑过，需后台合并user，对应多个siteUser
 * TODO:api响应token过期或不存在，需删除本地token，重新登录在get、post中实现
 * @param {string} sid
 * @param {string} mobile
 * @param {string} code
 * @returns {Promise<string>}
 */
async function bindMobile(sid, mobile, code) {
  let R = false

  try {
    const u = $.app.user
    if (!u) return

    code = sha1(mobile + code).toString()
    log(`bindMobile code:${code}`)
    // 已经登录，则绑定用户手机
    const r = await post(api.bindMobile, {sid, mobile, code})
    let msg
    if (r) {
      log({token: cfg.token, r}, 'bindMobile')
      if (r.code === 200) {
        msg = '绑定成功！'
        R = true
      } else if (r.code === 4039) msg = '错误次数太多，请重新验证！'
      else msg = '验证码不正确，请重新输入！'
    } else msg = '服务器响应超时，请稍后再试'

    if (msg) alert(msg)

    if (!R) log.error({r}, 'login fail!')
  } catch (e) {
    log.err(e, 'bindMobile')
  }

  return R
}

/**
 * 登录后绑定studentid
 * @param {number} studentid
 * @returns {Promise<*>}
 */
async function bindStudent(studentid) {
  let R

  try {
    const u = $.app.user
    if (!u) return

    const rs = await post(api.user.bindStudent, {userid: u.id, studentid})
    log({rs}, 'bindStudent')
    if (rs && rs.code === 200) R = rs.data
  } catch (e) {
    log.err(e, 'bindStudent')
  }

  return R
}

/**
 * 注销登录
 * @returns {Promise<string>}
 */
async function logout() {
  let R = false

  try {
    const u = $.app.user
    if (!u) return

    const r = await post(api.logout)
    let msg
    if (r) {
      log({token: cfg.token, r}, 'logout')
      if (r.code === 200) {
        store.set(cfg.token, '')
        msg = '注销成功！'
        R = true
      }
    } else {
      log.error({r}, 'login fail!')
      msg = '服务器响应超时，请稍后再试！'
    }

    // if (msg) alert(msg)
  } catch (e) {
    log.err(e, 'login')
  }

  return R
}

/**
 * 更新用户信息
 * @param {*} r
 * @returns
 */
async function update(r) {
  let R = ''

  try {
    const url = api.register
    const rs = await post(url, r)
    if (rs) {
      log({rs}, 'update')
      if (rs.code === 200) {
        R = rs.data
      } else log.error({r}, 'update fail!')
    } else log.error('update fail, no reply data!')
  } catch (e) {
    log.err(e, 'update')
  }
  return R
}

/**
 * 获取用户信息
 * @returns {Promise<*>} 0 - 没网
 */
async function getUser() {
  let R = null
  try {
    const rs = await post(`${api.userInfo}`)
    log({rs}, 'getUser')
    if (rs && rs.code === 200) R = rs.data
  } catch (e) {
    if (e.status === 0) R = 0
    log.err(e, 'getUser')
  }
  return R
}

/**
 * 获取有效用户身份令牌和用户信息（头像、昵称、手机号码等）
 * 用户信息保存在 $.app.user 备用！
 * 优先本地获取，本地过期，或服务器user无法获取，重新获取token
 * 服务器返回token无法获取用户信息，作为无效token，返回空。
 * 微信进入，有sid和code，可获取用户头像和昵称
 * 如本地有缓存token，用户无头像、昵称，则重新通过微信code、sid获取
 * 微信后台通过code获取openid，获取微信用户信息，保存到数据库
 * 微信获取图像、昵称，目前只有通过userinfo授权，否则仅获取openid
 * @param {Number} sid
 * @param {String} code
 */
async function getToken(sid, code) {
  let R = ''
  try {
    // 本地存储中获取token
    let token = store.get(cfg.token)
    log({key: cfg.token, token}, 'getToken')

    if (token) {
      const u = await getUser()
      log({u}, 'getToken')

      if (u) {
        $.app.user = u
        R = token
      } else if (u === 0) {
        R = token
        log.error('offline!')
      } else {
        store.remove(cfg.token)
        log.error('token invalid, getToken again!')
      }
    }

    // 重新获取 token
    if (!R && sid && code) {
      // 通过code获取token
      log({sid, code, url: api.token}, 'getToken')

      // 微信获取token
      const rs = await $.post(`${api.token}`, {sid, code})
      if (rs) {
        // console.log('getToken', {rs});
        if (rs.code === 200 && rs.data?.token) {
          token = rs.data.token
          store.set(cfg.token, token)
          const u = await getUser()
          if (u) {
            $.app.user = u
            R = token
          } else {
            store.remove(cfg.token)
            log.error({rs}, 'getUser fail, remove token!')
          }
        } else log.error({rs}, 'getToken fail!')
      }
      // new Error('获取身份失败,请退出重新进入或联系客服!'), '');
    }

    $.app.token = R
  } catch (e) {
    log.err(e, 'getToken')
  }

  return R
}

export {getCode, getToken, login, logout, bindMobile, bindStudent, getUser, update}

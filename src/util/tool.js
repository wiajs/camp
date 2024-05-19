import * as store from './store'
import cfg from '../config/app'

/**
 * 带token提交数据
 * TODO:api响应token过期或不存在，需删除本地token，重新登录在get、post中实现
 * @param {String} url 网址
 * @param {Object} data 数据
 */
function get(url, data) {
  const token = store.get(cfg.token)
  return $.get(url, data, {'x-wia-token': token})
}

/**
 * 带token提交数据
 * TODO:api响应token过期或不存在，需删除本地token，重新登录在get、post中实现
 * @param {String} url 网址
 * @param {Object} data 数据
 */
function post(url, data) {
  const token = store.get(cfg.token)
  return $.post(url, data, {'x-wia-token': token})
}

/**
 * 金额千位分隔符字符串转换为 Number，单位分
 * 避免运算误差！
 * @param {String} v 金额千位分隔符金额字符串
 * @returns Number 整型金额，单位分
 */
function toFen(v) {
  let R = v
  if (typeof v === 'string') R = Math.round(Number.parseFloat(v.replaceAll(',', '')) * 100)
  return R
}

/**
 * 金额千位分隔符字符串
 * @param {Number} v 金额，单位分
 * @returns
 */
function toYuan(v) {
  let R = v

  if (typeof v === 'number') {
    v = `${(v * 0.01).toFixed(2)}` // 分到元
    // 千分符的正则
    const reg = v.includes('.') ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g
    R = v.replace(reg, '$1,') // 千分位格式化
  }

  return R
}

/**
 * 延迟promise，可以 await 或 then
 * @param ms
 */
function delay(ms) {
  return new Promise(succ => {
    setTimeout(succ, ms)
  })
}

/**
 * 简单异步函数转换为promise函数
 * @param {*} f
 * @param {*} type
 * 0：一个回调，一个参数，无失败参数，仅仅返回执行结果
 * 1: 一个回调函数，第一个参数为 err，第二个参数为成功结果
 * 2：两个回调函数，第一个为成功回调，第二个为失败回调
 * 3：两个回调函数，第一个为失败回调，第二个为成功回调
 * @returns
 */
function promisify(f, type = 1) {
  return (...arg) =>
    new Promise((res, rej) => {
      if (type == null || type === 1)
        f(...arg, (err, rs) => {
          if (err) rej(err)
          else res(rs)
        })
      else if (type === 0) f(...arg, rs => res(rs))
      else if (type === 2)
        f(
          ...arg,
          rs => res(rs),
          rs => rej(rs || new Error('reject'))
        )
      else if (type === 3)
        f(
          ...arg,
          rs => res(rs),
          rs => rej(rs || new Error('reject'))
        )
    })
}

export {get, post, toYuan, toFen, promisify, delay};

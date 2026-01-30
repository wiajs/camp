/**
 * 本地存储
 */
import {log as Log} from '@wiajs/util'

const log = Log({m: 'util/store'})

/** @type {*} */
const {$} = window

/**
 * 本地存储应用前缀，避免不同应用互相干扰
 * @returns
 */
function pre() {
  return `${$.app.owner}/${$.app.name}`
}

/**
 * 设置当前应用或root的本地存储，root为全局共享，应用中切勿轻易操作root存储
 * @param {string} key
 * @param {*} val
 * @param {number} [tm=525_600] - 过期时长(单位分)，180天:259,200分，365天:525,600
 * @param {boolean} [root=false] - 不添加当前应用前缀，存储到wia根路径，仅限共享的登录token
 */
function set(key, val, tm = 525_600, root = false) {
  try {
    if (!root) key = `${pre()}/${key}`
    if ($.isObject(val)) {
      val.__obj__ = true
      $.store.set(key, JSON.stringify(val), tm)
    } else $.store.set(key, val, tm)

    log({key, val}, 'set')
  } catch (e) {
    log.err(e, 'set')
  }
}

/**
 * 获取当前应用或root的本地存储，root为全局共享，应用中切勿轻易操作root存储
 * @param {string} key
 * @param {boolean} [root=false] - 添加当前应用前缀
 * @returns
 */
function get(key, root = false) {
  let R
  try {
    if (!root) key = `${pre()}/${key}`
    const tx = $.store.get(key)
    R = tx
    if (typeof tx === 'string' && tx?.includes('__obj__')) {
      R = JSON.parse(tx)
      delete R.__obj__
    }
    // log.debug({key, R}, 'get');
  } catch (e) {
    log.err(e, 'get')
  }

  return R
}

/**
 * 删除当前应用或root的本地存储，root为全局共享，应用中切勿轻易操作root存储
 * @param {string} key
 * @param {boolean} [root=false] - 添加当前应用前缀
 * @returns {*}
 */
function remove(key, root = false) {
  let R
  if (!root) key = `${pre()}/${key}`
  R = $.store.remove(key)
  log({key, R}, 'get')
  return R
}

export {set, get, remove}

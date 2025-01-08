/**
 * 本地存储
 */
import {log as Log} from '@wiajs/util'

const log = Log({m: 'util/store'})

/** @type {*} */
const {$} = window

function pre() {
  return `${$.app.owner}/${$.app.name}`
}

/**
 *
 * @param {string} key
 * @param {*} val
 */
function set(key, val) {
  try {
    key = `${pre()}/${key}`
    if ($.isObject(val)) {
      val.__obj__ = true
      $.store.set(key, JSON.stringify(val))
    } else $.store.set(key, val)

    log({key, val}, 'set')
  } catch (e) {
    log.err(e, 'set')
  }
}

/**
 *
 * @param {string} key
 * @returns
 */
function get(key) {
  let R
  try {
    key = `${pre()}/${key}`
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

function remove(key) {
  let R
  key = `${pre()}/${key}`
  R = $.store.remove(key)
  log({key, R}, 'get')
  return R
}

export {set, get, remove}

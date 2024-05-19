/**
 * 本地存储
 */
import {log as Log} from '@wiajs/util';

const log = Log({m: 'util/store'});

/** {*} */
const {$} = window;

function pre() {
  return `${$.app.cfg.owner}/${$.app.cfg.name}`;
}

/**
 *
 * @param {*} key
 * @param {*} val
 */
function set(key, val) {
  try {
    key = `${pre()}/${key}`;
    if ($.isObject(val)) $.store.set(key, JSON.stringify(val));
    else $.store.set(key, val);

    log({key, val}, 'set');
  } catch (e) {
    log.err(e, 'set');
  }
}

function get(key) {
  let R;
  try {
    key = `${pre()}/${key}`;
    R = $.store.get(key);
    // log.debug({key, R}, 'get');
  } catch (e) {
    log.err(e, 'get');
  }

  return R;
}

function remove(key) {
  let R;
  key = `${pre()}/${key}`;
  R = $.store.remove(key);
  log({key, R}, 'get');
  return R;
}

export {set, get, remove};

import {Page} from '@wiajs/core'
import {login, getCode, getUser} from '../api/user'

const _name = 'loginCode'
const _title = '登录验证'
const _from = {}
let _txs
let _timer = null

/** @type {*} */
let _

export default class LoginCode extends Page {
  constructor(opt) {
    opt = opt || {}
    super(opt.app || $.app, opt.name || _name, opt.title || _title)
    console.log(`${_name} constructor:`, {opt})
  }

  load(param) {
    super.load(param)
    console.log(`${_name} load:`, {param})
  }

  // 在已就绪的视图上绑定事件
  ready(v, param, bk) {
    super.ready(v, param, bk)
    _ = v
    console.log(`${_name} ready:`, {v, param})
    bind()
  }

  show(v, param) {
    super.show(v, param)
    $.assign(_from, param)
    show(param)
  }

  hide(v) {
    console.log(`${_name} hide:`, {v})
    stopTime()
  }
}

/**
 * 绑定事件
 */
function bind() {
  // _txs = _.classses('code');
  // _txs[0].focus();
  _.txCode.focus()

  // bindInput();
  _.txCode.dom.oninput = function (ev) {
    const code = _.txCode.val()
    console.log('input', {code, ev})
    // if (ev.keyCode >= 48 && ev.keyCode <= 57) {
    // _txs.each((i, tx) => {
    //   code += tx.value;
    // });

    if (code.length === 4) setTimeout(() => dologin(code), 100)
  }

  _.btnGetCode.click(() => {
    clear()
    _.txTiming.html('60 秒后重新获取验证码')
    // startTime();
    _.txTiming.show()
    _.btnGetCode.hide()

    $.back()

    // const {mobile} = _from;
    // getCode(mobile);
  })
}

/**
 * 页面恢复到初始化状态
 */
function show(param) {
  _.btnGetCode.hide()

  const {mobile} = _from
  if (mobile) {
    _.txHeader.html(
      `验证码已发送至 ${mobile.substr(0, 3)} ${mobile.substr(3, 4)} ${mobile.substr(7, 4)}`
    )
  }

  clear()

  _.txTiming.html('60 秒后重新获取验证码')
  startTime()
}

/**
 * 清理残留
 */
function clear() {
  // _txs.each((i, tx) => {
  //   // tx.style.color = '#fff';
  //   tx.value = '';
  // });
  // _txs[0].focus();
  _.txCode.val('')
  _.txCode.focus()
}

/**
 * 绑定输入事件,支持粘贴,比keyup好
 */
function bindInput() {
  // _txs.each((i, tx) => {
  //   tx.idx = i;
  //   // tx.setAttribute('readonly', true);
  //   tx.oninput = function (ev) {
  //     console.log('input', {val: this.value, ev});
  //     // if (ev.keyCode >= 48 && ev.keyCode <= 57) {
  //     const val = this.value;
  //     if (val.length > 1) {
  //       // for (let j = 0; j < _txs.length; j++) {
  //       //   if (val.length > j) {
  //       //     _txs[j].value = val[j];
  //       //   }
  //       // }
  //       if (val.length === _txs.length) {
  //         // _txs[val.length - 1].focus();
  //         setTimeout(() => dologin(), 1000);
  // }
  //     } else if (val.length > 0) {
  //       const next = this.idx + 1;
  //       if (this.idx === 3) setTimeout(() => dologin(), 0);
  //       else {
  //         // _txs[next].removeAttribute('readonly');
  //         _txs[next].focus();
  //       }
  //     }
  //     // }
  //   };
  // });
  // _txs[0].removeAttribute('readonly');
}

/**
 * 启动倒计时器
 */
function startTime() {
  let time = 60
  function timing() {
    try {
      time--
      if (time === 0) {
        stopTime()
        _.txTiming.hide()
        _.btnGetCode.show()
      } else {
        _.txTiming.html(`${time} 秒后重新获取验证码`)
      }
    } catch (ex) {
      stopTime()
      console.log('startTime ', {exp: ex.message})
    }
  }

  _timer = setInterval(timing, 1000)
}

/**
 * 停止计时
 */
function stopTime() {
  clearInterval(_timer)
}

/**
 * 调用login接口
 */
async function dologin(code) {
  try {
    // 手机验证码登录或绑定手机
    const r = await login($.app.sid, _from.mobile, code)

    // 重新获取用户
    if (r) {
      stopTime()
      if (typeof r === 'string') $.app.token = r
      $.app.user = await getUser()

      if (_from.to) $.go(_from.to, _from.param)
      // 打开指定 hash
      // 先加载master页面，由master加载detail页面 $.go('pay/index');
      else if (_from.hash) $.go('master', {path: _from.hash, param: _from.param})
      else if (!_from.hash) $.go('master', {path: 'class/index'})
    } else clear()
  } catch (e) {
    alert('验证码不正确，登录失败！')
    clear()
  }
}

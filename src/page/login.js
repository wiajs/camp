import {Page} from '@wiajs/core';
import Verify from '@wiajs/ui/verify';
import * as store from '../util/store';
// import {getCode} from '../api/user';

const _list = {
  cache: {},
  data: null,
};

/** @type {*} */
let _ = null;
const _from = {};
const _name = 'login';
const _title = '登录';

/** @type {Verify} */
let _verify;

export default class Login extends Page {
  constructor(opt) {
    opt = opt || {};
    super(opt.app || $.app, opt.name || _name, opt.title || _title);
    console.log('login constructor:', {opt, cfg: this.cfg});
    // $.app.loadModule(Input); // 动态加载Input组件模块，否则只有样式，没有特效
  }

  load(param) {
    super.load(param);
    console.log('login load:', {param});
  }

  // 在已经加载的视图上操作
  ready(v, param, bk) {
    super.ready(v, param, bk);
    _ = v;
    console.log('login ready...:', {param, back: bk});
    init(this);
    bind(this);
  }

  show(v, param) {
    super.show(v, param);
    const lastData = $.lastPage && $.lastPage.data;
    console.log('login show:', {param, lastData});
    $.assign(_from, param);
    show(param);
  }

  back(v, param) {
    super.back(v, param);
    _verify?.reload();
  }
}

/**
 * 初始化
 * @param {Login} pg
 */
function init(pg) {
  let R;

  try {
    /** @type {string|number} */
    // eslint-disable-next-line
    let width = getComputedStyle($('.item-inner')[0]).width;
    if (width && width !== '300px') width = Number.parseInt(width.replace('.px', ''));

    _verify = new Verify(pg, {
      el: '.verify',
      url: 'https://test.lianlian.pub/auth',
      width, // iPhone 需缩小避免页面左右滑动
      // url: 'img/verify',
    });

    _verify.onSuccess = () => {
      console.log('success');
      onSucc(_verify.mobile);
    };
    _verify.onFail = () => {
      console.log('fail');
    };
    _verify.onRefresh = () => {
      console.log('refresh');
    };
  } catch (e) {
    console.error(`init exp:${e.message}`);
  }

  return R;
}

/**
 * 绑定事件
 * @param {Login} pg
 */
function bind(pg) {
	try {
    _.class('checkbox').click(async ev => {
      // console.log(_.ckAgree.val(_));
      const mobile = _.txMobile.val();
      if (/1\d{10}/.test(mobile)) {
        store.set('mobile', mobile);
	
        if (_.ckAgree.dom.checked) _.liVerify.hide();
        else {
          // 通过手机号码加载验证图片
          if (!_verify.status) await _verify.loadImg(mobile);
          _.liVerify.show();
    }
      } else {
      alert('请输入正确手机号码');
        ev.preventDefault();
        _.ckAgree.dom.checked = false;
      }
    });

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
    console.error(`bind exp: ${e.message}`);
  }
    }

/**
 * 图片拖动验证成功
 * @param {string} mobile
 * @returns
 */
function onSucc(mobile) {
  let R;

  try {
      // $.nextTick(() => $.go('loginCode', {mobile: '18605812888', time: 120}));
      // window.location.hash.replace('!loginCode');
      $.go('loginCode', {
        mobile,
        hash: _from.hash,
        from: _from.from,
        to: _from.to,
        param: _from.param,
  });
	} catch(e) {
    console.error(`onSucc exp:${e.message}`);
	}

  return R;
}

function show(param) {
  let {mobile} = param;
  if (!mobile) mobile = store.get('mobile');

  const $tx = _.txMobile;
  if (mobile) $tx.val(mobile);
  $tx.dom.focus();
}

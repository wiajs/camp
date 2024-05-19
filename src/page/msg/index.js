import {Page} from '@wiajs/core';
import Toolbar from '../../part/toolbar';

// import {set, get} from '../common/store';

// import {getView, userInfo} from '../../util/api';
// import {bottomToolbars} from '../comn/toolbar';
// import {judgRole} from '../comn/common';
// import {layer, toast, loading} from '../../util/dialog';

/* global
 * lkHome, lkMine
 */

const _name = 'index';
const _title = '消息';

// 全局数据
const _from = {};
let _;

export default class Index extends Page {
  constructor(opt) {
    opt = opt || {};
    super(opt.app || $.app, opt.name || _name, opt.title || _title);
    console.log(`${_name} constructor:`, {opt});
  }

  load(param) {
    super.load(param);
    console.log(`${_name} load:`, {param});
  }

  // 在已就绪的视图上绑定事件
  ready(pg, param, bk) {
    super.ready(pg, param, bk);
    _ = pg;
    const toolbar = new Toolbar(this, {
      el: _.class('toolbar-bottom'),
      active: 'btnMsg',
    });

    bind();
  }

  show(view, param) {
    super.show(view, param);
    $.assign(_from, param);
    show();
  }

  back(pg, param) {
    super.back(pg, param);
    console.log(`${_name} back:`, {pg, param});
  }

  hide(pg) {
    console.log(`${_name} hide:`, {pg});
  }
}

function bind() {
  _.name('dvSel').click(ev => {
    const lk = $(ev.target).closest('.item-link');
    const lb = lk.dom.innerText;
    // const lb = lk.findNode('.item-title').html();
    if (lk.attr('name') && lb) $.go('./list', {src: lk.attr('name'), lb});
  });
  _.name('dvApp').click(ev => {
    const lk = $(ev.target).closest('.item-link');
    const id = lk.attr('appid');
    const lb = lk.findNode('.item-title').prop('firstChild').nodeValue;

    if (id && lb) $.go('./view', {src: 'view', lb, id});
  });
}

async function show(param) {
  // 测试数据;
  const rs = {
    data: [
      {
        id: 1,
        icon: './img/1.png',
        cat: '办公',
        title: '考勤打卡',
        count: 5800,
        brief: '通过卫星定位实现上下班考勤打卡',
      },
      {
        id: 2,
        icon: './img/2.png',
        cat: '办公',
        title: '签到',
        count: 2900,
        brief: '通过卫星定位实现外勤轨迹管理',
      },
    ],
  };
  // debugger;
  // const rs = await _api.find({
  //   cdt: {pid: 1}, // 查询条件，pid: 1 表示限定自己，如果要看别人的，需要权限
  //   limit: 50, // 一次查询返回多少条数据
  //   skip: 0, // 后续查询，跳过条数
  //   sort: '-addTime', // 最新的在前面
  // });
  // const rs = await _api.get({id: 1});

  if (rs.data) {
    // rs.data.forEach(r => {
    //   if (r.brief) r.brief = r.brief;
    // });
    _.name('dvApp').setView('app', rs.data);
  }
}

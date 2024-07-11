/*
 * 项目接口配置文件
 */
import cfg from '../config/app'

const api = {
  token: 'auth/login',
  userinfo: 'userinfo',
  wxqrcode: 'wx/wxqrcode',
  paysign: 'pay/sign',

  userInfo: 'user/info',
  getCode: 'auth/getCode', // 获取登录短信验证码
  bindMobile: 'auth/bindMobile', // 通过短信验证码绑定手机
  bindUser: 'user/bind', // 通过短信验证码绑定用户
  login: 'auth/login', // 获取身份token
  logout: 'auth/logout', // 登出
  register: 'user/reg', // 注册
  sms: 'user/sms', // 短信验证码登陆获取，调试
  getsms: 'user/getsms', // 登录短信验证码
  checkmobile: 'user/checkmobile', // 短信验证码
  img: 'http://localhost:3000/img/upload', // 图片上传

  user: {
    userInfo: 'user/info',
    bindUser: 'user/bind', // 通过短信验证码绑定用户
    update: 'user/up', // 注册
    register: 'user/reg', // 注册
    bindStudent: 'user/bindStudent', // 绑定sutdentid
  },
  camp: {
    challById: 'camp/challById',
    courseByName: 'camp/courseByName',
    courseById: 'camp/courseById',
    addStudent: 'camp/addStudent',
    upStudent: 'camp/upStudent',
    quStudent: 'camp/quStudent',
    findExam: 'camp/findExam',
    getExam: 'camp/getExam',
    addExam: 'camp/addExam',
    getCollege: 'camp/getCollege',
    getMajor: 'camp/getMajor',
  },

  shareHint: 'share/hint', // 分享的提示
  shareJoin: 'share/join', // 创建分享 seed=SEEDID

  seedAdd: 'seed/add', // 创建种子 prodid=PRODID
  seedDetail: 'seed/detail', // 创建种子 seed=SEEDID
  sharePush: 'share/push', // 推送分享 seed=SEEDID

  reviewAdd: 'review/add',
  reviewUpdate: 'review/update',
  reviewSearch: 'review/search',
  reviewDetail: 'review/detail',

  shareAdd: 'share/add',
  shareUpdate: 'share/update',
  shareList: 'share/list',
  shareDetail: 'share/detail',

  shopAdd: 'shop/add',
  shopUpdate: 'shop/update',
  shopList: 'shop/list',
  shopSearch: 'shop/search',
  shopDetail: 'shop/detail',
  shopHot: 'shop/hot',

  prodList: 'prod/list', // 商品列表
  prodAdd: 'prod/add', // 商品新增
  prodUpdate: 'prod/update', // 商品新增
  prodUpload: 'prod/upload', // 商品新增
  prodCat: 'prod/cat', // 类目

  wxSign: 'wx/jsapisign', // 微信网页授权签名

  swipe: 'prod/swipe', // 热门推荐
  search: 'prod/search', // 商品列表
  detail: 'prod/detail', // 商品详情

  addrAdd: 'addr/add', // 地址管理
  addrList: 'addr/list', // 地址管理

  orderAdd: 'order/add', // 创建订单
  orderSearch: 'order/search', // 订单搜索
  orderUpdate: 'order/update', // 更新订单
  getprice: 'order/getprice', // 获取价格
  orderList: 'order/list', // 订单列表
  orderExcel: 'order/excel', // 订单导出
  shipinfo: 'order/shipinfo', // 推送运单信息

  couponSearch: 'coupon/search', // 优惠券搜索
  couponDetail: 'coupon/detail', // 优惠券详情
  couponUpdate: 'coupon/update', // 优惠券更新

  couponEnjoy: 'coupon/enjoy', // 专享优惠券
  shareContent: 'share/content', // 分享内容
  showqrcode: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=', // 查询订单

  shopexcel: 'excel/shopexcel', // 店铺表
  prodexcel: 'excel/prodexcel', // 商品表
  shipexcel: 'excel/shipexcel', // 运费表
  prodseq: 'excel/prodseq', // 运费表

  people: 'people/search', // 人脉

  flight: {
    // , flightLink: 'html5/flightmb/flightmb.aspx' //查询订单 http://59.42.83.46:8012
    // , flightLink: 'http://test.ebsp.cn/icbc/skipbooking.aspx' //查询订单
    link: 'https://app.nuoya.io/flight/html5/skipbooking.aspx', // 查询订单
    token: 'https://flight.nuoya.io:8012/icbc/ajax.ashx',
    api: 'https://flight.nuoya.io:8012/icbc/xhService.ashx',
    flightOrder: '',
  },

  cdn: 'https://cos.nuoya.io/mall/prodDec/', // 腾讯云地址

  // --------------
  // 上传
  h5Uploader: 'uploader/h5',
  bookAdd: 'book/add',
  bookSearch: 'book/search',
  bookList: 'book/list',
  lessonAdd: 'lesson/add',
}

Object.keys(api).forEach(k => {
  // 二级对象嵌套
  if ($.isObject(api[k])) {
    const o = api[k]
    Object.keys(o).forEach(j => {
      if (!o[j].startsWith('https://') && !o[j].startsWith('https://')) o[j] = `${cfg.api}/${o[j]}`
    })
  } else if (!api[k].startsWith('https://') && !api[k].startsWith('https://')) {
    api[k] = `${cfg.api}/${api[k]}`
  }
})

export default api

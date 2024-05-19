/** @jsx jsx */
import {Page, jsx} from '@wiajs/core'
import Msgbar from '@wiajs/ui/messagebar'
import Msg from '@wiajs/ui/messages'
import Ws from '@wiajs/lib/ws'
import cfg from '../../config/app'
import Navbar from '../../part/navbar'

const _name = 'chat'
const _title = '聊天'

// 全局数据
const _from = {}

/** @type {*} */
let _

/** @type {Msg} */
let _msg

/** @type {Msgbar} */
let _bar

/** @type {Ws} */
let _ws

const images = [
  'img/cats-300x300-1.jpg',
  'img/cats-200x300-2.jpg',
  'img/cats-400x300-3.jpg',
  'img/cats-300x150-4.jpg',
  'img/cats-150x300-5.jpg',
  'img/cats-300x300-6.jpg',
  'img/cats-300x300-7.jpg',
  'img/cats-200x300-8.jpg',
  'img/cats-400x300-9.jpg',
  'img/cats-300x150-10.jpg',
]

const people = [
  {
    name: 'Kate Johnson',
    avatar: 'img/people-100x100-9.jpg',
  },
  {
    name: 'Blue Ninja',
    avatar: 'img/people-100x100-7.jpg',
  },
  {
    name: 'Walter Yu',
    avatar: 'img/walter.jpg',
  },
]

const answers = [
  'Yes!',
  'No',
  'Hm...',
  'I am not sure',
  'And what about you?',
  'May be ;)',
  'Lorem ipsum dolor sit amet, consectetur',
  'What?',
  'Are you sure?',
  'Of course',
  'Need to think about it',
  'Amazing!!!',
]

let responseInProgress = false

export default class Chat extends Page {
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
  ready(view, param, bk) {
    super.ready(view, param, bk)
    _ = view
    init(this)
    bind()
  }

  show(view, param) {
    super.show(view, param)
    $.assign(_from, param)
    show()
  }

  back(view, param) {
    super.back(view, param)
    console.log(`${_name} back:`, {pg: view, param})
  }

  hide(view) {
    console.log(`${_name} hide:`, {pg: view})
  }
}

/**
 * 初始化
 * @param {Page} pg
 */
function init(pg) {
  try {
    const nav = new Navbar(this, {
      el: _.class('navbar'),
      // active: 'btnHome',
    })

    _ws = new Ws(pg, {url: cfg.ws.url, pid: '10088888888'}) // WY:30950854 / YY:87982526;

    _bar = new Msgbar(pg, {
      el: _.class('.messagebar'),
      attachments: [],
    })

    debugger
    _msg = new Msg(pg, {
      el: _.class('.messages'),
      firstMessageRule: (message, previousMessage, nextMessage) => {
        if (message.isTitle) return false
        if (
          !previousMessage ||
          previousMessage.type !== message.type ||
          previousMessage.name !== message.name
        )
          return true
        return false
      },
      lastMessageRule: (message, previousMessage, nextMessage) => {
        if (message.isTitle) return false
        if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name)
          return true
        return false
      },
      tailMessageRule: (message, previousMessage, nextMessage) => {
        if (message.isTitle) return false
        if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name)
          return true
        return false
      },
      on: {
        change: () => {
          console.log('Textarea value changed')
        },
      },
    })

    // _.dvSheet::setView(images); // 使用模板生成页面html
  } catch (ex) {
    console.error('init exp:', ex.message)
  }
}

/**
 * 事件绑定
 */
function bind() {
  _.btnEmoji.click(ev => {
    sheetToggle()
    // _ws.state(Ws.State.online, '天气不错');
  })

  _ws.on('msg', data => {
    try {
      const d = JSON.parse(data)
      if (d?.M) showMsg(d.M)
    } catch (ex) {
      showMsg(data)
      // console.error('ws.onmsg exp:', ex.message);
    }
  })

  _bar
    .on('change', () => {
      console.log('msgbar change')
    })
    .on('attachmentdelete', () => {
      console.log('msgbar attachmentdelete')
      deleteAttachment()
    })

  // _.btnSheet.click(ev => {
  //   // ev.preventDefault(); // 阻止事件冒泡，避免事件穿透，选择到图片！
  //   sheetToggle();
  // });

  _.btnSend.click(
    /** @param {*} ev */ ev => {
      sendMessage()
    }
  )

  _.dvSheet.find('label').change(ev => {
    console.log('sheetImg change')
    handleAttachment(ev)
  })
}

/**
 * 页面显示
 * @param {*} param
 */
async function show(param) {
  const v = ''
}

/**
 * 从输入框获取输入信息、或者图片层选择图片，发送
 * @returns
 */
function sendMessage() {
  const text = _bar.getValue().replace(/\n/g, '<br />').trim()
  const msgToSend = []
  _bar.attachments.forEach(attachment => {
    const size = attachment.split('img/cats-')[1].split('-')[0].split('x')
    const image = (
      <img src={attachment} style={`width:${size[0] / 2}px; height:${size[1] / 2}px`}></img>
    )
    msgToSend.push({image})
  })

  if (text.trim().length) {
    msgToSend.push({text})
  }

  // Reset attachments
  _bar.attachments = []
  checkAttachments()
  // Hide sheet
  _bar.sheetHide()
  // Uncheck selected images in sheet
  _bar.$sheetEl.find('input').prop('checked', false)
  // Clear area
  _bar.clear()
  // Focus area
  if (text.length) _bar.focus()
  // Exit when nothing to send
  if (!msgToSend.length) return

  debugger
  // Send message
  _msg.addMessages(msgToSend)

  // 模拟回应
  if (responseInProgress) return

  responseInProgress = true

  // 模拟延时回应
  setTimeout(function () {
    const answer = answers[Math.floor(Math.random() * answers.length)]
    const person = people[Math.floor(Math.random() * people.length)]
    _msg.showTyping({
      header: `${person.name} is typing`,
      avatar: person.avatar,
    })
    setTimeout(function () {
      _msg.addMessage({
        text: answer,
        type: 'received',
        name: person.name,
        avatar: person.avatar,
      })
      _msg.hideTyping()
      responseInProgress = false
    }, 1000)
  }, 500)
}

/**
 * 显示消息
 * @param {string} msg
 */
function showMsg(msg) {
  const person = people[Math.floor(Math.random() * people.length)]
  _msg.showTyping({
    header: `${person.name} is typing`,
    avatar: person.avatar,
  })
  _msg.addMessage({
    text: msg,
    type: 'received',
    name: person.name,
    avatar: person.avatar,
  })
  _msg.hideTyping()
  responseInProgress = false
}

/**
 * 切换底部图片层
 */
function sheetToggle() {
  _bar.sheetToggle()
}

function deleteAttachment(e, index) {
  const image = _bar.attachments.splice(index, 1)[0]
  _bar.renderAttachments()
  checkAttachments()
  // Uncheck in sheet
  const imageIndex = images.indexOf(image)
  _.find('.messagebar-sheet .checkbox').eq(imageIndex).find('input').prop('checked', false)
}

function handleAttachment(e) {
  const index = $(e.target).parents('label.checkbox').index()
  const image = images[index]
  if (e.target.checked) {
    // Add to attachments
    _bar.attachments.unshift(image)
  } else {
    // Remove from attachments
    _bar.attachments.splice(_bar.attachments.indexOf(image), 1)
  }
  _bar.renderAttachments()
  checkAttachments()
}

function checkAttachments() {
  if (_bar.attachments.length > 0) {
    _bar.attachmentsShow()
    _bar.setPlaceholder('Add comment or Send')
  } else {
    _bar.attachmentsHide()
    _bar.setPlaceholder('Message')
  }
}

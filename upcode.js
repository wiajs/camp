/**
 * 发布上传
 */
const _ = require('lodash')
const util = require('util')
const path = require('path')
const fs = require('fs')
const zlib = require('zlib')
const axios = require('axios')
const FormData = require('form-data')

const _dir = '../code'
const _url = 'http://localhost:3000/code/upload'
/**
 * read js/html/css file
 * @param {*} f
 */
function readCode(dir, f) {
  try {
    return new Promise((res, rej) => {
      const file = path.resolve(dir, './dist', f)
      console.log('readCode', {dir, file})
      if (fs.existsSync(file))
        fs.readFile(file, 'utf8', (err, data) => {
          if (err) rej(file, err)
          else res({f, data})
        })
    })
  } catch (ex) {
    console.log('readCode', {exp: ex.message})
  }
}

/**
 * 更新文件，压缩后上传服务器，用于发布代码
 * @param {*} files
 * js:
 *   - page/home.js
 * html:
 *   - page/home.html
 * css:
 *   - page/home.css
 */
async function getData(dir, files) {
  let R = null

  console.log('getDate', {dir, files})

  const cs = {}
  try {
    const pms = []
    files.forEach(async f => {
      pms.push(readCode(dir, f))
    })
    const rs = await Promise.all(pms)
    // console.log('getDate', {rs});

    rs.forEach(r => {
      console.log('getData', {f: r.f, data: r.data.length})
      cs[r.f] = r.data
    })
    const code = JSON.stringify(cs)
    if (!_.isEmpty(code)) {
      // 压缩
      const buf = await util.promisify(zlib.gzip)(code)
      console.log(
        'len:%d->%d(%d)',
        code.length / 1000,
        buf.length / 1000,
        (buf.length * 100) / code.length
      )

      R = buf
    }
  } catch (ex) {
    console.log('getData', {exp: ex.message})
  }

  return R
}

/**
 * 更新文件，压缩后上传服务器，用于发布代码
 * @param {*} ower app's ower
 * @param {*} name app's name
 * @param {*} dir code dir
 * @param {*} us update files
 * js:
 *   - page/home.js
 * html:
 *   - page/home.html
 * css:
 *   - page/home.css
 */
async function upload(ower, name, dir, us) {
  const R = {}
  try {
    const form = new FormData()
    if (!_.isEmpty(us.js)) {
      const buf = await getData(dir, us.js)
      buf && form.append(`${ower}/${name}/js.zip`, buf)
    }
    if (!_.isEmpty(us.html)) {
      const buf = await getData(dir, us.html)
      buf && form.append(`${ower}/${name}/html.zip`, buf)
    }
    if (!_.isEmpty(us.css)) {
      const buf = await getData(dir, us.css)
      buf && form.append(`${ower}/${name}/css.zip`, buf)
    }

    const rsp = await axios.post(_url, form, {
      timeout: 60000,
      headers: form.getHeaders(),
      maxContentLength: Infinity, // 2000000,
      maxBodyLength: Infinity, // 200000000,

      // 添加上传进度监听事件
      onUploadProgress: e => {
        console.log(`${(e.loaded * 100) / e.total}%`)
      },
    })

    console.log(rsp)

    // console.log('status: ' + resp.statusCode);
    // console.log('headers: ' + JSON.stringify(resp.headers));
    // console.log('body:%s', body);
  } catch (ex) {
    console.log('upload', {exp: ex.message})
  }
}

// upload('page/home.js');
module.exports = {upload}

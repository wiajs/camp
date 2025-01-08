/**
 * Server 标准增、删、改、查接口
 */
import {log as Log} from '@wiajs/util'
import {post} from './tool'
import cfg from '../config/app'

const log = Log({m: 'util/store'})

export default class Api {
  /**
   * 接口名称
   * @param {string} name
   */
  constructor(name) {
    this.name = name
    this.url = `${cfg.api}/${name}`
  }

  /**
   * 新增记录
   * @param {*} r 数据对象
   * @returns
   */
  async add(r) {
    let R
    try {
      const rs = await post(`${this.url}/add`, r)
      console.log(`add ${this.name} rs:%o`, rs)
      if (rs && rs.code === 200) R = rs.data
    } catch (e) {
      console.log(`add exp:${e.message}`)
    }
    return R
  }

  /**
   * 更新单条数据
   * @param {*} q 查询条件
   * @param {*} r 更新字段
   * @returns
   */
  async up(q, r) {
    let R = null

    try {
      const rs = await post(`${this.url}/up`, {q, r})
      console.log(`up ${this.name}`, {rs})
      if (rs && rs.code === 200) R = rs.data
    } catch (e) {
      console.error(`up exp:${e.message}`)
    }

    return R
  }

  /**
   * 查询单条数据
   * @param {*} q 查下条件
   * @returns
   */
  async get(q) {
    let R = null

    try {
      const rs = await post(`${this.url}/get`, q)
      // console.log(`get ${this.name}`, {rs})
      if (rs && rs.code === 200) R = rs.data
    } catch (e) {
      console.error(`get exp:${e.message}`)
    }

    return R
  }

  /**
   * 查询数量
   * @param {*} q 查询条件
   * @returns
   */
  async count(q) {
    let R = null

    try {
      const rs = await post(`${this.url}/count`, q)

      console.log(`count ${this.name}`, {rs})
      if (rs && rs.code === 200) R = rs.data.count
    } catch (e) {
      console.error(`count exp:${e.message}`)
    }

    return R
  }

  /**
   * 查询多条记录
   * @param {*} q 查询条件
   * @returns
   */
  async find(q) {
    let R = null

    log({q}, 'find...')
    try {
      const rs = await post(`${this.url}/find`, q)
      log({rs}, `find ${this.name}`)
      if (rs && rs.code === 200) R = rs.data
    } catch (e) {
      log.err(e, 'find')
    }

    return R
  }

  /**
   * 聚合查询
   * @param {*} q 查询条件
   * @returns
   */
  async aggregate(q) {
    let R = null

    log({q}, 'aggregate')
    try {
      const rs = await post(`${this.url}/aggregate`, q)
      log({rs}, `aggregate ${this.name}`)
      if (rs && rs.code === 200) R = rs.data
    } catch (e) {
      log.err(e, 'aggregate')
    }

    return R
  }

  /**
   * 删除单条记录
   * @param {*} q 查询条件
   * @returns
   */
  async remove(q) {
    let R = null

    console.log('remove...', {q})
    try {
      const rs = await post(`${this.url}/remove`, q)
      console.log(`remove ${this.name}`, {rs})
      if (rs && rs.code === 200) R = rs.data
    } catch (ex) {
      console.error(`remove exp:${ex.message}`)
    }

    return R
  }
}

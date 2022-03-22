// @ts-check
let { isAbsolute } = require('path')
let tiny = require('tiny-json-http')
let { chunk } = require('@begin/chunker')
let zipdir = require('zip-dir')

class App {
  constructor ({ access_token, appID, name, url, verbose }) {
    if (!access_token) throw ReferenceError('missing_access_token')
    if (!appID) throw ReferenceError('missing_appID')
    if (!name) throw ReferenceError('missing_name')
    this.access_token = access_token
    this.appID = appID
    this.name = name
    this.url = url
    this.verbose = verbose
    this.env = new Env({ access_token, appID })
    this.static = new Static({ access_token, appID })
  }

  static async create ({ access_token, chunk, zip, verbose }) {
    if (!zip) throw ReferenceError('missing_zip')
    if (!access_token) throw ReferenceError('missing_access_token')
    let result = await write({ access_token, params: { chunk, zip } })
    if (result.errors) {
      console.log(result.errors)
      let e = new Error('create_failed')
      e.raw = result.errors
      throw e
    }
    return new App({ access_token, verbose, ...result })
  }

  static async find ({ access_token, appID, verbose }) {
    if (!access_token) throw ReferenceError('missing_access_token')
    if (!appID) throw ReferenceError('missing_appID')
    let record = await read({ access_token, appID })
    return new App({ access_token, verbose, ...record })
  }

  static async list ({ access_token, verbose }) {
    if (!access_token) throw ReferenceError('missing_access_token')
    let { apps } = await read({ access_token })
    return apps.map(app => new App({ access_token, verbose, ...app }))
  }

  //
  // instance reads
  //
  async builds () {
    let access_token = this.access_token
    let appID = this.appID
    let path = '/builds'
    return read({ access_token, appID, path })
  }

  // let logs = await app.logs()
  async logs () {
    let access_token = this.access_token
    let appID = this.appID
    let path = '/logs'
    return read({ access_token, appID, path })
  }

  //
  // instance writes
  //
  // await app.deploy({ zip || dir })
  async deploy (params = {}) {
    let { dir = process.cwd(), zip } = params
    if (dir && !isAbsolute(dir))
      throw ReferenceError('dir_must_be_absolute_path')

    let access_token = this.access_token
    let appID = this.appID
    let verbose = this.verbose
    let ts = new Date().toISOString()
    let data

    if (zip) {
      data = zip
    }
    else {
      let startZip = Date.now()
      let filter = path => !/(node_modules)|(\.git)|([\\\/]vendor[\\\/])|(__pycache__)|(static\.json)/.test(path)
      data = await zipdir(dir, { filter })
      if (verbose)
        console.error(`Archived project in ${Date.now() - startZip}ms`)
    }

    let chunks = await chunk({ data, write: false })
    let chunkQuantity = Object.keys(chunks).length
    let maxSize = 6 * 1000 * 1000 // 6MB
    for (let [ chunk, zip ] of Object.entries(chunks)) {
      let size = Buffer.from(zip).toString('base64').length
      if (size > maxSize)
        throw Error(`Project chunk exceeds base64-encoded size limit: ${size} (max 6MB) per request`)

      await write({
        access_token,
        appID,
        params: { chunk, zip, ts },
      })
      if (verbose) {
        let i = Object.keys(chunks).findIndex(c => c === chunk)
        console.error(`Uploaded project part ${i + 1} of ${chunkQuantity}`)
      }
    }
  }

  // await app.destroy()
  async destroy () {
    let access_token = this.access_token
    let appID = this.appID
    let path = '/delete'
    return write({ access_token, appID, path })
  }
}

// work with environment variables
class Env {

  constructor ({ access_token, appID }) {
    this.access_token = access_token
    this.appID = appID
  }

  async get () {
    return read({
      access_token: this.access_token,
      appID: this.appID,
      path: '/env'
    })
  }

  async set ({ key, value }) {
    if (!key) throw ReferenceError('missing_key')
    if (!value) throw ReferenceError('missing_value')
    return write({
      access_token: this.access_token,
      appID: this.appID,
      path: '/env',
      params: { [key]: value }
    })
  }

  async destroy ({ key }) {
    if (!key) throw ReferenceError('missing_key')
    return write({
      access_token: this.access_token,
      appID: this.appID,
      path: '/env/delete',
      params: { envs: [ key ] }
    })
  }
}

// work with static assets
class Static {

  constructor ({ access_token, appID }) {
    this.access_token = access_token
    this.appID = appID
  }

  async get (params/* { name, next }*/) {
    if (params && params.name && params.name.startsWith('/') === false)
      throw Error("invalid_name: name must start with '/'")
    let path = `/static`
    if (params && params.name) path += params.name
    if (params && params.next) path += `?next=${params.next}`
    return read({
      access_token: this.access_token,
      appID: this.appID,
      path
    })
  }

  async head ({ name }) {
    if (!name) throw ReferenceError('missing_name')
    if (name && name.startsWith('/') === false)
      throw Error("invalid_name: name must start with '/'")
    let path = `/static${name}?head=true`
    return read({
      access_token: this.access_token,
      appID: this.appID,
      path
    })
  }

  async set ({ name, body, meta, cache, type }) {
    if (!name) throw ReferenceError('missing_name')
    if (name && name.startsWith('/') === false)
      throw Error("invalid_name: name must start with '/'")
    if (!body) throw ReferenceError('missing_body')
    let params = { body }
    if (meta) params.meta = meta
    if (cache) params.cache = cache
    if (type) params.type = type
    return write({
      access_token: this.access_token,
      appID: this.appID,
      path: '/static' + name,
      params
    })
  }

  async destroy ({ name }) {
    if (!name) throw ReferenceError('missing_name')
    if (name && name.startsWith('/') === false)
      throw Error("invalid_name: name must start with '/'")
    let appID = this.appID
    return write({
      access_token: this.access_token,
      appID,
      path: '/static' + name,
      params: { destroy: appID }
    })
  }
}

//
// private helpers
//

async function getBase () {
  let isProd = process.env.NODE_ENV === 'production'
  return `${isProd ? 'api' : 'staging-api'}.begin.com`
}

async function read ({ access_token, appID, path }) {
  try {
    let base = await getBase()
    let url = `https://${base}/apps`
    if (appID) url += '/' + appID
    if (path) url += path
    let result = await tiny.get({
      url,
      headers: {
        authorization: `bearer ${access_token}`
      },
      data: {}
    })
    return result.body
  }
  catch (e) {
    return e.body
  }
}

async function write ({ access_token, appID, path, params }) {
  try {
    let base = await getBase()
    let url = `https://${base}/apps`
    if (appID) url += '/' + appID
    if (path) url += path
    // Automatically base64-encode zip buffers
    if (params.zip instanceof Buffer) {
      params.zip = Buffer.from(params.zip).toString('base64')
    }
    let result = await tiny.post({
      url,
      headers: {
        authorization: `bearer ${access_token}`
      },
      data: params
    })
    return result.body
  }
  catch (e) {
    return e.body
  }
}

module.exports = { App, Env, Static }

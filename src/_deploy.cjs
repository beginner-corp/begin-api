let { isAbsolute } = require('path')
let write = require('./_write.cjs')
let { chunk } = require('@begin/chunker')
let zipdir = require('zip-dir')

module.exports = async function deploy (params = {}) {

  let { dir = process.cwd(), zip } = params
  if (dir && !isAbsolute(dir))
    throw ReferenceError('dir_must_be_absolute_path')

  let access_token = params.token
  let appID = params.appID
  let envID = params.envID
  let verbose = params.verbose
  let ts = new Date().toISOString()
  let data

  if (params.zip) {
    data = params.zip
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
      envID,
      chunk,
      zip,
      ts,
    })

    if (verbose) {
      let i = Object.keys(chunks).findIndex(c => c === chunk)
      console.error(`Uploaded project part ${i + 1} of ${chunkQuantity}`)
    }
  }
}


let tiny = require('tiny-json-http')
let getBase = require('./_get-base.cjs')

module.exports = async function write (params) {
  const base = await getBase()
  const token = params.token
  if (!token) throw Error('missing_token')
  delete params.token

  let url = `${base}/apps`

  if (params.appID) {
    url += `/${params.appID}`
    delete params.appID
  }

  if (params.envID) {
    url += `/${params.envID}`
    delete params.envID
  }

  if (params.path) {
    url += `/${params.path}`
    delete params.path
  }

  try {
    const res = await tiny.post({
      url,
      headers: {
        'content-type': 'application/json',
        'authorization': `bearer ${token}`,
      },
      body: params
    })
    return res.body
  }
  catch (e) {
    const errors = e.body.errors
    throw Error(errors[errors.length - 1])
  }
}

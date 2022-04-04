let tiny = require('tiny-json-http')
let getBase = require('./_get-base.cjs')

module.exports = async function read ({ token, appID, envID, path }) {
  let base = await getBase()
  if (process.env.__BEGIN_TEST_URL__) token = 'token_redacted'
  if (!token) throw Error('missing_token')
  let url = `${base}/apps`
  if (appID) url += `/${appID}`
  if (envID) url += `/${envID}`
  if (path) url += `/${path}`

  try {
    const res = await tiny.get({
      url,
      headers: {
        'content-type': 'application/json',
        'authorization': `bearer ${token}`,
      }
    })
    return res.body
  }
  catch (e) {
    if (e.body && e.body.errors) {
      const errors = e.body.errors
      throw Error(errors[errors.length - 1])
    }
    else {
      throw e
    }
  }
}

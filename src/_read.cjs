let tiny = require('tiny-json-http')
let getBase = require('./_get-base.cjs')

module.exports = async function read ({ token, appID }) {
  let base = await getBase()
  if (!token) throw Error('missing_token')
  let url = `${base}/apps`
  if (appID) url += `/${appID}`
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

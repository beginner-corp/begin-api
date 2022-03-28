module.exports = async function getBase () {
  let isProd = process.env.NODE_ENV === 'production'
  return `https://${isProd ? 'api' : 'staging-api'}.begin.com/v1`
}

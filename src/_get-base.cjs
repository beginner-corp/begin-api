module.exports = async function getBase () {
  let isProd = process.env.NODE_ENV === 'production'
  return `${isProd ? 'api' : 'staging-api'}.begin.com/v1`
}

module.exports = async function getBase () {
  let { ARC_ENV, NODE_ENV } = process.env
  let isProd = [ ARC_ENV, NODE_ENV ].includes('production')
  return `https://${isProd ? 'api' : 'staging-api'}.begin.com/v1`
}

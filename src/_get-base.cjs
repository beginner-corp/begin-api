module.exports = async function getBase () {
  let { ARC_ENV, NODE_ENV, __BEGIN_TEST_URL__ } = process.env
  if (__BEGIN_TEST_URL__) return __BEGIN_TEST_URL__

  let isProd = [ ARC_ENV, NODE_ENV ].includes('production')
  return `https://${isProd ? 'api' : 'staging-api'}.begin.com/v1`
}

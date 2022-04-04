let read = require('./_read.cjs')
let write  = require('./_write.cjs')
let deploy = require('./_deploy.cjs')

/** example api client */
module.exports = {

  /** find an app by appID */
  async find ({ token, appID }) {
    if (!appID) throw Error('missing_appID')
    return read({ token, appID })
  },

  /** list apps */
  async list ({ token }) {
    return read({ token })
  },

  /** create an app */
  async create ({ token, name, envName }) {
    return write({ token, name, envName })
  },

  /** update app.name */
  async update ({ token, appID, name }) {
    return write({ token, appID, name })
  },

  /** destroy app and all environments */
  async destroy ({ token, appID }) {
    return write({ token, appID, path: '/delete' })
  },

  env: {

    /** add an environment */
    async add ({ token, appID, name, envName }) {
      if (!appID) throw Error('missing_appID')
      return write({ token, appID, name, envName })
    },

    /** remove an environment */
    async remove ({ token, appID, envID }) {
      if (!appID) throw Error('missing_appID')
      if (!envID) throw Error('missing_envID')
      return write({ token, appID, envID, path: '/delete' })
    },

    /** deploy code to environment */
    async deploy ({ token, appID, envID, dir, zip, verbose }) {
      return deploy({ token, appID, envID, dir, zip, verbose })
    },

    /* read environment runtime logs */
    async logs ({ token, appID, envID, query }) {
      return read({ token, appID, envID, query, path: '/logs' })
    },

    /** read a single build */
    async build ({ token, appID, envID, buildID }) {
      return read({ token, appID, envID, buildID, path: '/builds/' + buildID })
    },

    /** read build logs */
    async builds ({ token, appID, envID }) {
      return read({ token, appID, envID, path: '/builds' })
    },

    vars: {

      /** upsert env vars */
      async add ({ token, appID, envID, vars }) {
        return write({ token, appID, envID, vars, path: '/vars' })
      },

      /** remove env vars */
      async remove ({ token, appID, envID, vars }) {
        return write({ token, appID, envID, vars, path: '/vars/delete' })
      }
    }
  }
}

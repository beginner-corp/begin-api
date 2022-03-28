import * as e from 'dotenv'

e.config()

import path from 'path'
import fs from 'fs'
import test from 'tape'
import begin from '../src/index.mjs'

let token = process.env.ACCESS_TOKEN
let timeout = 150000 

test('begin', t => {
  t.plan(5)
  t.ok(begin, 'begin')
  t.ok(begin.create, 'begin.create')
  t.ok(begin.destroy, 'begin.destroy')
  t.ok(begin.find, 'begin.find')
  t.ok(begin.list, 'begin.list')
  console.log(begin)
})

test('begin.create', async t=> {
  t.plan(1)
  let name = 'example app'
  //let __filename = '/client-test.js'
  //let __dirname = import.meta.url.replace('file:', '').replace(__filename, '')
  //let pathToMockZip = path.join(__dirname, 'arc-basic.zip')
  //let zip = fs.readFileSync(pathToMockZip).toString('base64')
  let app = await begin.create({ token, name: 'my app', envName: 'stage' })
  t.ok(typeof app === 'object', 'created')
  console.log(app)
})

let appID // use later

test('begin.list', async t=> {
  t.plan(1)
  let apps = await begin.list({ token })
  t.ok(Array.isArray(apps) && apps.length >= 1, 'apps is an array with at least one app')
  appID = apps[0].appID
  console.log(apps)
})

test('begin.find', async t=> {
  t.plan(1)
  let app = await begin.find({ token, appID })
  t.ok(typeof app === 'object', 'app is an obj')
  console.log(app)
})

test('begin.destroy', async t=> {
  t.plan(1)
  let result = await begin.destroy({ token, appID })
  t.ok(result.destroyed && result.destroyed === appID, 'destroyed')
  console.log(result)
})

/*
test('deploy new name', async t=> {
  t.plan(1)
  await app.deploy({ name: 'v cool app' })
  t.pass()
  console.log(app)
})

*/

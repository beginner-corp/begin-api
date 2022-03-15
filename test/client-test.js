import * as e from 'dotenv'

e.config()

import * as tiny from 'tiny-json-http'
import path from 'path'
import fs from 'fs'
import test from 'tape'

import { App } from '../client.js'

let access_token = process.env.ACCESS_TOKEN
let timeout = 150000 
let app // used later 

test('App', t => {
  t.plan(4)
  t.ok(App, 'has an app')
  t.ok(App.list, 'has a list method')
  t.ok(App.find, 'has a find method')
  t.ok(App.create, 'has a create method')
  console.log(App)
})

/*
test('get a list of apps', async t=> {
  t.plan(1)
  let apps = await App.list({ access_token })
  t.ok(apps.length > 0, 'has apps')
  app = apps[0]
  console.log(apps, apps.length)
})*/

//
// working with an instance
//

test('create an app', async t=> {
  t.plan(1)
  let name = 'example app'
  let __filename = '/client-test.js'
  let __dirname = import.meta.url.replace('file:', '').replace(__filename, '')
  let pathToMockZip = path.join(__dirname, 'arc-basic.zip')
  let zip = fs.readFileSync(pathToMockZip).toString('base64')
  app = await App.create({ access_token, name:'my cool app', zip })
  t.ok(true, 'app created')
  console.log(app)
})

test('look for 200', { timeout }, async t=> {
  t.plan(1)
  let delay = 1000*2 // prev value: 120000
  let check = await new Promise((res, rej) => {
    setTimeout(function() {
      App.find({ access_token, appID: app.appID}).then(res).catch(rej)
    }, delay)
  })
  await tiny.get({ url: check.url })
  t.pass('got 200')
  console.log(check.url)
  app = check
})

test('get the app logs', { timeout }, async t=> {
  t.plan(1)
  console.log(app)
  let check = await app.logs()
  t.pass('got logs')
  console.log(check)
})

test('get the app builds', { timeout }, async t=> {
  t.plan(1)
  let check = await app.builds()
  t.pass('got builds')
  console.log(check.length)
})

test('get the app env', { timeout }, async t=> {
  t.plan(1)
  let env = await app.env.get()
  t.pass('got env')
  console.log(env)
})

test('add an env var to the app', { timeout }, async t=> {
  t.plan(1)
  let env = await app.env.set({ key: "HENLO", value: "WORLD" })
  t.ok(env.env.HENLO === 'WORLD')
  console.log(env)
})

test('remove an env var from the app', { timeout }, async t=> {
  t.plan(1)
  let env = await app.env.destroy({ key: "HENLO" })
  t.ok(!!env.env.HENLO === false)
  console.log(env)
})

test('deploy new name', async t=> {
  t.plan(1)
  await app.deploy({ name: 'v cool app' })
  t.pass()
  console.log(app)
})

test('destroy the app', { timeout }, async t=> {
  t.plan(1)
  let result = await app.destroy()
  t.ok(result.destroyed, 'destroyed ' + result.destroyed)
})

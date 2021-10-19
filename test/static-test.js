require('dotenv').config()

let tiny = require('tiny-json-http')
let path = require('path')
let fs = require('fs')
let test = require('tape')
let App = require('../../src/client')

let access_token = process.env.ACCESS_TOKEN
let timeout = 120000 
let app 

test('get a list of apps', async t=> {
  t.plan(1)
  let apps = await App.list({ access_token })
  t.ok(apps.length > 0, 'has apps')
  app = apps[apps.length - 1]
  console.log(apps, apps.length)
})

//
// working with an instance
//

test('get the static assets', async t=> {
  t.plan(1)
  let env = await app.static.get()
  t.pass('got static')
  console.log(env)
})

test('add a file', { timeout }, async t=> {
  t.plan(1)
  let f = await app.static.set({
    name: '/foo.js',
    type: 'text/javascript',
    body: Buffer.from('console.log("hi")').toString('base64')
  })
  t.pass('created file')
  console.log(f)
})

test('read a file', { timeout }, async t=> {
  t.plan(1)
  let f = await app.static.get({
    name: '/foo.js',
  })
  t.pass('read file')
  console.log(f)
})

test('head a file', { timeout }, async t=> {
  t.plan(1)
  let f = await app.static.head({
    name: '/foo.js',
  })
  t.pass('head file')
  console.log(f)
})

test('destroy the file', { timeout }, async t=> {
  t.plan(1)
  let result = await app.static.destroy({ name: '/foo.js' })
  t.pass('destroyed!')
  console.log(result)
})

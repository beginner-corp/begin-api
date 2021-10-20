> Node client for api.begin.com 

Obtain an `access_token` by creating a client at https://api.begin.com.

# Install

```bash
npm i @begin/api
```

## ESM

```javascript
import { App } from '@begin/api'
```

## CJS

```javascript
const { App } = require('@begin/api')
```

# Usage

### App static methods

```javascript
// list apps
let { apps } = await App.list()

// find an app by id
let app = await App.find({ access_token, appID })

// create a new app 
let app = await App.create({ access_token, name, zip })

```

### App instance methods

```javascript
// read app logs
let logs = await app.logs()

// read build logs
let logs = await app.builds()

// deploy a new version of the app
await app.deploy({ name, zip })

// destroy an app
await app.destroy()
```

### Work with environment variables

```javascript
// get the app env
let { env } = await app.env.get()

// write an env var
await app.env.set({ key: "HENLO", value: "world" })

// remove an env var
await app.env.destroy({ key: "HENLO" })

```

### Work with static assets

```javascript
// get the app env
let { files } = await app.static.get()

// write a file
let body = Buffer.from('console.log("hi")').toString('base64')
await app.static.set({ name: '/file.js', body  })

// remove the file
await app.static.destroy({ name: '/file.js' })

```

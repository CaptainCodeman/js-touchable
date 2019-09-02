const bs = require('browser-sync').create()

const express = require('express')
const compression = require('compression')
const app = express()
const transformMiddleware = require('express-transform-bare-module-specifiers').default

app.use(compression())
app.use(transformMiddleware())

bs.init({
  server: true,
  files: [
    'index.html',
    'dist/**/*',
    'test/**/*',
  ],
  middleware: [app]
})

var polyfill = require("./index.js").polyfill
try {
  polyfill()
} catch (e) {}
try {
  polyfill(GameGlobal)
} catch (e) {}
try {
  window = window || {}
  polyfill(window)
} catch (e) {}
try {
  localStorage = require("./localstorage.js")
} catch (e) {}
try {
  XMLHttpRequest = require("./xmlhttprequest.js")
} catch (e) {}
try {
  FormData = require("./formdata.js")
} catch (e) {}
try {
  WebSocket = require("./websocket.js")
} catch (e) {}
try {
  navigator = require("./navigator.js")
} catch (e) {}

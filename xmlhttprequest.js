const assign = require("object-assign")
const EventTarget = require("event-target-shim")
const FormData = require("./formdata.js")

const UNSENT = 0
const OPENED = 1
const HEADERS_RECEIVED = 2
const LOADING = 3
const DONE = 4

const REQUEST_EVENTS = ["abort", "error", "load", "loadstart", "progress", "timeout", "loadend", "readystatechange"]

const REQUEST_UPLOAD_EVENTS = ["abort", "error", "load", "loadstart", "progress", "timeout", "loadend"]

function successCallback(response) {
  this.status = response.statusCode
  this.statusText = response.statusCode
  // 基础库 1.2.0 开始支持
  if (response.header) {
    this._responseHeaders = Object.keys(response.header).reduce((headers, key) => {
      headers[key.toLowerCase()] = response.header[key]
      return headers
    }, {})
  }
  let text = response.data
  if (typeof text !== "string") {
    text = JSON.stringify(text)
  }
  this.responseText = this.response = text
  this.readyState = DONE
  this.dispatchEvent({ type: "readystatechange" })
}

class XMLHttpRequestUpload extends EventTarget(REQUEST_UPLOAD_EVENTS) {}

class XMLHttpRequest extends EventTarget(REQUEST_EVENTS) {
  constructor() {
    super()
    this.readyState = UNSENT
    this._headers = {}
    this.upload = new XMLHttpRequestUpload()
  }

  abort() {
    // 基础库 1.4.0 开始支持
    if (!this._request || this._request.abort) {
      this.status = 0
      this.readyState = DONE
      return this._request.abort()
    }
    throw new Error("该版本基础库不支持 abort request")
  }
  getAllResponseHeaders() {
    return this._responseHeaders
      ? Object.keys(this._responseHeaders)
          .map(key => `${key}: ${this._responseHeaders[key]}`)
          .join("\r\n")
      : ""
  }
  getResponseHeader(key) {
    const lowserCasedKey = key.toLowerCase()
    if (this._responseHeaders && this._responseHeaders[lowserCasedKey]) {
      return this._responseHeaders[lowserCasedKey]
    }
    return null
  }
  overrideMimeType() {
    throw new Error("not supported in weapp")
  }
  open(method, url, async = true) {
    if (this.readyState !== UNSENT) {
      throw new Error("request is already opened")
    }
    if (!async) {
      throw new Error("sync request is not supported")
    }
    this._method = method
    this._url = url
    this.readyState = OPENED
    this.dispatchEvent({ type: "readystatechange" })
  }
  setRequestHeader(header, value) {
    if (this.readyState !== OPENED) {
      throw new Error("request is not opened")
    }
    this._headers[header.toLowerCase()] = value
  }
  send(data) {
    if (this.readyState !== OPENED) {
      throw new Error("request is not opened")
    }
    if (data instanceof FormData) {
      const entries = data.entries()
      const blobs = entries.filter(entry => typeof entry[1] !== "string")
      if (blobs.length === 0) {
        throw new Error("Must specify a Blob field in FormData")
      }
      if (blobs.length > 1) {
        console.warn("Only the first Blob will be send in Weapp")
      }
      const restData = entries
        .filter(entry => typeof entry[1] === "string")
        .reduce((result, entry) => assign(result, { [entry[0]]: entry[1] }), {})
      this._request = Taro.uploadFile({
        url: this._url,
        name: blobs[0][0],
        filePath: blobs[0][1].uri,
        formData: restData,
        header: this._headers,
        success: successCallback.bind(this),
        fail: error => {
          this.status = 0
          this.readyState = DONE
          this.dispatchEvent({ type: "readystatechange" })
          this.dispatchEvent({ type: "error" })
        }
      })
      // 基础库 1.4.0 开始支持
      // iLux Mod for swan upload progress - START
      if (this._request && this._request.progress) {
        let that = this
        this._request.progress(function(_ref) {
          var totalBytesSent = _ref.totalBytesSent,
            totalBytesExpectedToSend = _ref.totalBytesExpectedToSend

          that.upload.dispatchEvent({
            type: "progress",
            loaded: totalBytesSent,
            total: totalBytesExpectedToSend
          })
        })
      }
      // iLux Mod for swan upload progress - END
      else if (this._request && this._request.onProgressUpdate) {
        this._request.onProgressUpdate(({ totalBytesSent, totalBytesExpectedToSend }) => {
          this.upload.dispatchEvent({
            type: "progress",
            loaded: totalBytesSent,
            total: totalBytesExpectedToSend
          })
        })
      }
    } else {
      delete this._headers["content-type"] // iLux MOD
      this._request = Taro.request({
        url: this._url,
        data: data || "",
        // method 的 value 居然必须为大写
        method: this._method.toUpperCase(),
        header: this._headers,
        success: successCallback.bind(this),
        fail: error => {
          this.status = 0
          this.readyState = DONE
          this.dispatchEvent({ type: "readystatechange" })
          this.dispatchEvent({ type: "error" })
        }
      })
    }
  }
}

assign(XMLHttpRequest, {
  UNSENT,
  OPENED,
  HEADERS_RECEIVED,
  LOADING,
  DONE
})

module.exports = XMLHttpRequest

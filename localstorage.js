class Storage {
  getItem(key) {
    return Taro.getStorageSync(key)
  }

  setItem(key, value) {
    return Taro.setStorageSync(key, value)
  }

  removeItem(key) {
    return this.setItem(key, "")
  }

  clear() {
    return Taro.clearStorageSync()
  }
}

module.exports = new Storage()

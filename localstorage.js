class Storage {
  getItemAsync(key) {
    return new Promise((resolve, reject) => {
      Taro.getStorage({ key, success: res => resolve(res), fail: err => reject(err) })
    })
  }

  setItemAsync(key, value) {
    return new Promise((resolve, reject) => {
      Taro.setStorage({
        key: "key",
        data: value,
        success: res => resolve(res),
        fail: err => reject(err)
      })
    })
  }

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

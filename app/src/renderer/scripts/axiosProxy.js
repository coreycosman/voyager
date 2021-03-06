const { ipcRenderer } = require(`electron`)

// Proxy requests to Axios through the main process because we need
// Node.js in order to support self-signed TLS certificates.
module.exports = (requestCounter = 0) => {
  return options =>
    new Promise((resolve, reject) => {
      requestCounter++

      if (requestCounter === Number.MAX_SAFE_INTEGER) {
        requestCounter = 0
      }

      const channel = `Axios/${requestCounter}`
      ipcRenderer.once(channel, (event, { exception, value }) => {
        ipcRenderer.removeAllListeners(channel)
        if (exception) {
          // TODO: delete console logs on web
          console.error(
            `Request ${options.method.toUpperCase()} ${options.url} failed`,
            exception
          )
          reject(exception)
        } else {
          // TODO: delete console logs on web
          console.log(
            `Request ${options.method.toUpperCase()} ${options.url} successful`,
            value.data
          )
          resolve(value)
        }
      })

      ipcRenderer.send(`Axios`, requestCounter, options)
    })
}

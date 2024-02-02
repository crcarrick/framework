import { Server as HttpServer } from 'node:http'
import { Server as HttpsServer } from 'node:https'
import type { Socket } from 'node:net'

/**
 * Node's `server.close` is not super reliable. This function creates a more reliable
 * `close` function that will close the server and all open sockets.
 */
export function createCloser(
  server: HttpServer | HttpsServer,
  graceful = true,
) {
  let stopped = false

  const sockets = new Map<Socket, number>()
  const event =
    server instanceof HttpsServer ? 'secureConnection' : 'connection'

  function setCount(socket: Socket, count: -1 | 0 | 1) {
    const curr = sockets.get(socket) ?? 0
    const next = curr + count
    sockets.set(socket, next)
    return next
  }

  server.on(event, (socket: Socket) => {
    setCount(socket, 0)
    socket.once('close', () => {
      sockets.delete(socket)
    })
  })

  server.on('request', (req, res) => {
    setCount(req.socket, 1)
    res.once('finish', () => {
      const count = setCount(req.socket, -1)
      if (stopped && count === 0) {
        req.socket.end()
      }
    })
  })

  return function stop() {
    return new Promise<void>((resolve, reject) => {
      setImmediate(() => {
        stopped = true
        sockets.forEach((count, socket) => count === 0 && socket.end())
        if (!graceful) {
          setImmediate(() => {
            sockets.forEach((_, socket) => socket.destroy())
          })
        }
        server.close((err) => {
          if (err) {
            return reject(err)
          }
          resolve()
        })
      })
    })
  }
}

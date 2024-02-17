import { runServer } from './server.js'

runServer().catch((err) => {
  console.error(err)
  process.exit(1)
})

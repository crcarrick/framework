const SIGNALS = [
  'SIGINT',
  'SIGTERM',
  'SIGUSR1',
  'SIGUSR2',
  'uncaughtException',
  'exit',
]

export function registerSignals(terminate: () => void) {
  let logged = false

  SIGNALS.forEach((signal) => {
    process.on(signal, () => {
      if (!logged) {
        logged = true
        console.log(`\nReceived ${signal}. Shutting down server...\n`)
      }
      terminate()
    })
  })
}

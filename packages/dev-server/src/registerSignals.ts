const SIGNALS = [
  'SIGINT',
  'SIGTERM',
  'SIGUSR1',
  'SIGUSR2',
  'uncaughtException',
  'exit',
]

export function registerSignals(terminate: () => void) {
  let terminating = false

  SIGNALS.forEach((signal) => {
    process.on(signal, () => {
      if (!terminating) {
        terminating = true
        console.log(`\nReceived ${signal}. Shutting down server...\n`)
        terminate()
      }
    })
  })
}

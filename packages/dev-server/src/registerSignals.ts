const SIGNALS = [
  'SIGINT',
  'SIGTERM',
  'SIGUSR1',
  'SIGUSR2',
  'uncaughtException',
  'end',
]

export function registerSignals(terminate: () => void) {
  SIGNALS.forEach((signal) => {
    process.on(signal, () => {
      console.log(`\nReceived ${signal}. Shutting down server...\n`)
      terminate()
    })
  })
}

import esbuild from 'esbuild'

const options = {
  entryPoints: ['src/bootstrap.tsx'],
  outfile: 'public/bootstrap.mjs',
  tsconfig: 'tsconfig.build.json',
  bundle: true,
  minify: true,
  sourcemap: true,
}

let context
if (process.argv.includes('--watch')) {
  context = await esbuild.context(options)
  await context.watch()
} else {
  await esbuild.build(options)
}

const SIGNALS = [
  'SIGINT',
  'SIGTERM',
  'SIGUSR1',
  'SIGUSR2',
  'uncaughtException',
  'exit',
]

for (const signal of SIGNALS) {
  process.on(signal, () => {
    if (context) {
      context.dispose().then(() => process.exit(0))
    }
  })
}

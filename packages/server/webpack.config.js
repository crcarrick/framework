import path from 'node:path'

export default {
  mode: 'development',
  entry: './src/bootstrap/bootstrap.js',
  output: {
    filename: 'bootstrap.js',
    path: path.join(import.meta.dirname, 'public'),
  },
}

import type { Response } from 'express'
import { renderToString } from 'react-dom/server'

import { NotFound } from '../components/NotFound.js'

export function send404(res: Response) {
  res.setHeader('content-type', 'text/html')
  return res.status(404).send(renderToString(<NotFound />))
}

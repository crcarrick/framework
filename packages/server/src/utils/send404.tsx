import type { Request, Response, NextFunction } from 'express'
import { renderToString } from 'react-dom/server'

import { NotFound } from '../components/NotFound.js'

export function send404(_req: Request, res: Response, _next: NextFunction) {
  res.setHeader('content-type', 'text/html')
  return res.status(404).send(renderToString(<NotFound />))
}

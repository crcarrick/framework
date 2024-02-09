import type { Request, Response, NextFunction } from 'express'

import { send404 } from '../utils/send404.js'

export function fourOhFour(_req: Request, res: Response, _next: NextFunction) {
  return send404(res)
}

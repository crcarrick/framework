import { rm } from 'node:fs/promises'
import { join } from 'node:path'

import type { TempEntry } from './createTempEntries.js'

export async function deleteTempEntries(tempEntries: TempEntry[]) {
  await Promise.all(tempEntries.map(({ path }) => rm(join(path, 'entry.tsx'))))
}

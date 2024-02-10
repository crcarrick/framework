import { cp } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'

export async function copySourceFiles() {
  const pages = join(cwd(), 'src')
  const temps = join(cwd(), '.framework', 'temp')

  await cp(pages, temps, { recursive: true })
}

export { FrameworkPlugin } from './plugin.js'
export { copySourceFiles } from './utils/copySourceFiles.js'
export {
  createTempEntries,
  type TempEntry,
} from './entrypoints/createTempEntries.js'
export { deleteTempEntries } from './entrypoints/deleteTempEntries.js'
export {
  getPageEntryPoints,
  type EntryPoints,
} from './entrypoints/getPageEntryPoints.js'

export type {
  Page,
  PageComponentExport,
  PageManifest,
  PageOut,
} from './types.js'

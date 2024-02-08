import { Writable } from 'node:stream'

import { Response } from 'express'

import { ExposedPromise } from './ExposedPromise.js'

/**
 * Wrapper for `Response` that allows us to get in the middle of the stream and insert
 * the result of `getServerSideProps` as a script tag.
 */
export class FrameworkResponse<T> extends Writable {
  // set in `onShellReady`
  public shellReady = false

  private _promise: ExposedPromise<T>
  private _shouldWriteScript = true

  constructor(
    private _writable: Response,
    _resource: Promise<T>,
  ) {
    super()
    this._promise = new ExposedPromise(_resource)
  }

  write(chunk: Uint8Array) {
    if (
      this.shellReady &&
      this._shouldWriteScript &&
      this._promise.status === 'resolved'
    ) {
      this._shouldWriteScript = false
      this._writable.write(
        new TextEncoder().encode(
          `<script>__SSP = ${JSON.stringify(this._promise.value)}</script>`,
        ),
      )
    }

    const result = this._writable.write(chunk)

    return result
  }

  flush() {
    this._writable.flush()
  }

  destroy(...args: Parameters<Writable['destroy']>) {
    this._writable.destroy(...args)
    return this
  }

  end() {
    this._writable.end()
    return this
  }
}

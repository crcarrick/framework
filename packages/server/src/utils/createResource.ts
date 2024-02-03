export interface Resource {
  read(): object
}

/**
 * hack to suspend while waiting for some data on the server
 * look into using `use()` instead?
 */
export function createResource(promise: Promise<object>): Resource {
  let status = 'pending'
  let result: object

  const suspender = promise.then(
    (res) => {
      status = 'success'
      result = res
    },
    (err) => {
      status = 'error'
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      result = err
    },
  )

  return {
    read() {
      if (status === 'pending') {
        throw suspender
      } else if (status === 'error') {
        throw result
      } else {
        return result
      }
    },
  }
}

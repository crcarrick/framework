export class ExposedPromise<T> {
  public status: 'pending' | 'resolved' | 'rejected' = 'pending'
  public value: T | undefined
  public error: unknown

  constructor(private promise: Promise<T>) {
    this.promise.then(
      (value) => {
        this.status = 'resolved'
        this.value = value
      },
      (error: unknown) => {
        this.status = 'rejected'
        this.error = error
      },
    )
  }
}

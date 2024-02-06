export type InferServerSideProps<T> = T extends (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => Promise<infer U>
  ? U
  : never

export type ServerSideProps<T> = {
  params: T
}

export interface GetServerSideProps<T = object> {
  (props: ServerSideProps<T>): Promise<object>
}

export type FrameworkComponentProps<T, K> = InferServerSideProps<K> &
  ServerSideProps<T>

import type { GetServerSideProps, InferServerSideProps } from 'metaframework'
import { useState } from 'react'

interface Params {
  initialCount: string
}

export const getServerSideProps = (({ params }) => {
  return Promise.resolve({
    initialCount: parseInt(params.initialCount, 10),
  })
}) satisfies GetServerSideProps<Params>

type CounterProps = InferServerSideProps<typeof getServerSideProps>

export default function Counter({ initialCount }: CounterProps) {
  const [count, setCount] = useState(initialCount)

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
    </div>
  )
}

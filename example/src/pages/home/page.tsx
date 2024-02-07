import { useState } from 'react'

import { Header } from '../../components/Header.js'

export default function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Header>Home</Header>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

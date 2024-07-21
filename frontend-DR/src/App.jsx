import { useState } from 'react'
import './App.css'
import MyDigitalResume from './components/myDigitalResume'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <MyDigitalResume />
    </>
  )
}

export default App

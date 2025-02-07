import { useEffect, useState } from 'react'
import axios from "axios"
import './App.css'

function App() {
  const [x, setx] = useState("")

  useEffect(() => {
    axios.get('/api/hello')
      .then((response) => {
        setx(response.data)
      })
      .catch((err) => {
        console.log(err);
      })
  })

  return (
    <>
      <div>MERN {x}</div>
    </>
  )
}

export default App

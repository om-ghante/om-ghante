import React from 'react'
import './App.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import { StickyNavbar } from './components/stickyNavbar'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<StickyNavbar />}>
            <Route index path='/home' element={<StickyNavbar />}/>
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App

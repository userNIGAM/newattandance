import React from 'react'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import AttendanceApp from './components/AttandanceApp'
import "./App.css"

function App() {
  return (
   <>
   <Router>
    <Routes>
      <Route path='/' element={<AttendanceApp/>} />
    </Routes>
   </Router>
   </>
  )
}

export default App
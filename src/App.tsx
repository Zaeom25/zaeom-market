import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.tsx'
import Admin from './pages/Admin.tsx'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
        </Routes>
    )
}

export default App

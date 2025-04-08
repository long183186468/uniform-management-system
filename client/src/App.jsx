import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import UniformList from './pages/UniformList';
import ManufacturerList from './pages/ManufacturerList';
import CertificateList from './pages/CertificateList';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/uniforms" element={<UniformList />} />
          <Route path="/manufacturers" element={<ManufacturerList />} />
          <Route path="/certificates" element={<CertificateList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 
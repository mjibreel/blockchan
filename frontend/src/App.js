import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Stamp from './pages/Stamp';
import Verify from './pages/Verify';
import { WalletProvider } from './context/WalletContext';

function App() {
  return (
    <WalletProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50 dark:bg-black">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stamp" element={<Stamp />} />
            <Route path="/verify" element={<Verify />} />
          </Routes>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;


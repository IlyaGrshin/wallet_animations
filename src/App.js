import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './index.css';

import UI from './Pages/UI'
import Wallet from './Pages/Wallet'

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode='wait'>
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={<UI />} />
        <Route path='wallet' element={<Wallet />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
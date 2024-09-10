import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './index.css';

import UI from './Pages/UI';
import Wallet from './Pages/Wallet';

function App() {
    useEffect(() => {
        const WebApp = window?.Telegram?.WebApp;
		WebApp?.setBackgroundColor(WebApp.themeParams.secondary_bg_color)
        WebApp?.setHeaderColor(WebApp.themeParams.secondary_bg_color);
    }, []);

    return (
        <AnimatePresence mode='wait' initial={false}>
            <Routes>
                <Route path='/' element={<UI />} />
                <Route path='/wallet' element={<Wallet />} />
                <Route path='*' element={<UI />} />
            </Routes>
        </AnimatePresence>
    );
}

export default App;

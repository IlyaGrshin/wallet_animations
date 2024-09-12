import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './index.css';

import UI from './Pages/UI';
import Wallet from './Pages/Wallet';
import TONSpace from './Pages/TS';

import WebApp from '@twa-dev/sdk';

function App() {
	const location = useLocation();

    useEffect(() => {
		WebApp.ready()
		WebApp.expand()
		WebApp.setBackgroundColor('secondary_bg_color')
        WebApp.setHeaderColor('secondary_bg_color');
    }, []);

    return (
        <AnimatePresence mode='wait' initial={false}>
            <Routes location={location} key={location.pathname}>
                <Route path='/' element={<UI />} />
                <Route path='wallet' element={<Wallet />} />
                <Route path='tonspace' element={<TONSpace />} />
                <Route path='*' element={<UI />} />
            </Routes>
        </AnimatePresence>
    );
}

export default App;

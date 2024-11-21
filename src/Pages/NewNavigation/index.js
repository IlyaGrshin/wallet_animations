import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Wallet from '../../Pages/Wallet';
import TONSpace from '../../Pages/TS';
import SegmentedControl from '../../Components/SegmentedControl';

import WebApp from '@twa-dev/sdk';
import { ReactComponent as QRCodeIcon } from '../../Icons/28/QR Code.svg'

import './index.css';
import { BackButton } from '@twa-dev/sdk/react';

const initData = new URLSearchParams(WebApp.initData);
const userData = initData.get('user')
const Avatar = JSON.parse(userData).photo_url

function NewNavigation () {
    const [activeSegment, setActiveSegment] = useState(0);
    const [view, setView] = useState('wallet');

    const content = useMemo(() => {
        switch(view) {
            case 'wallet':
                return <Wallet />
            case 'tonspace':
                return <TONSpace />
            default:
                return <Wallet />
        }
    }, [view]);

    const handleSegmentChange = (index) => {
        if (index === 1) {
            setView('tonspace')
        } else if (index === 0) {
            WebApp.setHeaderColor('secondary_bg_color');
            setView('wallet')
        }

        WebApp.HapticFeedback.selectionChanged()
        setActiveSegment(index)
    };

    return (
        <>
            <BackButton />
            <div className="navPanel">
                <div class="bounds transparent">
                    <div className='avatar' style={{ backgroundImage: `url(${Avatar})` }}></div>
                </div>
                <SegmentedControl
                    segments={['Wallet', 'TON Space']}
                    onChange={handleSegmentChange}
                    colorScheme={activeSegment === 1 ? 'dark' : 'light'}
                    type='mainPage'
                    style={{ width: '200px' }}
                />
                <div 
                    class="bounds"
                    data-color-scheme={activeSegment === 1 ? 'dark' : 'light'}
                >
                    <QRCodeIcon />
                </div>
            </div>
            <AnimatePresence mode="popLayout" initial={false} custom={view}>
                <motion.div
                    initial={{ opacity: 0, scale: 1.006 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    key={view}
                    transition={{
                        duration: 0.2,
                        // ease: [0.26, 0.08, 0.25, 1],
                        ease: 'linear'
                    }}
                >
                    {content}
                </motion.div>
            </AnimatePresence>
        </>
    )
}

export default NewNavigation;
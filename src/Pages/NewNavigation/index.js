import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import Wallet from '../../Pages/Wallet';
import TONSpace from '../../Pages/TS';
import SegmentedControl from '../../Components/SegmentedControl';

import WebApp from '@twa-dev/sdk';
import { ReactComponent as QRCodeIcon } from '../../Icons/28/QR Code.svg'

import './index.css';
import { BackButton } from '@twa-dev/sdk/react';
import DefaultAvatar from '../../Icons/Avatars/IlyaG.png'
import PageTransition from '../../Components/PageTransition';

const useAvatarUrl = () => {
  try {
    const initData = new URLSearchParams(WebApp.initData);
    const userData = initData.get('user');
    
    return initData ? JSON.parse(userData).photo_url : DefaultAvatar;
  } catch (error) {
    console.error('Error parsing initData or userData:', error);
    return DefaultAvatar;
  }
};

const useSegmentNavigation = () => {
  const [activeSegment, setActiveSegment] = useState(0);
  const [view, setView] = useState('wallet');

  const handleSegmentChange = (index) => {
    if (index === 1) {
      setView('tonspace');
    } else if (index === 0) {
      WebApp.setHeaderColor('secondary_bg_color');
      setView('wallet');
    }

    WebApp.HapticFeedback.selectionChanged();
    setActiveSegment(index);
  };

  return { activeSegment, view, handleSegmentChange };
};

function NewNavigation () {
    const { activeSegment, view, handleSegmentChange } = useSegmentNavigation();
    const avatarUrl = useAvatarUrl();

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

    return (
        <>
            <BackButton />
            <PageTransition>
                <div className="navPanel">
                    <div className="bounds transparent">
                        <div className='avatar' style={{ backgroundImage: `url(${avatarUrl})` }}></div>
                    </div>
                    <SegmentedControl
                        segments={['Wallet', 'TON Space']}
                        onChange={handleSegmentChange}
                        colorScheme={activeSegment === 1 ? 'dark' : 'light'}
                        type='mainPage'
                        style={{ width: '200px' }}
                    />
                    <div 
                        className="bounds"
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
                        className='pageView'
                    >
                        {content}
                    </motion.div>
                </AnimatePresence>
            </PageTransition>
        </>
    )
}

export default NewNavigation;
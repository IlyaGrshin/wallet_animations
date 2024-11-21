import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import PageTransition from '../../Components/PageTransition';

import Wallet from '../../Pages/Wallet';
import TONSpace from '../../Pages/TS';
import SegmentedControl from '../../Components/SegmentedControl';

function NewNavigation () {
    const [activeSegment, setActiveSegment] = useState(0); // 0 для Wallet, 1 для TON Space

    const handleSegmentChange = (index) => {
        setActiveSegment(index);
    };

    return (
        <>
            <div className="navPanel">
                <SegmentedControl
                    segments={['Wallet', 'TON Space']}
                    onChange={handleSegmentChange}
                    colorScheme={activeSegment === 1 ? 'dark' : 'light'}
                />
            </div>
            <AnimatePresence mode="wait" initial={false}>
                <PageTransition key={activeSegment}>
                    { activeSegment === 0 ? <Wallet /> : <TONSpace /> }
                </PageTransition>
            </AnimatePresence>
        </>
    )
}

export default NewNavigation;
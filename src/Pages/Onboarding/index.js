import React, { useState, useEffect } from 'react'
import Gallery from '../../Components/Gallery'
import Text from '../../Components/Text'
import SectionHeader from '../../Components/SectionHeader'
import StartView from '../../Components/StartView'

import WebApp from '@twa-dev/sdk'
import { BackButton } from '@twa-dev/sdk/react'

import './index.css'
import Button from '../../Components/Button'

const Page1 = () => {
    return (
        <div className='OnboardingPage'>
            <div className='cover'>
                <div className='image coin'></div>
            </div>
            <div className='content'>
                <StartView 
                    title='Your TON Space'
                    description='Get access to all the features of TON blockchain directly in Telegram'    
                />
            </div>
        </div>
    )
}

const Page2 = () => {
    return (
        <div className='OnboardingPage'>
            <div className='cover'>
                <div className='image disk'></div>
            </div>
            <div className='content'>
                <StartView 
                    title='Secure Ownership'
                    description='You have complete control of the Toncoin, collectibles, and jettons in your TON Space'    
                />
            </div>
        </div>
    )
}

const Page3 = () => {
    return (
        <div className='OnboardingPage'>
            <div className='cover'>
                <div className='image planet'></div>
            </div>
            <div className='content'>
                <StartView 
                    title='Your Gateway to TONp'
                    description='Access decentralized applications with your TON Space'    
                />
            </div>
        </div>
    )
}

const Onboarding = () => {
    const [currentPage, setCurrentPage] = useState(0);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // console.log('Текущая страница:', page);
    };

    useEffect(() => {
        WebApp.setHeaderColor('#131314')
        WebApp.onEvent('backButtonClicked', () => {
            WebApp.setHeaderColor('secondary_bg_color')
        });
    })

    return (
        <>
            <BackButton />
            <Gallery
                onPageChange={handlePageChange}
            >
                <Page1 />
                <Page2 />
                <Page3 />
            </Gallery>
           <div className='BottomButtons'>
                <Button variant='filled' label='Start exploring TON' isFill isShine />
                <Button variant='tinted' label='Add Existing Wallet' isFill />
                <SectionHeader type="Footer" title="By continuing you agree to Terms of Service and User Agreement." style={{ 'textAlign': 'center' }} />
            </div>
        </>
    );
};

export default Onboarding;

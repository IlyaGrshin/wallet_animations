import React, { useState, useRef, useEffect } from 'react';

import SectionList from '../../Components/SectionList'
import Cell from '../../Components/Cell'
import PageTransition from '../../Components/PageTransition'
import ModalView from '../../Components/ModalView'
import PanelHeader from '../../Components/PanelHeader'

import ToncoinLogo from '../../Icons/Avatars/TON.png';
import DollarsLogo from '../../Icons/Avatars/Dollars.png';
import BitcoinLogo from '../../Icons/Avatars/Bitcoin.png';

import WebApp from '@twa-dev/sdk';
import { BackButton, MainButton } from '@twa-dev/sdk/react'

const TextPage = () => {
    const inputRef = useRef(null);

    const handleFocus = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleFocus();
        }, 50);
      
        return () => clearTimeout(timer);
    }, []);
    

    const [isModalOpen, setIsModalOpen] = useState({
        'modal3': false
    });

    const openModal = (ID) => {
        setIsModalOpen((prevState) => ({
            ...prevState,
            [ID]: true,
        }));
    };

    const closeModal = (ID) => {
        setIsModalOpen((prevState) => ({
            ...prevState,
            [ID]: false,
        }));

        // setInterval(() => {
        //     handleFocus()
        //     WebApp.MainButton
        //         .show()
        //         .setText('Continue')
        //         .onClick(() => openModal('modal3'))
        // }, 1)
    };

    return (
        <PageTransition>
            <BackButton />
            <SectionList>
                <SectionList.Item>
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder='Enter text...'  
                    />
                </SectionList.Item>
            </SectionList>
            <MainButton text='Continue' onClick={() => openModal('modal3')} />
            {isModalOpen.modal3 && (
                <ModalView 
                    key='modal1'
                    isOpen={isModalOpen.modal3} 
                    onClose={() => closeModal('modal3')} 
                    style={{ 'backgroundColor': 'var(--tg-theme-secondary-bg-color)' }}
                >
                    <PanelHeader>Modal (Framer)</PanelHeader>
                    <SectionList>
                        <SectionList.Item>
                            <Cell
                                start={<Cell.Start type="Image" src={ToncoinLogo} />}
                            >
                                <Cell.Text 
                                    title='Toncoin' 
                                    description='100 TON'
                                    bold
                                />
                            </Cell>
                            <Cell
                                start={<Cell.Start type="Image" src={DollarsLogo} />}
                            >
                                <Cell.Text 
                                    title='Dollars' 
                                    description='100 USDT'
                                    bold
                                />
                            </Cell>
                            <Cell
                                start={<Cell.Start type="Image" src={BitcoinLogo} />}
                            >
                                <Cell.Text 
                                    title='Bitcoin' 
                                    description='0.000001 BTC'
                                    bold
                                />
                            </Cell>
                        </SectionList.Item>
                    </SectionList>
                    <MainButton text='Confirm' onClick={() => { 
                        closeModal('modal3')
                    }} />
                </ModalView>
            )}
        </PageTransition>
    )
}

export default React.memo(TextPage);
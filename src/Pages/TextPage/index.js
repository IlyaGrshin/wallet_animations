import React, { useState } from 'react';

import SectionList from '../../Components/SectionList'
import Cell from '../../Components/Cell'
import { BackButton, MainButton } from '@twa-dev/sdk/react'
import PageTransition from '../../Components/PageTransition'
import ModalView from '../../Components/ModalView'
import PanelHeader from '../../Components/PanelHeader'

import ToncoinLogo from '../../Icons/Avatars/TON.png';
import DollarsLogo from '../../Icons/Avatars/Dollars.png';
import BitcoinLogo from '../../Icons/Avatars/Bitcoin.png';

const TextPage = () => {
    const [isModalOpen, setIsModalOpen] = useState({
        'modal1': false
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
    };

    return (
        <PageTransition>
            <BackButton />
            <SectionList>
                <SectionList.Item>
                    <input 
                        type="text" 
                        placeholder='Enter text...' 
                        autoFocus 
                    />
                </SectionList.Item>
            </SectionList>
            <ModalView
                key='modal1'
                isOpen={isModalOpen.modal1} 
                onClose={() => closeModal('modal1')} 
                style={{ 'backgroundColor': 'var(--tg-theme-secondary-bg-color)' }}
            >
                <PanelHeader>Choose asset</PanelHeader>
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
                <MainButton 
                    text='Confirm'
                    onClick={() => closeModal('modal1')}
                />
            </ModalView>
            <MainButton 
                text='Continue'
                onClick={() => openModal('modal1')}
            />
        </PageTransition>
    )
}

export default React.memo(TextPage);
import { useState } from 'react';
import { Link } from 'react-router-dom';

import PageTransition from "../../Components/PageTransition";

import SectionList from '../../Components/SectionList';
import Cell from "../../Components/Cell";
import Switch from "../../Components/Switch";
import ModalView from '../../Components/ModalView';
import DropdownMenu from '../../Components/DropdownMenu';

const UI = () => {
    const [isModalOpen, setIsModalOpen] = useState({
        'modal1': false,
        'modal2': false
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
             <SectionList>
                <SectionList.Item>
                    <Cell as={Link} to='wallet'>
                        <Cell.Text type='Accent' title='Open Wallet UI' />
                    </Cell>
                    <Cell as={Link} to='tonspace'>
                        <Cell.Text type='Accent' title='Open TON Space' />
                    </Cell>
                    <Cell as={Link} to='onboarding'>
                        <Cell.Text type='Accent' title='Open Onboarding' />
                    </Cell>
                </SectionList.Item>
                <SectionList.Item>
                    <Cell>
                        <Cell.Text title='Label' descrption='Subtitle' />
                    </Cell>
                    <Cell>
                        <Cell.Text title='Label' bold />
                    </Cell>
                    <Cell
                        end={
                            <Cell.Part type='Switch'>
                                <Switch />
                            </Cell.Part>
                        }
                    >
                        <Cell.Text title='Wi-Fi' />
                    </Cell>
                    <Cell
                        end={
                            <Cell.Part type='Dropdown'>
                                <DropdownMenu items={['Option 1', 'Option 2', 'Option 3']} />
                            </Cell.Part>
                        }
                    >
                        <Cell.Text title='Label' />
                    </Cell>
                    <Cell
                        onClick={() => openModal('modal1')}
                    >
                        <Cell.Text type='Accent' title='Open Modal' />
                    </Cell>
                </SectionList.Item>
            </SectionList>
            <ModalView 
                key='modal1'
                isOpen={isModalOpen.modal1} 
                onClose={() => closeModal('modal1')} 
                style={{ 'backgroundColor': 'var(--tg-theme-secondary-bg-color)' }}
            >
                <SectionList>
                    <SectionList.Item>
                        <Cell><Cell.Text title='Item 1' /></Cell>
                        <Cell><Cell.Text title='Item 2' /></Cell>
                        <Cell><Cell.Text title='Item 3' /></Cell>
                    </SectionList.Item>
                </SectionList>
            </ModalView>
        </PageTransition>
    )
}

export default UI;
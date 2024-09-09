import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import PageTransition from "../../Components/PageTransition";

import Card from "../../Components/Card";
import Cell from "../../Components/Cell";
import Switch from "../../Components/Switch";
import ModalView from '../../Components/ModalView';

import './index.css'

const UI = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <PageTransition>
            <div className='ui'>
                <Card>
                    <Cell as={Link} to='wallet'>
                        <Cell.Text
                            type='Accent'
                            title='Open Wallet UI'
                        />
                    </Cell>
                    <Cell>
                        <Cell.Text
                            title='Label'
                            descrption='Subtitle'
                        />
                    </Cell>
                    <Cell>
                        <Cell.Text 
                            title='Label'
                            bold
                        />
                    </Cell>
                    <Cell
                        end={
                            <Cell.Part type='Switch'>
                                <Switch />
                            </Cell.Part>
                        }
                    >
                        <Cell.Text
                            title='Wi-Fi'
                        />
                    </Cell>
                    <Cell
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Cell.Text
                            type='Accent'
                            title='Open Modal'
                        />
                    </Cell>
                </Card>
            </div>
            <ModalView isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <p>Это содержимое модального окна.</p>
            </ModalView>
        </PageTransition>
    )
}

export default UI;
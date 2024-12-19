import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

import PageTransition from '../../Components/PageTransition';

import Card from '../../Components/Card';
import Text from '../../Components/Text';
import SectionList from '../../Components/SectionList';
import Cell from '../../Components/Cell';
import Morph from '../../Components/Morph'
import { Spoiler } from 'spoiled';
import Stacks from '../../Components/Stacks';

import './index.css';

import { ReactComponent as ArrowUpCircleFill } from '../../Icons/28/Arrow Up Circle Fill.svg'
import { ReactComponent as ArrowLiftAndRightCircleFill28 } from '../../Icons/28/Arrow Left & Right Circle Fill.svg';
import { ReactComponent as PlusCircleFill28 } from '../../Icons/28/Plus Circle Fill.svg'
import { ReactComponent as CreditCardFill28 } from '../../Icons/28/Credit Card Fill.svg'

import WebApp from '@twa-dev/sdk';

function Balance() {
    const [balance, setBalance] = useState('$30.06');
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const updateBalance = () => {
            if (!hidden) {
                const randomBalance = '$' + (Math.random() * 2000).toFixed(2);
                setBalance(randomBalance);
            }
        };

        const interval = setInterval(updateBalance, 1000);

        return () => clearInterval(interval);
    }, [hidden]);

    return (
        <Card className='balance'>
            <Text 
                apple={{
                    variant: 'body',
                    weight: 'regular'
                }}
                material={{
                    variant: 'body1',
                    weight: 'regular'
                }}
                className='label'
            >
                Wallet Balance
            </Text>
            <Spoiler className='amount' hidden={hidden} onClick={() => setHidden((s) => !s)}>
                <Morph>
                    {balance}
                </Morph>
            </Spoiler>
        </Card>
    );
}

function ActionButtons() {
    const buttons = [
        {
            icon: <ArrowUpCircleFill />,
            name: 'Send',
        },
        {
            icon: <PlusCircleFill28 />,
            name: 'Add Crypto',
        },
        {
            icon: <ArrowLiftAndRightCircleFill28 />,
            name: 'Exchange',
        },
        {
            icon: <CreditCardFill28 />,
            name: 'Sell',
        },
    ]

    return (
        <Card className='buttons'>
            {buttons.map((button, index) => (
                <motion.div 
                    className='button' 
                    key={`button-${index}`}
                    whileTap={{ scale: 0.90 }}
                >
                    {button.icon}
                    <Text 
                        apple={{
                            variant: 'caption2',
                            weight: 'medium'
                        }} 
                        material={{
                            variant: 'subtitle2',
                            weight: 'medium'
                        }}
                    >
                        {button.name}
                    </Text>
                </motion.div>
            ))}
         </Card>
    )
}

function TransactionList() {
    const txHistory = [
        {
            name: 'Alicia Torreaux',
            date: 'July 3 at 11:24',
            value: '+200 TON',
            status: 'Received',
        },
        {
            name: 'Bob',
            date: 'July 3 at 11:24',
            value: '25 TON',
            status: 'Sent',
        },
        {
            name: 'Purchased',
            date: 'July 3 at 11:24',
            value: '100 TON',
            status: 'Received',
        },
        {
            name: 'Ilya G',
            date: 'July 3 at 11:24',
            value: '5 TON',
            status: 'Sent',
        },
    ];

    return (
        <SectionList>
            <SectionList.Item 
                header="Transaction History"
                footer="Section Description"
            >
                {txHistory.map((tx, index) => (
                    <Cell 
                        start={ <Cell.Start type='Icon' /> }
                        end={ <Cell.Text title={tx.value} description={tx.status} /> }
                        key={ `tx-${index}` }
                    >
                        <Cell.Text title={tx.name} description={tx.date} bold />
                    </Cell>
                ))}
            </SectionList.Item>
        </SectionList> 
    )
}

function Wallet() {
    useEffect(() => {
        WebApp.setHeaderColor('secondary_bg_color')
        WebApp.setBackgroundColor('secondary_bg_color')
    })

    return (
        <>
            {/* <BackButton /> */}
            <div className='wallet'>
                <PageTransition>
                    <Balance />
                    <ActionButtons />
                    <Stacks />
                    <TransactionList />
                </PageTransition>
            </div>
        </>
    );
}

export default React.memo(Wallet);
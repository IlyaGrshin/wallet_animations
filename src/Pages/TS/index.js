import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

import PageTransition from "../../Components/PageTransition"

import Text from "../../Components/Text"
import Cell from "../../Components/Cell"
import SectionList from "../../Components/SectionList"
import Morph from '../../Components/Morph';
import { Spoiler } from 'spoiled';

import { ReactComponent as ArrowUpCircleFill } from '../../Icons/28/Arrow Up Circle Fill.svg'
import { ReactComponent as ArrowLiftAndRightCircleFill28 } from '../../Icons/28/Arrow Left & Right Circle Fill.svg';
import { ReactComponent as PlusCircleFill28 } from '../../Icons/28/Plus Circle Fill.svg'

import ToncoinLogo from '../../Icons/Avatars/Toncoin.svg';
import DollarsLogo from '../../Icons/Avatars/Dollars.svg';

import WebApp from '@twa-dev/sdk';

import './index.css';

function Profile() {
    const [balance, setBalance] = useState('$261.69');
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
        <div className='profile'>
            <div className='data'>
                {/* <div className='avatar' style={{ backgroundImage: `url(${Avatar})` }}></div> */}
                <div className='balances'>
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
                        TON Space Balance
                    </Text>
                    <Spoiler className='amount' hidden={hidden} onClick={() => setHidden((s) => !s)}>
                        <Morph>
                            {balance}
                        </Morph>
                    </Spoiler>
                </div>
            </div>
            <div className="buttons">
                <motion.div 
                    className='button'
                    whileTap={{ scale: 0.97 }}
                >
                    <ArrowUpCircleFill />
                    <Text 
                        apple={{
                            variant: 'caption2',
                            weight: 'medium'
                        }}
                        material={{
                            variant: 'caption2',
                            weight: 'medium'
                        }}
                        className='label'
                    >
                        Send
                    </Text>
                </motion.div>
                <motion.div 
                    className='button'
                    whileTap={{ scale: 0.97 }}
                >
                    <PlusCircleFill28 />
                    <Text 
                        apple={{
                            variant: 'caption2',
                            weight: 'medium'
                        }}
                        material={{
                            variant: 'caption2',
                            weight: 'medium'
                        }}
                        className='label'
                    >
                        Deposit
                    </Text>
                </motion.div>
                <motion.div 
                    className='button'
                    whileTap={{ scale: 0.97 }}
                >
                    <ArrowLiftAndRightCircleFill28 />
                    <Text 
                        apple={{
                            variant: 'caption2',
                            weight: 'medium'
                        }}
                        material={{
                            variant: 'caption2',
                            weight: 'medium'
                        }}
                        className='label'
                    >
                        Swap
                    </Text>
                </motion.div>
            </div>
        </div>
    )
}

function Assets() {
    const assets = [
        {
            name: 'Toncoin',
            price: '$7.70',
            value: '$0.00', 
            image: ToncoinLogo,
        },
        {
            name: 'USD Tether',
            price: '$1.00',
            value: '$0.00',
            image: DollarsLogo,
        }
    ];

    return (
        assets.map((asset, index) => (
            <Cell 
                start={ <Cell.Start type='Image' src={asset.image} /> }
                end={ <Cell.Text title={asset.value} /> }
                key={ `tx-${index}` }
            >
                <Cell.Text title={asset.name} description={asset.price} bold />
            </Cell>
        ))
    );
}

function Staking() {
    const assets = [
        {
            name: 'Staking',
            subtitle: 'APY up to 4.50%',
        }
    ];

    return (
        assets.map((asset, index) => (
            <Cell 
                start={ <Cell.Start type='Icon' /> }
                end={ <Cell.Part type='Chevron' /> }
                key={ `tx-${index}` }
            >
                <Cell.Text title={asset.name} description={asset.subtitle} bold />
            </Cell>
        ))
    );
}

function Collectibles() {
    return (
        <div className='placeholder'>
            <Text 
                apple={{
                    variant: 'body'
                }}
                material={{
                    variant: 'body1'
                }}
            >
                As you get collectibles, they will appear here.
            </Text>
        </div>
    )
}

function Activity() {
    const items = [
        {
            name: 'Sent',
            address: 'to UQDs...1Koh',
            amount: '1 TON',
            time: 'Today'
        },
        {
            name: 'Received',
            address: 'from UQDs...1Koh',
            amount: '+1 TON',
            time: 'Yesterday'
        },
        {
            name: 'Sent',
            address: 'to saint.ton',
            amount: '1 TON',
            time: 'Feb 29'
        },
        {
            name: 'Received',
            address: 'from andrew.ton',
            amount: '+1 TON',
            time: 'Feb 29'
        },
    ];

    return (
        <>
            {items.map((item, index) => (
                <Cell 
                    start={ <Cell.Start type='Icon' /> }
                    end={ <Cell.Text title={item.amount} description={item.time} /> }
                    key={ `tx-${index}` }
                >
                    <Cell.Text title={item.name} description={item.address} bold />
                </Cell>
            ))}
            <Cell
                end={ <Cell.Part type='Chevron' /> }
            >
                <Cell.Text title='Show All' />
            </Cell>
        </>
    );
}

function FAQ() {
    const questions = [
        'What is Wallet Earn? How does it work?',
        'How are rewards assigned? Can I withdraw them early?',
        'Can I withdraw only a part of my USDT from Wallet Earn and continue to use it?',
    ];

    return (
        <>
            {questions.map((question, index) => (
                <Cell 
                    end={ <Cell.Part type='Chevron' /> }
                    key={ `tx-${index}` 
                }>
                    <Cell.Text title={question} />
                </Cell>
            ))}
            <Cell>
                <Cell.Text type='Accent' title='Learn More' />
            </Cell>
        </>
    );
}

function TONSpace() {
    useEffect(() => {
        WebApp.setHeaderColor('#131314')
        WebApp.setBackgroundColor('#131314')
    })

    return (
        <>
            {/* <BackButton /> */}
            <div className="ton-space">
                <PageTransition>
                    <Profile />
                    <SectionList>
                        <SectionList.Item header='Assets'> 
                            <Assets />
                        </SectionList.Item>
                        <SectionList.Item>
                            <Staking />
                        </SectionList.Item>
                        <SectionList.Item header='Collectibles'>
                            <Collectibles />
                        </SectionList.Item>
                        <SectionList.Item header='Activity'>
                            <Activity />
                        </SectionList.Item>
                        <SectionList.Item>
                            <FAQ />
                        </SectionList.Item>
                    </SectionList>
                </PageTransition>
            </div>
        </>
    )
}

export default React.memo(TONSpace);
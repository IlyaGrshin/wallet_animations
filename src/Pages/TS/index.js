import { useEffect } from 'react';

import PageTransition from "../../Components/PageTransition"

import Text from "../../Components/Text"
import Cell from "../../Components/Cell"
import SectionList from "../../Components/SectionList"

import Avatar from '../../Icons/Avatars/IlyaG.png';
import ToncoinLogo from '../../Icons/Avatars/TON.png';
import DollarsLogo from '../../Icons/Avatars/Dollars.png';

import WebApp from '@twa-dev/sdk';

import './index.css';

function Profile() {
    return (
        <div className='profile'>
            <div className='data'>
                <div className='avatar' style={{ backgroundImage: `url(${Avatar})` }}></div>
                <div className='balances'>
                    <Text className='label' variant='body'>Your TON Space</Text>
                    <Text className='amount' variant='title1' weight='bold' rounded>$350.57</Text>
                </div>
            </div>
            <div className="buttons">
                <div className='button'>
                    <div className='icon'></div>
                    <Text className='label' variant='caption2' weight='medium'>Send</Text>
                </div>
                <div className='button'>
                    <div className='icon'></div>
                    <Text className='label' variant='caption2' weight='medium'>Deposit</Text>
                </div>
                <div className='button'>
                    <div className='icon'></div>
                    <Text className='label' variant='caption2' weight='medium'>Swap</Text>
                </div>
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
                <Cell.Text title={asset.name} descrpition={asset.price} bold />
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
                end={ <Cell.Text title={asset.value} /> }
                key={ `tx-${index}` }
            >
                <Cell.Text title={asset.name} descrpition={asset.subtitle} bold />
            </Cell>
        ))
    );
}

function Collectibles() {
    return (
        <div className='placeholder'>
            <Text variant='body'>
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
                    end={ <Cell.Text title={item.amount} descrpition={item.time} /> }
                    key={ `tx-${index}` }
                >
                    <Cell.Text title={item.name} descrpition={item.address} bold />
                </Cell>
            ))}
            <Cell>
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
                <Cell key={ `tx-${index}` }>
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
        WebApp.setHeaderColor('131314')
    })

    return (
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
    )
}

export default TONSpace
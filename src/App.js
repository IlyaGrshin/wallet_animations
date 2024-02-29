import { useState } from 'react';
import { motion } from 'framer-motion';

import Card from './Components/Card';
import Text from './Components/Text';
import ListItem from './Components/ListItem';
import SectionHeader from './Components/SectionHeader';

import './App.css';

import { ReactComponent as ArrowUpCircleFill } from './Icons/28/Arrow Up Circle Fill.svg'
import { ReactComponent as ArrowLiftAndRightCircleFill28 } from './Icons/28/Arrow Left & Right Circle Fill.svg';
import { ReactComponent as PlusCircleFill28 } from './Icons/28/Plus Circle Fill.svg'
import { ReactComponent as CreditCardFill28 } from './Icons/28/Credit Card Fill.svg'

import TonSpaceLogo from './Icons/Avatars/IlyaG.png';
import ToncoinLogo from './Icons/Avatars/TON.png';
import DollarsLogo from './Icons/Avatars/Dollars.png';
import BitcoinLogo from './Icons/Avatars/Bitcoin.png';

function Balance() {
    return (
        <Card className='balance'>
            <Text variant='body' weight='regular'>Total Balance</Text>
            <div className='amount'>
                <span className='symbol'>$</span>250.64
            </div>
        </Card>
    )
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
                    <Text variant='subheadline2 rounded' weight='semibold'>
                        {button.name}
                    </Text>
                </motion.div>
            ))}
         </Card>
    )
}

function Assets() {
    const [expandedAssets, setExpandedAssets] = useState(true); 

    const assets = [
        {
            name: 'TON Space',
            coins: '0 TON',
            value: '$0.00', 
            image: TonSpaceLogo,
        },
        {
            name: 'Toncoin',
            coins: '100 TON',
            value: '$150.00',
            image: ToncoinLogo,
        },
        {
            name: 'Dollars',
            coins: '50 TON',
            value: '$50.00',
            image: DollarsLogo,
        },
        {
            name: 'Bitcoin',
            coins: '0.000011 BTC',
            value: '$50.64',
            image: BitcoinLogo,
        },
    ];

    const toggleAssets = () => {
        setExpandedAssets(!expandedAssets);
    }

    const containerVariants = {
        expanded: { 
            padding: '4px 16px 24px 16px',
        },
        collapsed: { 
            padding: '4px 16px 12px 16px',
        }
    };

    const itemVariants = {
        collapsed: index => ({
            zIndex: index === 2 ? 1 : 0,
            scale: index === 3 ? 0.89 : 1,
            marginTop: index === 3 ? '-60px' : 0,
            opacity: index === 3 ? 0.64 : 1
        }),
        expanded: index => ({
            zIndex: index === 2 ? 1 : 0,
            scale: 1,
            marginTop: 0,
            opacity: 1
        })
    };

    return (
        <motion.div
            initial={false}
            animate={expandedAssets ? 'expanded' : 'collapsed'}
            variants={containerVariants}
            onClick={toggleAssets}
        >
            <Card className={`assets ${expandedAssets ? '' : 'collapsed'}`}>
                {assets.map((asset, index) => (
                    <motion.div 
                        className='asset' 
                        key={`asset-${index}`}
                        variants={itemVariants}
                        custom={index}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <ListItem 
                            leftProps={{ type: 'Image', src: asset.image }}
                            bodyProps={{ label: asset.name, caption: asset.coins}}
                            rightProps={{ label: asset.value }}
                        />
                    </motion.div>
                ))}
            </Card>
        </motion.div>
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
            name: 'Purchased by Bank Card',
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
        <Card className='transactions'>
            <SectionHeader title='Transactions history' />
            {txHistory.map((tx, index) => (
                <ListItem 
                    bodyProps={{ label: tx.name, caption: tx.date }}
                    rightProps={{ label: tx.value, caption: tx.status }}
                    key={`tx-${index}`}
                />
            ))}
        </Card> 
    )
}

function App() {
    return (
        <div>
            <Balance />
            <ActionButtons />
            <Assets />
            <TransactionList />
        </div>
    );
}

export default App

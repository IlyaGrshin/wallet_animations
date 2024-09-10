import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import PageTransition from '../../Components/PageTransition';

import Card from '../../Components/Card';
import Text from '../../Components/Text';
import SectionList from '../../Components/SectionList';
import Cell from '../../Components/Cell';

import './index.css';

import { ReactComponent as ArrowUpCircleFill } from '../../Icons/28/Arrow Up Circle Fill.svg'
import { ReactComponent as ArrowLiftAndRightCircleFill28 } from '../../Icons/28/Arrow Left & Right Circle Fill.svg';
import { ReactComponent as PlusCircleFill28 } from '../../Icons/28/Plus Circle Fill.svg'
import { ReactComponent as CreditCardFill28 } from '../../Icons/28/Credit Card Fill.svg'

import TonSpaceLogo from '../../Icons/Avatars/IlyaG.png';
import ToncoinLogo from '../../Icons/Avatars/TON.png';
import DollarsLogo from '../../Icons/Avatars/Dollars.png';
import BitcoinLogo from '../../Icons/Avatars/Bitcoin.png';

export function Morph({ children }) {
    function generateKeys(text) {
        const charCount = {};
        return text.split("").map((char, index) => {
            if (!charCount[char]) {
                charCount[char] = 0;
            }
            const key = `${char}-${charCount[char]}-${index}`;
            charCount[char]++;
            return { char, key };
        });
    }

    const textToDisplay = generateKeys(children);

    return (
        <AnimatePresence mode='popLayout' initial={false}>
            {textToDisplay.map(({ char, key }) => (
                <motion.span
                    key={key}
                    layoutId={key}
                    className='balanceDigit'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 0.25,
                        type: 'spring',
                        bounce: 0,
                        opacity: {
                            duration: 0.35,
                            type: 'spring',
                            bounce: 0,
                        },
                    }}
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </AnimatePresence>
    );
}

function Balance() {
    const [balance, setBalance] = useState('$30.06');

    useEffect(() => {
        const updateBalance = () => {
            // Генерация случайного баланса в пределах тысячи
            const randomBalance = '$' + (Math.random() * 2000).toFixed(2);
            setBalance(randomBalance);
        };

        // Обновляем баланс каждую секунду
        const interval = setInterval(updateBalance, 1000);

        // Очищаем интервал при размонтировании компонента
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className='balance'>
            <Text variant='body' weight='regular'>Total Balance</Text>
            <div className='amount'>
                <Morph>{balance}</Morph>
            </div>
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
                    <Text variant='subheadline2' weight='semibold' rounded>
                        {button.name}
                    </Text>
                </motion.div>
            ))}
         </Card>
    )
}

function Assets() {
    const [expandedAssets, setExpandedAssets] = useState(false); 

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
        {
            name: '1 Bitcoin',
            coins: '0.000011 BTC',
            value: '$50.64',
            image: BitcoinLogo,
        },
        {
            name: '2 Bitcoin',
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
        collapsed: index => {
            // Показываем только первые два актива в свернутом состоянии
            if (index < 2) {
                return {
                    scale: 1,
                    opacity: 1,
                    marginTop: 0,
                    zIndex: 10 - index,
                    top: 0
                };
            } else if (index === 2) {
                return {
                    scale: 0.91,
                    opacity: 0.9,
                    marginTop: '-64px',
                    zIndex: 10 - index,
                    top: 0
                };
            } else if (index === 3) {
                return {
                    scale: 0.82,
                    opacity: 0.8,
                    marginTop: '-73px',
                    zIndex: 10 - index,
                    top: '9px'
                };
            } else if (index > 3) {
                return {
                    scale: 0.82,
                    opacity: 0,
                    marginTop: '-73px',
                    zIndex: 10 - index,
                    top: '9px'
                };
            }
        },
        expanded: index => ({
            scale: 1,
            opacity: 1,
            marginTop: 0,
            zIndex: 10 - index,
            top: 0
        }),
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
                        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <Cell 
                            start={ null }
                            end={ <Cell.Text title={asset.value} /> }
                            key={ `tx-${index}` }
                        >
                            <Cell.Text title={asset.name} descrpition={asset.coins} bold />
                        </Cell>
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
                        end={ <Cell.Text title={tx.value} descrpition={tx.status} /> }
                        key={ `tx-${index}` }
                    >
                        <Cell.Text title={tx.name} descrpition={tx.date} bold />
                    </Cell>
                ))}
            </SectionList.Item>
            <SectionList.Item>
                <Cell as={Link} to='/'>
                    <Cell.Text
                        type='Accent'
                        title='Back to UI'
                    />
                </Cell>
            </SectionList.Item>
        </SectionList> 
    )
}

function Wallet() {
    return (
        <div className='wallet'>
            <PageTransition>
                <Balance />
                <ActionButtons />
                <Assets />
                <TransactionList />
            </PageTransition>
        </div>
    );
}

export default Wallet;
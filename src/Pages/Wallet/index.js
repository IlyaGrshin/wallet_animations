import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import PageTransition from '../../Components/PageTransition';

import Card from '../../Components/Card';
import Text from '../../Components/Text';
import SectionList from '../../Components/SectionList';
import Cell from '../../Components/Cell';
import { apple } from '../../Components/DeviceProvider'

import './index.css';

import { ReactComponent as ArrowUpCircleFill } from '../../Icons/28/Arrow Up Circle Fill.svg'
import { ReactComponent as ArrowLiftAndRightCircleFill28 } from '../../Icons/28/Arrow Left & Right Circle Fill.svg';
import { ReactComponent as PlusCircleFill28 } from '../../Icons/28/Plus Circle Fill.svg'
import { ReactComponent as CreditCardFill28 } from '../../Icons/28/Credit Card Fill.svg'

import TonSpaceLogo from '../../Icons/Avatars/IlyaG.png';
import ToncoinLogo from '../../Icons/Avatars/TON.png';
import DollarsLogo from '../../Icons/Avatars/Dollars.png';
import BitcoinLogo from '../../Icons/Avatars/Bitcoin.png';

import { BackButton } from '@twa-dev/sdk/react';

function Morph({ children }) {
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
                    style={{ display: 'inline-block' }}
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
            const randomBalance = '$' + (Math.random() * 2000).toFixed(2);
            setBalance(randomBalance);
        };

        const interval = setInterval(updateBalance, 1000);

        return () => clearInterval(interval);
    }, []);

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
            <div className='amount'>
                {<Morph>{balance}</Morph>}
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

function AnimatedCell({ expandedAssets, index }) {

    const transition = { ease: [0.26, 0.08, 0.25, 1], duration: 0.2 };

    const logos = apple
    ? [
        {
            src: ToncoinLogo,
            zIndex: 2,
            variants: {
                collapsed: { scale: 0.6, top: '-6px', left: '-6px' },
                expanded: { scale: 1, top: 0, left: 0 },
            },
        },
        {
            src: BitcoinLogo,
            zIndex: 1,
            variants: {
                collapsed: { scale: 0.6, opacity: 1, top: '6px', left: '6px' },
                expanded: { scale: 0, opacity: 0, top: 0, left: 0 },
            },
        },
    ]
    : [
        {
            src: ToncoinLogo,
            zIndex: 2,
            variants: {
                collapsed: { scale: 0.6, top: '-6px', left: 0 },
                expanded: { scale: 1, top: 0, left: '6px' },
            },
        },
        {
            src: BitcoinLogo,
            zIndex: 1,
            variants: {
                collapsed: { scale: 0.6, opacity: 1, top: '6px', left: '12px' },
                expanded: { scale: 0, opacity: 0, top: 0, left: '18px' },
            },
        },
    ];

    const logosStyle = apple
    ? { position: 'relative', width: '40px', height: '40px' }
    : { position: 'relative', width: '42px', height: '42px', marginLeft: '-6px' }

    const animatedVariants = apple
    ? {
        moreAssets: {
          collapsed: { opacity: 1, top: 'calc(50% - 11px)' },
          expanded: { opacity: 0, top: 'calc(50% - 20px)' },
        },
        bodyTitle: {
          collapsed: { opacity: 0, top: 'calc(50% - 11px)' },
          expanded: { opacity: 1, top: 'calc(50% - 20px)' },
        },
        bodySubtitle: {
          collapsed: { opacity: 0, top: 'calc(50% + 11px)' },
          expanded: { opacity: 1, top: 'calc(50% + 2px)' },
        },
        endTitle1: {
          collapsed: { opacity: 0, top: 'calc(50% - 2px)', right: '16px' },
          expanded: { opacity: 1, top: 'calc(50% - 11px)', right: '16px' },
        },
        endTitle2: {
          collapsed: { opacity: 1, top: 'calc(50% - 11px)', right: '16px' },
          expanded: { opacity: 0, top: 'calc(50% - 20px)', right: '16px' },
        },
    }
    : {
        moreAssets: {
          collapsed: { opacity: 1, top: 'calc(50% - 10px)' },
          expanded: { opacity: 0, top: 'calc(50% - 20px)' },
        },
        bodyTitle: {
          collapsed: { opacity: 0, top: 'calc(50% - 10px)' },
          expanded: { opacity: 1, top: 'calc(50% - 20px)' },
        },
        bodySubtitle: {
          collapsed: { opacity: 0, top: 'calc(50% + 12px)' },
          expanded: { opacity: 1, top: 'calc(50% + 3px)' },
        },
        endTitle1: {
          collapsed: { opacity: 0, top: 'calc(50% - 3px)', right: '20px' },
          expanded: { opacity: 1, top: 'calc(50% - 10px)', right: '20px' },
        },
        endTitle2: {
          collapsed: { opacity: 1, top: 'calc(50% - 10px)', right: '20px' },
          expanded: { opacity: 0, top: 'calc(50% - 20px)', right: '20px' },
        },
    };

    return (
        <motion.div 
            className='asset'
            style={{ zIndex: 10 - index }}
        >
            <div className='Cell'>
                <div className='start'>
                    <div 
                        className="assetIcon"
                        style={logosStyle}
                    >
                        {logos.map((logo, index) => (
                            <motion.div
                                className='image' 
                                variants={logo.variants}
                                transition={transition}
                                animate={expandedAssets ? 'expanded' : 'collapsed'}
                                style={{ backgroundImage: `url(${logo.src})`, position: 'absolute', zIndex: logo.zIndex }}
                                key={`stack-asset-${index}`}
                            ></motion.div>
                        ))}
                    </div>
                </div>
                <div 
                    className='body'
                    style={{ position: 'relative' }}
                >
                    <motion.div
                        variants={animatedVariants.moreAssets}
                        transition={transition}
                        animate={expandedAssets ? 'expanded' : 'collapsed'}
                        style={{ transformOrigin: '0% 50%', position: 'absolute' }}
                    >
                        <Text 
                            apple={{ variant: 'body', weight: 'medium' }}
                            material={{ variant: 'body1', weight: 'medium' }}
                        >
                            More Assets
                        </Text>
                    </motion.div>
                    <motion.div
                        variants={animatedVariants.bodyTitle}
                        transition={transition}
                        animate={expandedAssets ? 'expanded' : 'collapsed'}
                        style={{ transformOrigin: '0% 50%', position: 'absolute' }}
                    >
                        <Text 
                            apple={{ variant: 'body', weight: 'medium' }}
                            material={{ variant: 'body1', weight: 'medium' }}
                            className='label'
                        >
                            Toncoin
                        </Text>
                    </motion.div>
                    <motion.div
                        variants={animatedVariants.bodySubtitle}
                        transition={transition}
                        animate={expandedAssets ? 'expanded' : 'collapsed'}
                        style={{ transformOrigin: '0% 50%', position: 'absolute' }}
                    >
                        <Text 
                            apple={{ variant: 'subheadline2', weight: 'regular' }}
                            material={{ variant: 'subtitle2', weight: 'regular' }}
                            className='caption' 
                        >
                            100 TON
                        </Text>
                    </motion.div>
                </div>
                <div className='end'>
                    <motion.div
                        variants={animatedVariants.endTitle1}
                        transition={transition}
                        animate={expandedAssets ? 'expanded' : 'collapsed'}
                        style={{ transformOrigin: '0% 50%', position: 'absolute' }}
                    >
                        <Text 
                            apple={{ variant: 'body', weight: 'regular' }}
                            material={{ variant: 'body1', weight: 'regular' }}
                            className='label'
                        >
                            $150.00
                        </Text>
                    </motion.div>
                    <motion.div
                        variants={animatedVariants.endTitle2}
                        transition={transition}
                        animate={expandedAssets ? 'expanded' : 'collapsed'}
                        style={{ transformOrigin: '0% 50%', position: 'absolute' }}
                    >
                        <Text 
                            apple={{ variant: 'body', weight: 'regular' }}
                            material={{ variant: 'body1', weight: 'regular' }}
                            className='label'
                        >
                            $201.92
                        </Text>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}

function Assets() {
    const [expandedAssets, setExpandedAssets] = useState(false); 

    const assets = [
        { name: 'Dollars', coins: '50 USDT', value: '$50.00', image: DollarsLogo },
        { isAnimated: true },
        // { name: 'Toncoin', coins: '100 TON', value: '$150.00', image: ToncoinLogo },
        // { name: 'Dollars', coins: '50 USDT', value: '$50.00', image: DollarsLogo },
        { name: 'Bitcoin', coins: '0.000011 BTC', value: '$50.64', image: BitcoinLogo },
        { name: '1 Bitcoin', coins: '0.000011 BTC', value: '$50.64', image: BitcoinLogo },
        { name: '2 Bitcoin', coins: '0.000011 BTC', value: '$50.64', image: BitcoinLogo },
    ];

    const toggleAssets = () => {
        setExpandedAssets(!expandedAssets);
    };

    const getItemVariant = (index) => {
        const baseVariant = {
            scale: 1,
            opacity: 1,
            marginTop: 0,
            zIndex: 10 - index,
            top: 0,
            backgroundColor: 'var(--tg-theme-section-bg-color)',
        };

        if (expandedAssets) {
            return baseVariant;
        }


        const scaleValueDefault = apple ? 0.82 : 1
        const scaleValueArray = apple
            ? [1, 1, 0.91, 0.82]
            : [1, 1, 1, 1]


        switch (index) {
            case 0:
                return baseVariant
            case 1:
                return {}
                // return baseVariant;
            case 2:
                return {
                    ...baseVariant,
                    scale: scaleValueArray[index],
                    opacity: 0.9,
                    marginTop: '-60px',
                    backgroundColor: 'var(--tg-theme-secondary-bg-color)',
            };
            case 3:
            return {
                    ...baseVariant,
                    scale: scaleValueArray[index],
                    opacity: 0.8,
                    marginTop: '-70px',
                    top: '9px',
                    backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                };
            default:
                return {
                    ...baseVariant,
                    scale: scaleValueDefault,
                    opacity: 0,
                    marginTop: '-70px',
                    top: '9px',
                    backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                };
            }
    };

    const getItemVariantInside = (index) => {
        if (index > 1) {
            return { opacity: expandedAssets ? 1 : 0 };
        }
        return {};
    };

    const getAssetColorFill = (index) => {
        if (expandedAssets) {
            return { opacity: 0 };
        }

        const opacities = {
            2: 0.72,
            3: 0.32,
        };

        return { opacity: opacities[index] || 0 };
    };

    const springValue = apple
        ? { type: 'spring', stiffness: 640, damping: 40 }
        : { type: 'spring', stiffness: 800, damping: 60, mass: 1 }

    return (
        <AnimatePresence initial={false}>
            <motion.div
                animate={expandedAssets ? 'expanded' : 'collapsed'}
                className={expandedAssets ? 'expanded' : 'collapsed'}
                onClick={toggleAssets}
            >
                <Card className="assets">
                    {assets.map((asset, index) => {
                        if (asset.isAnimated) {
                            return (
                                <AnimatedCell 
                                    key={`animated-cell-${index}`}
                                    expandedAssets={expandedAssets}
                                    toggleAssets={toggleAssets}
                                    index={index}
                                />
                            )
                        }

                        return(
                            <motion.div
                                className="asset"
                                key={`asset-${index}`}
                                animate={getItemVariant(index)}
                                transition={springValue}
                            >
                                <motion.div
                                    className="assetColorFill"
                                    animate={getAssetColorFill(index)}
                                    transition={{ ease: 'linear', duration: 0.15 }}
                                />
                                <motion.div
                                    animate={getItemVariantInside(index)}
                                    transition={{ ease: 'linear', duration: 0.15 }}
                                    style={{ position: 'relative' }}
                                >
                                <Cell
                                    start={<Cell.Start type="Image" src={asset.image} />}
                                    end={<Cell.Text title={asset.value} />}
                                    key={`tx-${index}`}
                                >
                                    <Cell.Text title={asset.name} description={asset.coins} bold />
                                </Cell>
                                </motion.div>
                            </motion.div>
                        )
                    })}
                </Card>
            </motion.div>
        </AnimatePresence>
    );
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
    return (
        <>
            {/* <BackButton /> */}
            <div className='wallet'>
                <PageTransition>
                    <Balance />
                    <ActionButtons />
                    <Assets />
                    <TransactionList />
                </PageTransition>
            </div>
        </>
    );
}

export default React.memo(Wallet);
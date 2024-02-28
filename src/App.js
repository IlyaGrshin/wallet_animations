import Card from './Components/Card';
import Text from './Components/Text';
import ListItem from './Components/ListItem';
import SectionHeader from './Components/SectionHeader';

import './App.css';

function App() {
    const buttons = [
        {
            name: 'Send',
        },
        {
            name: 'Add Crypto',
        },
        {
            name: 'Exchange',
        },
        {
            name: 'Sell',
        },
    ]

    const assets = [
        {
            name: 'TON Space',
            coins: '0 TON',
            value: '$0.00', 
        },
        {
            name: 'Toncoin',
            coins: '100 TON',
            value: '$150.00',
        },
        {
            name: 'Dollars',
            coins: '50 TON',
            value: '$50.00',
        },
        {
            name: 'Bitcoin',
            coins: '0.000011 BTC',
            value: '$50.64',
        },
    ];

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
        <div>
            <Card>
                <Text variant='body' weight='regular'>Total Balance</Text>
                $250.64
            </Card>
            <Card>
                {buttons.map((button, index) => (
                    <Text variant='subheadline2' weight='rounded semibold' key={index}>{button.name}</Text>
                ))}
            </Card>
            <Card>
                {assets.map((asset, index) => (
                    <ListItem 
                        bodyProps={{ label: asset.name, caption: asset.coins}}
                        rightProps={{ label: asset.coins, caption: asset.value }}
                        key={`asset-${index}`}
                    />
                ))}
            </Card>
            <Card>
                <SectionHeader title='Transactions History' />
                {txHistory.map((tx, index) => (
                    <ListItem 
                        bodyProps={{ label: tx.name, caption: tx.date }}
                        rightProps={{ label: tx.value, caption: tx.status }}
                        key={`tx-${index}`}
                    />
                ))}
            </Card>
        </div>
    );
}

export default App

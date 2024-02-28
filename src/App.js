import Card from './Components/Card';
import ListItem from './Components/ListItem';
import SectionHeader from './Components/SectionHeader';

import './App.css';

function App() {
    return (
        <div>
            <Card>
                Total Balance
                $250.64
            </Card>
            <Card>
                Send
                Add Crypto
                Exchange
                Sell
            </Card>
            <Card>
                <ListItem 
                    bodyProps={{ label: 'TON Space' }}
                    key={1}
                />
                <ListItem 
                    bodyProps={{ label: 'Toncoin' }}
                    key={2}
                />
                <ListItem 
                    bodyProps={{ label: 'Dollars' }}
                    key={3}
                />
                <ListItem 
                    bodyProps={{ label: 'Bitcoin' }}
                    key={4}
                />
            </Card>
            <Card>
                <SectionHeader title='Transactions History' />
                <ListItem 
                    bodyProps={{ label: 'Alicia Torreaux' }}
                    key={5}
                />
                <ListItem 
                    bodyProps={{ label: 'Bob' }}
                    key={6}
                />
                <ListItem 
                    bodyProps={{ label: 'Purchased by Bank Card' }}
                    key={7}
                />
                <ListItem 
                    bodyProps={{ label: 'Ilya G' }}
                    key={8}
                />
            </Card>
        </div>
    );
}

export default App

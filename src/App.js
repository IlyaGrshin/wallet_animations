import Card from './Components/Card'
import ListItem from './Components/ListItem';

import './App.css';

function App() {
    return (
        <div>
            <Card>
                <ListItem 
                    bodyProps={{ label: 'Label' }}
                />
                <ListItem 
                    bodyProps={{ label: 'Label' }}
                />
                <ListItem 
                    bodyProps={{ label: 'Label' }}
                />
            </Card>
        </div>
    );
}

export default App

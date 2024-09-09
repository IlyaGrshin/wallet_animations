import { Link } from 'react-router-dom';

import PageTransition from "../../Components/PageTransition";

import Card from "../../Components/Card";
import Cell from "../../Components/Cell";
import Switch from "../../Components/Switch";

import './index.css'

function UI () {
    return (
        <PageTransition>
            <div className='ui'>
                <Card>
                    <Cell as={Link} to='wallet'>
                        <Cell.Text
                            type='Accent'
                            title='Label'
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
                </Card>
            </div>
        </PageTransition>
    )
}

export default UI;
import { useState } from 'react';
import './index.css'

function Switch () {
    const [state, setState] = useState(false)

    const toggleSwitch = () => setState(!state);

    return (
        <div 
            className='Switch' 
            onClick={toggleSwitch} 
            data-state={state}
        >
        </div>
    )
}

export default Switch;
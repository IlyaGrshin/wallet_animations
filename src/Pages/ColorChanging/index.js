import React from 'react'
import Button from '../../Components/Button'
import WebApp from '@twa-dev/sdk'
import { BackButton } from '@twa-dev/sdk/react'

function ColorChanging () { 
    const [isSecondaryColor, setIsSecondaryColor] = React.useState(true)

    const switchColors = () => {
        if (isSecondaryColor) {
            WebApp.setHeaderColor('#131314')
            WebApp.setBackgroundColor('#131314')
        } else {
            WebApp.setHeaderColor('secondary_bg_color')
            WebApp.setBackgroundColor('secondary_bg_color')
        }
        setIsSecondaryColor(!isSecondaryColor)
        WebApp.HapticFeedback.impactOccurred('light')
    }

    return (
        <>
            <BackButton />
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <Button
                    variant='filled'
                    label='Change Color'
                    onClick={switchColors}
                />
            </div>
        </>
    )
}

export default React.memo(ColorChanging)

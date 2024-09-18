import Text from '../Text'

import './index.css'

const StartView = ({ title, description }) => {
    return (
        <div className='StartView'>
            <Text
                apple={{
                    variant: 'title1',
                    weight: 'bold'
                }}
                material={{
                    variant: 'headline5'
                }}
            >
                {title}
            </Text>
            <Text
                apple={{
                    variant: 'body',
                    weight: 'regular'
                }}
                material={{
                    variant: 'body1'
                }}
            >   
                {description}
            </Text>
        </div>
    )
}

export default StartView
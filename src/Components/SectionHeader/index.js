import Text from '../Text'
import './index.css'

function SectionHeader({ title, value }) {
	return (
		<div className='Section Headline'>
			<Text variant='title3' weight='bold'>
				{title}
			</Text>
			{value &&
			<Text variant='title3' weight='bold'>
				{value}
			</Text>
			}
		</div>
	)
}

export default SectionHeader
import Typography from '../Typography'
import './index.css'

function SectionHeader({ title, value }) {
	return (
		<div className='Section Headline'>
			<Typography variantStyle='title3' weight='bold'>
				{title}
			</Typography>
			{value &&
			<Typography variantStyle='title3' weight='bold'>
				{value}
			</Typography>
			}
		</div>
	)
}

export default SectionHeader
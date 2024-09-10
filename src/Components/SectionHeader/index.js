import Text from '../Text'
import './index.css'

function SectionHeader({ type, title, value }) {
	switch (type) {
		case 'Headline':
			return (
				<div className="SectionHeader">
					<Text variant='title3' weight='bold'>
						{title}
					</Text>
					{value && (
						<Text variant='title3' weight='bold'>
							{value}
						</Text>
					)}
				</div>
			)
		case 'Footer':
			return (
				<div className="SectionHeader Default">
					<Text variant='footnote'>
						{title}
					</Text>
				</div>
			)
		default:
			return (
				<div className="SectionHeader Default">
					<Text variant='footnote' caps>
						{title}
					</Text>
					{value && (
						<Text variant='footnote'>
							{value}
						</Text>
					)}
				</div>
			)
	};
}


export default SectionHeader
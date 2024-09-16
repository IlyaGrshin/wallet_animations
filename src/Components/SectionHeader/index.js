import Text from '../Text'
import './index.css'

function SectionHeader({ type, title, value }) {
	switch (type) {
		case 'Headline':
			return (
				<div className="SectionHeader Headline">
					<Text 
						apple={{
							variant: 'title3',
							weight: 'bold'
						}}
					>
						{title}
					</Text>
					{value && (
						<Text 
							apple={{
								variant: 'title3',
								weight: 'bold'
							}}
						>
							{value}
						</Text>
					)}
				</div>
			)
		case 'Footer':
			return (
				<div className="SectionHeader Footer">
					<Text 
						apple={{
							variant: 'footnote'
							}}
						>
						{title}
					</Text>
				</div>
			)
		default:
			return (
				<div className="SectionHeader Default">
					<Text 
						apple={{
							variant: 'footnote',
							caps: true
						}} 
					>
						{title}
					</Text>
					{value && (
						<Text 
							apple={{
								variant: 'footnote'
							}}
						>
							{value}
						</Text>
					)}
				</div>
			)
	};
}


export default SectionHeader
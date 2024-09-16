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
						material={{
							variant: 'headline6'
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
							material={{
								variant: 'body1',
								weight: 'regular'
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
						material={{
							variant: 'subtitle2'
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
						material={{
							variant: 'button1'
						}}
					>
						{title}
					</Text>
					{value && (
						<Text 
							apple={{
								variant: 'footnote'
							}}
							material={{
								variant: 'subtitle1',
								weight: 'regular'
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
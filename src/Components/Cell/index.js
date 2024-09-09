import Text from '../Text'
import './index.css'

const Cell = ({ start, children, end, onClick }) => {
	return (
		<div className='Cell' onClick={onClick}>
			{start && <div className='start'>{start}</div>}
			<div className='body'>{children}</div>
			{end && <div className='end'>{end}</div>}
		</div>
	)
}

Cell.Part = ({ type, children }) => {
	switch (type) {
		case 'Avatar':
			return <div className='avatar'>{children}</div>
		case 'Chevron':
			return <div className='chevron'>{children}</div>
		case 'Label':
			return <div className='label'>{children}</div>
		case 'Label&Chevron':
			return <div className='label-chevron'>{children}</div>
		case 'Counter&Chevron':
			return <div className='counter-chevron'>{children}</div>
		case 'Label&Icon':
			return <div className='label-icon'>{children}</div>
		case 'Dropdown':
			return <div className='dropdown'>{children}</div>
		case 'Checkmark':
			return <div className='checkmark'>{children}</div>
		case 'Switch':
			return <div className='switch'>{children}</div>
		case 'Picker':
			return <div className='picker'>{children}</div>
		case 'Icon':
			return <div className='icon'>{children}</div>
		case 'SegmentedControl':
			return <div className='segmented-control'>{children}</div>
		case 'Checkbox':
			return <div className='checkbox'>{children}</div>
		case 'Button':
			return <div className='button'>{children}</div>
		default:
			return <></>
	}
}

Cell.Start = ({ type, src = null, iconType = null }) => {
	let content;

	switch (type) {
		case 'Image':
			content = <div className='image' style={{ backgroundImage: `url(${src})` }}></div>
			break;
		case 'Icon':
			content = <div className='icon'>{iconType}</div>
			break;
		default:
			content = null
			break;
	}

	return (
		<>
			{content}
		</>
	)
}

Cell.Text = ({ title, descrpition, bold }) => {
	let weight = bold ? 'medium' : 'regular'

	return (
		<>
			<Text className='label' variant='body' weight={weight}>
  				{title}
			</Text>
			{descrpition && (
				<Text className='caption' variant='subheadline2' weight='regular'>
					{descrpition}
				</Text>
			)}
		</>
	)
}

Cell.End = ({ label, caption, type }) => {
	return (
		<>
				<Text className='label' variant='body' weight='regular'>
					{label}
				</Text>
			{caption && (
				<Text className='caption' variant='subheadline2' weight='regular'>
					{caption}
				</Text>
			)}
		</>
	)
}

export default Cell
import Text from '../Text'
import './index.css'

function ListItemLeft({ type, src = null, iconType = null }) {
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
		<div className='left'>
			{content}
		</div>
	)
}

function ListItemBody({ label, caption }) {
	return (
		<div className='body'>
			<Text className='label' variant='body' weight='regular'>
  				{label}
			</Text>
			{caption && (
				<Text className='caption' variant='subheadline2' weight='regular'>
					{caption}
				</Text>
			)}
		</div>
	)
}

function ListItemRight({ label, caption, type }) {
	return (
		<div className='right'>
				<Text className='label' variant='body' weight='regular'>
					{label}
				</Text>
			{caption && (
				<Text className='caption' variant='subheadline2' weight='regular'>
					{caption}
				</Text>
			)}
		</div>
	)
}

function ListItem({ leftProps, bodyProps, rightProps, onClick }) {
	return (
		<div className='ListItem' onClick={onClick}>
			{leftProps && <ListItemLeft {...leftProps} />}
			<ListItemBody {...bodyProps} />
			{rightProps && <ListItemRight {...rightProps} />}
		</div>
	)
}

export default ListItem
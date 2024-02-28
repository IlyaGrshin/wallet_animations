import Typography from '../Typography'
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
			<div className='label'>
				<Typography variantStyle='body' weight='regular'>
					{label}
				</Typography>
			</div>
			{caption && (
			<div className='caption'>
				<Typography variantStyle='subheadline2' weight='regular'>
					{caption}
				</Typography>
			</div>
			)}
		</div>
	)
}

function ListItemRight({ label, caption, type }) {
	// label = (type === TRANSACTION_STATUS.RECEIVED) ? `+${label}` : label

	return (
		<div className={`right`}>
			<div className='label'>
				<Typography variantStyle='body' weight='regular'>
					{label}
				</Typography>
			</div>
			{type && (
			<div className='caption'>
				<Typography variantStyle='subheadline2' weight='regular'>
					{caption}
				</Typography>
			</div>
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
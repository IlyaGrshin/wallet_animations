import Text from '../Text'
import './index.css'

const Cell = ({ as: Component = 'div', start, children, end, onClick, ...props }) => {
    return (
        <Component className='Cell' onClick={onClick} {...props}>
            {start && <div className='start'>{start}</div>}
            <div className='body'>{children}</div>
            {end && <div className='end'>{end}</div>}
        </Component>
    );
};


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

Cell.Text = ({ type, title, description, bold }) => {
	let name
	let weight = bold ? 'medium' : 'regular'

	switch (type) {
		case 'Regular':
			name = 'label'
			break
		case 'Accent':
			name  = 'label accent'
			break
		default:
			name = 'label'
			break
	}

	return (
		<>
			<Text 
				apple={{
					variant: 'body',
					weight: weight
				}}
				material={{
					variant: 'body1',
					weight: weight
				}}
				className={name} 
			>
  				{title}
			</Text>
			{description && (
				<Text 
					apple={{
						variant: 'subheadline2',
						weight: 'regular'
					}}
					material={{
						variant: 'subtitle2',
						weight: 'regular'
					}}
					className='caption' 
				>
					{description}
				</Text>
			)}
		</>
	)
}

Cell.End = ({ label, caption }) => {
	return (
		<>
			<Text 
				apple={{
					variant: 'body', 
					weight: 'regular'
				}}
				material={{
					variant: 'body1',
					weight: 'regular'
				}}
				className='label' 
			>
				{label}
			</Text>
			{caption && (
				<Text 
					apple={{
						variant: 'subheadline2',
						weight: 'regular'
					}}
					material={{
						variant: 'subtitle2',
						weight: 'regular'
					}}
					className='caption' 
				>
					{caption}
				</Text>
			)}
		</>
	)
}

export default Cell
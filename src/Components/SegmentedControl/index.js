import React, { useState } from "react";
import Text from '../Text'

import './index.css';

const SegmentedControl = ({ segments, onChange, defaultIndex = 0, colorScheme = 'light' }) => {
    const [activeIndex, setActiveIndex] = useState(defaultIndex);

    const handleSegmentClick = (index) => {
        setActiveIndex(index);
        if (onChange) onChange(index);
    };

    return (
        <div className='segmentedControl' data-color-scheme={colorScheme}>
        {segments.map((segment, index) => (
            <button
                key={index}
                className={`segment ${index === activeIndex ? 'active' : ''}`}
                onClick={() => handleSegmentClick(index)}
            >   
                <Text
                    apple={{
                        variant: 'footnote',
                        weight: 'semibold'
                    }}
                    material={{
                        variant: 'subtitle1',
                        weight: 'regular'
                    }}
                >
                    {segment}
                </Text>
            </button>
        ))}
        <div
            className='activeIndicator'
            style={{
                width: `calc(${100 / segments.length}% - 4px)`,
                left: `calc(${100 / segments.length * activeIndex}% + 2px)`,
            }}
        />
        </div>
    );
};

export default SegmentedControl;
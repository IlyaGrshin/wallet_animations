import React, { useRef, useEffect } from 'react';
import './index.css';

const Gallery = ({ children, onPageChange, onScrollProgress }) => {
  const containerRef = useRef(null);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollLeft = containerRef.current.scrollLeft;
      const pageWidth = containerRef.current.offsetWidth;
      const newPage = Math.round(scrollLeft / pageWidth);

      const progress = (scrollLeft % pageWidth) / pageWidth;

      if (onPageChange) {
        onPageChange(newPage);
      }
      if (onScrollProgress) {
        onScrollProgress(progress);
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="gallery-container" ref={containerRef}>
      {React.Children.map(children, (child) => (
        <div className="gallery-page">{child}</div>
      ))}
    </div>
  );
};

export default Gallery;

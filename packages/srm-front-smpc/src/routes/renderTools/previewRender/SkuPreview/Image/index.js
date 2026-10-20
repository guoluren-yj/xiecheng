import React from 'react';
import defaultImg from '../../images/sku_default.svg';

export default function Image(props) {
  const { style = {}, className = '', width, height, value, id = '', alt = '', title = '' } = props;
  style.width = width;
  style.height = height;
  return (
    <img
      src={value || defaultImg}
      id={id}
      style={style}
      alt={alt}
      title={title}
      className={`imagePath ${className}`}
    />
  );
}

import React, { useState, useEffect } from 'react';

export default function Image(props) {
  const {
    style = {},
    className = '',
    width,
    height,
    value,
    id = '',
    alt = '',
    title = '',
    ...OtherProps
  } = props;
  style.width = width;
  style.height = height;

  useEffect(() => {
    setSrc(value);
  }, [value]);

  const [src, setSrc] = useState(value);

  return (
    <img
      src={src}
      id={id}
      style={{ ...style, display: 'inline-block' }}
      alt={alt}
      title={title}
      className={`imagePath ${className}`}
      onError={() => setSrc('')}
      {...OtherProps}
    />
  );
}

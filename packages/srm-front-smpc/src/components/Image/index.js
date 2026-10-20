import React, { useState, useEffect } from 'react';
import { getEncodeFileUrl } from 'utils/utils';
import defaultImg from '@/assets/sku_default.svg';

export default function Image(props) {
  const {
    style = {},
    className = '',
    width = 64,
    height = 64,
    value,
    id = '',
    alt = '',
    title = '',
    ...OtherProps
  } = props;
  style.width = width;
  style.height = height;

  const [src, setSrc] = useState(value || defaultImg);
  const [errorNum, setErrorNum] = useState(1);

  useEffect(() => {
    setSrc(value || defaultImg);
  }, [value]);

  const onError = () => {
    // 商城内部上传的图片编码后是带@符号的
    const index = value.indexOf('@');
    // 外部图片不处理
    if (!value?.includes('isrm')) {
      setSrc(defaultImg);
      return;
    }
    if (index === -1 || errorNum > 1) {
      setSrc(defaultImg);
    } else if (errorNum === 1) {
      setSrc(getEncodeFileUrl(value));
    }
    setErrorNum((pre) => pre + 1);
  };

  return (
    <img
      src={src}
      id={id}
      style={{ ...style, display: 'inline-block' }}
      alt={alt}
      title={title}
      className={`imagePath ${className}`}
      onError={onError}
      {...OtherProps}
    />
  );
}

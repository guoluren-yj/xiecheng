import React, { useState, useEffect } from 'react';
import { compose } from 'lodash';
import { getEncodeFileUrl } from 'utils/utils';
import defaultImg from '@/assets/sku_default.svg';
import remote from 'hzero-front/lib/utils/remote';

import styles from './styles.less';

function Image(props) {
  const {
    style = {},
    className = '',
    width = 32,
    height = 32,
    value,
    id = '',
    alt = '',
    title = '',
    remote: remoteRender,
    ...OtherProps
  } = props;
  style.width = width;
  style.height = height;

  const [src, setSrc] = useState();
  const [errorNum, setErrorNum] = useState(1);

  useEffect(() => {
    if (!value || value === 'noImages') {
      setSrc(defaultImg);
      return;
    }
    setSrc(value);
  }, [value]);

  const onError = () => {
    // 第一次报错统一先编码
    if(errorNum === 1) {
      setSrc(getEncodeFileUrl(src));
    }
    setErrorNum(pre => {
      // 第二次报错， 设为默认图片
      if(pre + 1 === 2) {
        setSrc(defaultImg);
      }
      return pre + 1;
    });
  };

  const valueIsHtml =
    value && /<[a-z]+\d?(\s+[\w-]+=("[^"]*"|'[^']*'))*\s*\/?>|&#?\w+;/i.test(value);

  const handleClickImage = (e, value) => {
    if (remoteRender) {
      remoteRender.event.fireEvent('cuxClickImage', { e, value });
    }
  };

  return valueIsHtml ? (
    <div
      className={styles['img-html-wrapper']}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: value }}
      style={{ width, height, overflow: 'hidden' }}
    />
  ) : (
    <img
      src={src}
      id={id}
      style={{ ...style, display: 'inline-block', ...remoteRender.process('cuxImageStyle') }}
      alt={alt}
      title={title}
      className={`imagePath ${className}`}
      onError={onError}
      {...OtherProps}
      onClick={e => handleClickImage(e, src)}
    />
  );
}
export default compose(
  remote({
    code: 'SMODR_COMPONENT_IMAGE',
    name: 'remote',
  })
)(Image);

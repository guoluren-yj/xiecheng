import React, { useState, useEffect } from 'react';

import intl from 'utils/intl';
import { getEncodeFileUrl } from 'utils/utils';
import loadError from '@/assets/load_error.svg';

export default function Image({ className, src, width, height }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoadErr, setIsLoadError] = useState(false);
  const [errorNum, setErrorNum] = useState(1);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  const imgStyle = isLoadErr ? { width: 278, height: 170 } : { width, height };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img
        className={className}
        src={isLoadErr ? loadError : imgSrc}
        style={{ ...imgStyle, display: 'inline-block' }}
        alt=""
        onError={() => {
          // 商城内部上传的图片编码后是带@符号的
          const index = imgSrc.indexOf('@');
          // 外部图片不处理
          if (!imgSrc?.includes('isrm')) {
            setIsLoadError(true);
            return;
          }
          if (index === -1 || errorNum > 1) {
            setIsLoadError(true);
          } else if (errorNum === 1) {
            setImgSrc(getEncodeFileUrl(imgSrc));
          }
          setErrorNum((pre) => pre + 1);
        }}
      />
      <span hidden={!isLoadErr} style={{ marginTop: 14 }}>
        {intl.get('smpc.product.view.message.loadErrImage').d('未加载出图片')}
      </span>
    </div>
  );
}

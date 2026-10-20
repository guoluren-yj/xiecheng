import React from 'react';
import intl from 'utils/intl';

import noFilesSvg from '@/assets/no_files.svg';

export default props => {
  const { text, imgSrc } = props;

  return (
    <div
      style={{
        height: 'calc(100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src={imgSrc || noFilesSvg} />
      <span style={{ marginTop: 10 }}>
        {text || intl.get('ssta.common.view.message.noAttachments').d('暂无附件')}
      </span>
    </div>
  );
};

import React from 'react';

import formatterCollections from 'utils/intl/formatterCollections';

import styles from './index.less';

function NotFound({ img, title, subTitle, extra }) {
  return (
    <div className={styles['not-found']}>
      <div className={styles['not-found-content']}>
        <div className={styles['not-found-pic']}>{img}</div>
        {title ? <div className={styles['not-found-title']}>{title}</div> : null}
        {subTitle ? <div className={styles['not-found-subTitle']}>{subTitle}</div> : null}
        {extra ? <div className={styles['not-found-footer']}>{extra}</div> : null}
      </div>
    </div>
  );
}

NotFound.displayName = 'NotFound';

export default formatterCollections({
  code: ['hwfp.common'],
})(NotFound);

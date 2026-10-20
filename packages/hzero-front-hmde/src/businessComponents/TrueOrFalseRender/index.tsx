import React from 'react';
import intl from 'srm-front-boot/lib/utils/intl';

import styles from './index.less';

interface IIndex {
  trueOrFalse: boolean;
  trueText?: string;
  falseText?: string;
}
export default function Index({
  trueOrFalse = false,
  trueText = intl.get('hzero.common.model.status.enable').d('启用'),
  falseText = intl.get('hzero.common.model.status.enable').d('启用'),
}: IIndex) {
  if (trueOrFalse) {
    return <div className={styles['enable-content']}>{trueText}</div>;
  } else {
    return <div className={styles['disable-content']}>{falseText}</div>;
  }
}

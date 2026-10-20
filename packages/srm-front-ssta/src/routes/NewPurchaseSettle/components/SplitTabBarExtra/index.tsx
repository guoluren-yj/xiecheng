import React from 'react';
import intl from 'utils/intl';
import styles from './index.less';

const SplitTabBarExtra = () => {

  return (
    <div className={styles['split-tab-bar-extra-wrapper']}>
      <div className={styles['split-tab-bar-extra-title']}>
        {intl.get('ssta.common.view.title.settleNum').d('结算单编号')}
      </div>
      <div className={styles['split-tab-bar-extra-desc']}>
        {intl.get('ssta.common.view.title.clickToSwitchSettlDoc').d('点击可切换结算单')}
      </div>
    </div>
  );
};

export default SplitTabBarExtra;
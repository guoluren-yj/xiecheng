import React from 'react';
import intl from 'utils/intl';
import { ReactComponent as NoSuggestSupplier } from '@/assets/no-suggest-supplier.svg';
import styles from './index.less';

const NochildComp = () => {
  return (
    <div className={styles['no-supplier']}>
      <span className={styles['link-color']}>
        <NoSuggestSupplier />
      </span>
      <span className={styles['no-supplier-title']}>
        {intl.get(`ssrc.inquiryHall.view.message.tab.noSupplierChecked`).d('无选用供应商')}
      </span>
    </div>
  );
};

export default NochildComp;

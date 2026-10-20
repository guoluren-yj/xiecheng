/*
 * @Descripttion: 供应商回复--采购联系人
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-28 11:28:03
 * @LastEditors: yiping.liu
 */
import React from 'react';
import { Icon } from 'choerodon-ui';

import styles from './index.less';

const PurchaseConcat = (props) => {
  const { list } = props;

  return (
    <React.Fragment>
      {list.map((item) => (
        <div key={item.rfMemberId} className={styles['purchase-content']}>
          <div className={styles['purchase-line']}>
            <div className={styles['purchase-block']}>
              <span className={styles['purchase-icon']}>
                <Icon type="person" />
              </span>
              <span className={styles['purchase-word']}>{item.contactName}</span>
            </div>
            <div className={styles['purchase-block']}>
              <span className={styles['purchase-icon']}>
                <Icon type="phone" />
              </span>
              <span className={styles['purchase-word']}>
                {item.internationalTelCode} | {item.contactPhone}
              </span>
            </div>
            <div className={styles['purchase-block']}>
              <span className={styles['purchase-icon']}>
                <Icon type="all_read" />
              </span>
              <span className={styles['purchase-word']}>{item.contactMail}</span>
            </div>
          </div>
        </div>
      ))}
    </React.Fragment>
  );
};

export default PurchaseConcat;

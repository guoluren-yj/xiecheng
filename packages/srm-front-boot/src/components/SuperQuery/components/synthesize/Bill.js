import React, { Fragment, useContext } from 'react';
import intl from 'utils/intl';
import CommonTable from '../CardTable';
import { Store } from '../../stores';

import styles from './index.less';

const Bill = (props) => {
  const { handleQueryPanel } = props;
  const { userRequest, billSortDs } = useContext(Store);
  const { billTotal } = userRequest;
  const totalCount = billTotal >= 10000 ? '10000+' : billTotal;

  return (
    <Fragment>
      <div className={styles['data-record']}>
        <div className={styles['data-record-field']}>
          <span className={styles['data-record-text']}>
            {intl.get('srm.common.view.common.queryInformation').d('为您查询到共')}
          </span>
          <span className={styles['data-record-number']}>{totalCount}</span>
          <span className={styles['data-record-text']}>
            {intl.get('srm.common.view.common.relatedBill').d('张相关单据')}
          </span>
          {billTotal > 3 && (
            <a className={styles['data-record-see']} onClick={() => handleQueryPanel('bill')}>
              {intl.get('srm.common.view.common.seeMore').d('查看更多')}
            </a>
          )}
        </div>
        <div className={styles['data-record-border']}>
          <CommonTable dataSet={billSortDs} synthesize />
        </div>
      </div>
    </Fragment>
  );
};
export default Bill;

import React, { Fragment, useContext } from 'react';
import intl from 'utils/intl';
import CommonTable from '../CardTable';
import { Store } from '../../stores';
import styles from './index.less';

const Supplier = (props) => {
  const { handleQueryPanel } = props;
  const { userRequest, supplierSortDs } = useContext(Store);
  const { supplierTotal } = userRequest;
  const totalCount = supplierTotal >= 10000 ? '10000+' : supplierTotal;
  return (
    <Fragment>
      <div className={styles['data-record']}>
        <div className={styles['data-record-field']}>
          <span className={styles['data-record-text']}>
            {intl.get('srm.common.view.common.queryInformation').d('为您查询到共')}
          </span>
          <span className={styles['data-record-number']}>{totalCount}</span>
          <span className={styles['data-record-text']}>
            {intl.get('srm.common.view.common.relatedSupplierBill').d('个供应商及相关单据')}
          </span>
          {supplierTotal > 3 && (
            <a className={styles['data-record-see']} onClick={() => handleQueryPanel('supplier')}>
              {intl.get('srm.common.view.common.seeMore').d('查看更多')}
            </a>
          )}
        </div>
        <div className={styles['data-record-border']}>
          <CommonTable dataSet={supplierSortDs} synthesize />
        </div>
      </div>
    </Fragment>
  );
};
export default Supplier;

import React, { Fragment, useContext } from 'react';
import intl from 'utils/intl';
import CommonTable from '../CardTable';
import { Store } from '../../stores';

import styles from './index.less';

const Matter = (props) => {
  const { handleQueryPanel } = props;

  const { userRequest, matterSortDs } = useContext(Store);
  const { itemTotal } = userRequest;
  const totalCount = itemTotal >= 10000 ? '10000+' : itemTotal;
  return (
    <Fragment>
      <div className={styles['data-record']}>
        <div className={styles['data-record-field']}>
          <span className={styles['data-record-text']}>
            {intl.get('srm.common.view.common.queryInformation').d('为您查询到共')}
          </span>
          <span className={styles['data-record-number']}>{totalCount}</span>
          <span className={styles['data-record-text']}>
            {intl.get('srm.common.view.common.relatedMatter').d('个相关物料')}
          </span>
          {itemTotal > 3 && (
            <a className={styles['data-record-see']} onClick={() => handleQueryPanel('matter')}>
              {intl.get('srm.common.view.common.seeMore').d('查看更多')}
            </a>
          )}
        </div>
        <div className={styles['data-record-border']}>
          <CommonTable dataSet={matterSortDs} synthesize />
        </div>
      </div>
    </Fragment>
  );
};
export default Matter;

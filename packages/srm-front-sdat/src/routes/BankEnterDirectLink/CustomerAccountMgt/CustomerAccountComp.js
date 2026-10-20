import React, { useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import StaticSearchBar from '@/components/StaticSearchBar';

import { DetailDS } from './store/customerDS';
import CustomizedTable from './CustomizedTable';
import { getQueryConfig } from './queryConfig';

import styles from './index.less';

function CustomerAccountComp(props) {
  const { listDS, customizeTable } = props;

  const detailDS = useMemo(() => new DataSet(DetailDS()), []);

  const handleFilterQueryAll = ({ params }) => {
    listDS.queryParameter = { ...params };
    listDS.query();
  };

  return (
    <>
      <div style={{ margin: '8px' }} className={styles['customer-account-config-basic']}>
        <StaticSearchBar
          key="monitor-org-bar"
          cacheState
          clearButton
          searchCode="SDAT.CUSTOMER_ACCOUNT_MGT.QUERY_BAR"
          filters={getQueryConfig()}
          dataSet={[listDS]}
          onQuery={handleFilterQueryAll}
          showLoading={false}
          // expandable={false}
          // defaultExpand={false}
        />
        <div className={styles['table-box']}>
          <CustomizedTable listDS={listDS} customizeTable={customizeTable} detailDS={detailDS} />
        </div>
      </div>
    </>
  );
}

export default CustomerAccountComp;

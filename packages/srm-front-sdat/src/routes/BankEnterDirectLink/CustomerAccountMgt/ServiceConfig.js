import React, { useMemo, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import StaticSearchBar from '@/components/StaticSearchBar';

import { ServiceDetailDS } from './store/customerDS';
import ServiceCustomizedTable from './ServiceCustomizedTable';
import { getQueryConfig } from './queryConfig';

import styles from './index.less';

function ServiceConfig(props) {
  const { listDS, customizeTable } = props;

  const detailDS = useMemo(() => new DataSet(ServiceDetailDS()), []);

  useEffect(() => {
    // listDS.query();
  }, []);

  const handleFilterQueryAll = ({ params }) => {
    listDS.queryParameter = { ...params };
    listDS.query();
  };

  return (
    <>
      <div style={{ margin: '8px' }} className={styles['customer-service-config-basic']}>
        <StaticSearchBar
          key="monitor-org-bar"
          cacheState
          clearButton
          searchCode="SDAT.SERVICE_CONFIG.QUERY_BAR"
          filters={getQueryConfig()}
          dataSet={[listDS]}
          onQuery={handleFilterQueryAll}
          showLoading={false}
          // defaultExpand={false}
        />
        <div className={styles['table-box']}>
          <ServiceCustomizedTable
            listDS={listDS}
            customizeTable={customizeTable}
            detailDS={detailDS}
          />
        </div>
      </div>
    </>
  );
}

export default ServiceConfig;

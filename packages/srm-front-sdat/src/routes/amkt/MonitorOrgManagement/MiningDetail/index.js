/**
 * 挖掘详情
 */
import React, { useMemo } from 'react';
import intl from 'utils/intl';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';

import { MiningDetailDS } from '../store/monitorOrgManagementDs';

export default function MiningDetail() {
  const miningDetailDS = useMemo(() => new DataSet({ ...MiningDetailDS() }), []);

  const columns = () => {
    return [
      { name: 'eventNumber' },
      { name: 'supplier' },
      { name: 'associationType' },
      { name: 'eventName' },
      { name: 'subAccountName' },
      { name: 'callTime' },
    ];
  };

  return (
    <>
      <Header
        title={intl.get('sdat.monitorOrgManagement.view.button.miningDetail').d('挖掘详情')}
        backPath="/sdat/monitor-org-management/list"
      />
      <Content>
        <FilterBar
          dataSet={[miningDetailDS]}
          cacheState
          cacheKey="SDAT.CACHE_MONITOR_MANAGE_MINING_DETAILS"
          // onQuery={handleFilterQueryAll}
          fields={[
            {
              name: 'supplier',
              type: 'string',
              label: intl.get('sdat.monitorOrgManagement.model.supplier').d('供应商'),
              display: true,
              lock: true,
            },
            {
              label: intl.get('sdat.monitorOrgManagement.model.subAccount').d('子账户'),
              name: 'subAccount',
              type: 'string',
              // display: true,
              lock: true,
            },
          ]}
        />
        <div style={{ height: 'calc(100vh - 226px)' }}>
          <Table
            dataSet={miningDetailDS}
            columns={columns()}
            queryBar="none"
            autoHeight={{ type: 'maxHeight', diff: 40 }}
          />
        </div>
      </Content>
    </>
  );
}

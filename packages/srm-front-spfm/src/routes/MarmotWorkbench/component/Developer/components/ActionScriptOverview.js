import React from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { Content, Header } from 'components/Page';
import MarmotScriptButton from '@/components/MarmotScript/MarmotScriptButton';
import { getActionScriptOverviewTableDs } from '../store/ActionScriptOverviewDs';

function ActionScriptOverview(props = {}) {
  const {
    valueDs: { actionScriptOverviewTableDs },
  } = props;

  const tableColumns = [
    {
      name: 'tenantName',
      width: 200,
    },
    {
      name: 'tableCode',
      width: 300,
    },
    {
      name: 'type',
      width: 100,
    },
    {
      name: 'position',
      width: 100,
    },
    {
      name: 'creatorName',
      width: 100,
    },
    {
      name: 'description',
      minWidth: 300,
    },
    {
      name: 'script',
      lock: 'right',
      width: 100,
      renderer: ({ record }) => {
        const { tenantNum = 'SRM', type = '' } = record.get(['tenantNum', 'type']);
        return (
          <>
            <MarmotScriptButton
              titleKeyCode={type}
              name="script"
              scriptCacheKey="relTableDefinitionAction|MarmotScript"
              record={record}
              testParam={{
                debugTenantNum: tenantNum,
              }}
              disabled
            />
          </>
        );
      },
    },
  ];

  return (
    <>
      <Header
        title={intl.get('spfm.adaptorMonitor.view.title.actionScriptOverview').d('动作脚本全览')}
      />
      <Content>
        <Table
          dataSet={actionScriptOverviewTableDs}
          columns={tableColumns}
          queryBarProps={{ defaultShowMore: true }}
        />
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['spfm.actionScriptOverview', 'spfm.adaptorMonitor', 'hzero.common'],
})(
  withProps(
    () => {
      const actionScriptOverviewTableDs = new DataSet(getActionScriptOverviewTableDs());
      const valueDs = {
        actionScriptOverviewTableDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(ActionScriptOverview)
);

import React, { memo, useMemo } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import StatusTag from '../../../Components/StatusTag';
import { ExcuteStageDS } from '../stores/indexDS';

interface ExcuteStageModalType
{
  executeRecordId: string,
}


export default memo((props: ExcuteStageModalType) =>
{
  const { executeRecordId } = props;
  const ExcuteStageDs = useDataSet(() => ExcuteStageDS(executeRecordId), [executeRecordId]);

  const columns: ColumnProps[] = useMemo(() =>
  {
    return [
      {
        name: 'completeFlag',
        width: 120,
        renderer: ({ value }) => (
          <StatusTag
            value={value}
            text={value === 1
              ? intl.get(`spfp.common.status.completed`).d('已完成')
              : intl.get('spfp.common.status.unCompleted').d('未完成')}
            color={value === 1 ? 'success' : 'error'}
          />
        ),
      },
      {
        name: 'successFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'beginDate',
        width: 160,
      },
      {
        name: 'endDate',
        width: 160,
      },
      {
        name: 'stageTypeMeaning',
        width: 180,
      },
      {
        name: 'errorMessage',
      },
    ];
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 300px)' }}>
      <Table dataSet={ExcuteStageDs} columns={columns} style={{ maxHeight: 'calc(100% - 35px)' }} />
    </div>
  );
});
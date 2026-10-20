import React, { useMemo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Table, DataSet } from 'choerodon-ui/pro';
import type { Record as C7nRecord } from 'choerodon-ui/dataset';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/interface';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { ExcuteFailDS } from '../stores/indexDS';
import { reExecuteApi } from '../../utils/api';

interface FailInfoProps
{
  record: C7nRecord;
  modal?: any;
}

export default observer((props: FailInfoProps) =>
{
  const { record, modal } = props;

  const { rebatesExecuteStageList = [], reExecuteFlag } = record.get(['rebatesExecuteStageList', 'reExecuteFlag']);

  const tableDs = useMemo(() => new DataSet(ExcuteFailDS()), []);

  useEffect(() =>
  {
    tableDs.loadData(rebatesExecuteStageList.filter(item => item.errorFlag === 1));

  }, [tableDs, rebatesExecuteStageList]);

  const handleReExecute = useCallback(async (lineRecord) =>
  {
    const executeRecordId = lineRecord.get('executeRecordId');
    const res = await reExecuteApi({ executeRecordId });
    if (getResponse(res))
    {
      // 重新查询行数据数据
      record.dataSet.query(record.dataSet.currentPage);
      if (modal) modal.close();
    }

  }, [record, modal]);

  const columns: ColumnProps[] = useMemo(() =>
  {
    return [
      { name: 'stageTypeMeaning' },
      { name: 'beginDate' },
      { name: 'endDate' },
      { name: 'errorMessage' },
      {
        name: 'reExecute', renderer: ({ record }) => reExecuteFlag === 0
          ? <a onClick={() => handleReExecute(record)}>{intl.get(`spfp.rebateOrderCaculate.model.ruleMaintenance.reExecute`).d('重新执行')}</a>
          : intl.get(`spfp.rebateOrderCaculate.model.ruleMaintenance.reExecute`).d('重新执行'),
      },
      { name: 'reExecuteMark', renderer: () => reExecuteFlag ? intl.get(`spfp.rebateOrderCaculate.model.ruleMaintenance.reExecuteMarkContent`).d('是，等待闲时执行中') : null },
      { name: 'executionInstruction', renderer: () => intl.get(`spfp.rebateOrderCaculate.model.ruleMaintenance.executionInstructionContent`).d('由于返利执行涉及大数据运算，为了不影响您正常使用系统其他功能，程序将在系统闲时自动执行，您可在次日检查重新执行结果') },
    ];
  }, [reExecuteFlag, handleReExecute]);
  return (
    <div style={{ height: 'calc(100vh - 300px)' }}>
      <Table
        dataSet={tableDs}
        columns={columns}
        selectionMode={SelectionMode.none}
        style={{ maxHeight: 'calc(100% - 35px)' }} />
    </div>
  );
});
import React, { memo, useMemo } from 'react';
import { isNil } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import type { FieldProps } from 'choerodon-ui/dataset/data-set/Field';


import FilterBarTable from '_components/FilterBarTable';

import { progressDetailDS } from './storeDS';

interface CalcDetailProps {
  mode: 'tree' | 'list',
  ruleId: any,
  executeRecordId: any,
  fields: FieldProps[],
  columns: ColumnProps[],
  queryFields: any[],
}

const nodeCover = ({ record }) => {
  // 通过 parentExecuteDataId来判断是否为叶节点
  return { isLeaf: !isNil(record.get('parentExecuteDataId')) };
};

const ProgressDetail = memo((props: CalcDetailProps) => {

  const { mode, ruleId, executeRecordId, fields, columns, queryFields } = props;

  const progressDetailDs = useMemo(() => new DataSet(progressDetailDS({ ruleId, fields, queryFields, executeRecordId })), [ruleId, fields, queryFields, executeRecordId]);

  return (
    <div style={{ maxHeight: 'calc(100vh - 190px)' }}>
      <FilterBarTable
        treeAsync
        mode={mode}
        columns={columns}
        onRow={nodeCover}
        dataSet={progressDetailDs}
        style={{ maxHeight: 'calc(100% - 35px)' }}
        customizedCode="SPFP.REBATE_ORDER_CALCULATE_LIST.CALC_PROCESS_DETAIL"
      />
    </div>
  );
});

export default ProgressDetail;
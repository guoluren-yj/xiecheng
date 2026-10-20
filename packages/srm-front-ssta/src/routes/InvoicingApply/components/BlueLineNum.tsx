import React, { useMemo, useEffect, useCallback } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';

import { blueLineNumDS } from '../storeDS';


const RelationDiscounted = (props) => {
  const { applyHeaderId, modal, record } = props;
  const originalApplyLineId = record?.get('originalApplyLineId');
  const blueLineNumDs = useMemo<DataSet>(() => new DataSet(blueLineNumDS(applyHeaderId, originalApplyLineId)), [applyHeaderId, originalApplyLineId]);
  const { selected } = blueLineNumDs;

  const handleOk = useCallback(async () => {
    console.log(selected)
  }, [selected, modal]);

  useEffect(() => {
    modal.handleOk(handleOk);
  }, [handleOk, modal]);



  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'lineNum',
      },
      {
        name: 'sourceDocSettleNum',
      },
      {
        name: 'commodityCode',
      },
      {
        name: 'projectName',
      },
    ];
  }, []);


  return (
    <div>
      <Table
        dataSet={blueLineNumDs}
        columns={columns}
      />
    </div>

  );
};

export default observer(RelationDiscounted);

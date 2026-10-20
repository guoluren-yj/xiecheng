import React, { useContext, useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import type { StoreValueType } from './stores';
import { Store } from './stores';
import { statusTagRender } from '../../Components/StatusTag';
import { DepositDetailGridUnitCode } from '../utils/type';

const TransferOutRecord = () => {

  const { transferOutDs, customizeTable } = useContext<StoreValueType>(Store);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'depositNum',
        width: 180,
      },
      {
        name: 'transferTypeMeaning',
        width: 130,
      },
      {
        name: 'type',
        width: 120,
        renderer: statusTagRender,
      },
      {
        name: 'depositTransferRecordStatusMeaning',
        width: 130,
      },
      {
        name: 'transferAmount',
        width: 120,
      },
      {
        name: 'transferDate',
        width: 180,
      },
      {
        name: 'associateNumAndLineNum',
        width: 200,
      },
    ];
  }, []);

  return customizeTable(
      { code: DepositDetailGridUnitCode.TRANS_OUT },
        <Table
          columns={columns}
          dataSet={transferOutDs}
          style={{ maxHeight: 430 }}
        />
    )
  
};

export default TransferOutRecord;
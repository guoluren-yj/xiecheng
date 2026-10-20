import React, { useContext, useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import { Store } from './stores';
import type { StoreValueType } from './stores';
import { statusTagRender } from '../../Components/StatusTag';
import { ServiceDetailGridUnitCode } from '../utils/type';
import { purchaserConfirmByNameRender } from '../utils/render';

const PayRecord = () => {

  const { payRecordDs, customizeTable } = useContext<StoreValueType>(Store);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'serverFeesNum',
        width: 180,
      },
      {
        name: 'paymentCategory',
        width: 120,
        renderer: statusTagRender,
      },
      {
        name: 'serverPayRecordStatus',
        width: 150,
        renderer: statusTagRender,
      },
      {
        name: 'paymentModeMeaning',
        width: 180,
      },
      {
        name: 'paymentAmount',
        width: 130,
      },
      {
        name: 'paymentDate',
        width: 180,
      },
      {
        name: 'purchaserConfirmByName',
        width: 160,
        renderer: purchaserConfirmByNameRender,
      },
      {
        name: 'transferDepositNumAndLineNum',
        width: 200,
      },
      {
        name: 'remark',
        width: 200,
      },
      {
        name: 'approveModeMeaning',
        width: 120,
      },
      {
        name: 'syncModeMeaning',
        width: 190,
      },
      {
        name: 'processInstanceId',
        width: 150,
      },
    ];
  }, []);

  return customizeTable(
    { code: ServiceDetailGridUnitCode.PAY },
    <Table
      columns={columns}
      dataSet={payRecordDs}
      style={{ maxHeight: 430 }}
    />
  );
};

export default PayRecord;
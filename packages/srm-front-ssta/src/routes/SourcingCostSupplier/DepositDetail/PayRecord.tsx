import React, { useContext, useMemo } from 'react';
import { Table, Tooltip } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import { Store } from './stores';
import type { StoreValueType } from './stores';
import { DepositDetailGridUnitCode } from '../utils/type';
import { purchaserConfirmByNameRender } from '../utils/render';
import StatusTag, { getTagColor, statusTagRender } from '../../Components/StatusTag';

const PayRecord = () => {

  const { payRecordDs, customizeTable, remote, } = useContext<StoreValueType>(Store);

  const columns = useMemo<ColumnProps[]>(() => {
    const preColumns = [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'depositNum',
        width: 180,
      },
      {
        name: 'paymentCategory',
        width: 120,
        renderer: statusTagRender,
      },
      {
        name: 'depositPayRecordStatus',
        width: 150,
        renderer: ({ text, dataSet, record, name }) => {
          const approvedRemark = record?.get('approvedRemark');
          const remarkIcon = approvedRemark && 'alt_route-o';
          return (
            <Tooltip title={approvedRemark}>
              <StatusTag icon={remarkIcon} text={text} color={getTagColor(dataSet, record, name)} />
            </Tooltip>
          );
        },
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
        name: 'initiateCampMeaning',
        width: 150,
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

    const newColumns = remote ? remote.process('SSTA.DEPOSIT_DETAIL_SUP_CUX.PAY_RECORD_TABLE_COLUMNS', preColumns, { payRecordDs, }) : preColumns;

    return newColumns;
  }, []);

  return customizeTable(
    { code: DepositDetailGridUnitCode.PAY },
    <Table
      columns={columns}
      dataSet={payRecordDs}
      style={{ maxHeight: 430 }}
    />
  );
};

export default PayRecord;
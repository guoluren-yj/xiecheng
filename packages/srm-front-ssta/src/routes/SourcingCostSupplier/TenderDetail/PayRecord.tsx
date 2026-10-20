import React, { useContext, useMemo } from 'react';
import { Table, Tooltip } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import type { StoreValueType } from './stores';
import { Store } from './stores';
import { TenderDetailGridUnitCode } from '../utils/type';
import { purchaserConfirmByNameRender } from '../utils/render';
import StatusTag, { getTagColor, statusTagRender } from '../../Components/StatusTag';

const PayRecord = () => {

  const { payRecordDs, customizeTable } = useContext<StoreValueType>(Store);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'tenderFeesNum',
        width: 200,
      },
      {
        name: 'paymentCategory',
        width: 120,
        renderer: statusTagRender,
      },
      {
        name: 'tenderPayRecordStatus',
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
        width: 120,
      },
      {
        name: 'paymentAmount',
        width: 150,
      },
      {
        name: 'paymentDate',
        width: 180,
      },
      {
        name: 'paymentOrderNum',
        width: 200,
      },
      {
        name: 'purchaserConfirmByName',
        width: 150,
        renderer: purchaserConfirmByNameRender,
      },
      {
        name: 'approveModeMeaning',
        width: 120,
      },
      {
        name: 'initiateCampMeaning',
        width: 120,
      },
      {
        name: 'processInstanceId',
        width: 150,
      },
    ];
  }, []);

  return customizeTable(
    { code: TenderDetailGridUnitCode.PAY },
    <Table
      columns={columns}
      dataSet={payRecordDs}
      style={{ maxHeight: 430 }}
    />
  );
};

export default PayRecord;
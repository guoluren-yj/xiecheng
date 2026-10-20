import React, { useMemo, useCallback } from 'react';
import { flow } from 'lodash';
import { DataSet, Table, useModal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { isFunction } from 'lodash';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import Execution from './Execution';
import { payPoolDS } from './storeDS';
import { useModalOpen } from '../../hooks';
import { statusTagRender } from '../../../Components/StatusTag';

interface RelatedPayPoolProps {
  settleNum: string;
}

const RelatedPayPool = flow(
  formatterCollections({ code: ['ssta.payPool'] }),
)((props) => {

  const { settleNum, remoteProps } = props;
  const modalOpen = useModalOpen(useModal());
  const tableDs = useMemo(() => new DataSet(payPoolDS(settleNum)), [settleNum]);

  const handleViewExecution = useCallback((record) => {
    const payId = record.get('payId');
    modalOpen({
      size: 'large',
      editFlag: false,
      title: intl.get(`ssta.payPool.view.title.payTransactionExecutionInfo`).d('支付事务执行信息'),
      children: <Execution payId={payId} />,
    });
  }, [modalOpen]);

  const columns = useMemo<ColumnProps[]>(() => {
    let columns: ColumnProps[] = [
      { name: 'contractNumAndLineNum', width: 180 },
      { name: 'documentAndLineNum', width: 180 },
      {
        name: 'payNum',
        width: 150,
        renderer: ({ value, record }) => {
          return <a onClick={() => handleViewExecution(record)}>{value}</a>;
        },
      },
      { name: 'documentTypeMeaning', width: 150 },
      { name: 'payStatus', width: 120, renderer: statusTagRender },
      { name: 'payAmount', width: 120 },
      { name: 'payCompleteAmount', width: 150 },
    ]
    const { handleColumns = undefined } = remoteProps?.props?.process || {};
    if (isFunction(handleColumns)) {
      columns = handleColumns(columns, tableDs, { ...props });
    }
    return columns;
  }, [handleViewExecution, remoteProps]);

  return (
    <Table
      dataSet={tableDs}
      columns={columns}
      style={{ maxHeight: 'calc(100vh - 220px)' }}
    />
  );
}) as React.FC<RelatedPayPoolProps>;

export default RelatedPayPool;
// 红色确认表

import type { ReactElement } from 'react';
import React, { useMemo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { flow, isFunction } from 'lodash';

// import intl from 'utils/intl';
// import { getResponse } from 'utils/utils';

import { redListDS } from './indexDS';
// import DynamicAlert from '../../../Components/DynamicAlert';


interface BatchSettleListProps {
  modal?: any,
  okCallback: () => void,
  invoiceHeaderList: any,
  type: string,
}

const BatchSettleList = flow(
  observer,
)((props: BatchSettleListProps) => {

  const {
    modal,
    okCallback,
    invoiceHeaderList,
  } = props;
  const redListDs = useMemo(() => new DataSet(redListDS(invoiceHeaderList)), [invoiceHeaderList]);

  const handleSubmit = useCallback(async () => {
    const valiateRes = await redListDs.validate();
    if (!valiateRes) return false;
    const res = await redListDs.submit();
    if (!res) return false;
    if (isFunction(okCallback)) okCallback();
  }, [redListDs, okCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSubmit);
  }, [modal, handleSubmit]);


  const columns: any = useMemo(() => {
    return [
      {
        name: 'invoiceNum',
      },
      {
        name: 'invoiceCode',
      },
      {
        name: 'invoiceRefundedReason',
        editor: true,
      },
    ];
  }, []);


  return (
    <div>
      <Table
        dataSet={redListDs}
        columns={columns}
      />
    </div>
  );
}) as (props: BatchSettleListProps) => ReactElement;

export default BatchSettleList;

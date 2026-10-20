// 红色确认表

import type { ReactElement } from 'react';
import React, { useMemo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { flow, isFunction } from 'lodash';

import intl from 'utils/intl';
// import { getResponse } from 'utils/utils';

import { redListDS } from './indexDS';
// import DynamicAlert from '../../../Components/DynamicAlert';


interface BatchSettleListProps {
  modal?: any,
  okCallback: () => void,
  record: any,
  type: string,
}

const BatchSettleList = flow(
  observer,
)((props: BatchSettleListProps) => {

  const {
    modal,
    okCallback,
    record,
    type,
  } = props;
  const { settleHeaderId, invoiceCode, invoiceNum } = record?.get(['settleHeaderId', 'invoiceCode', 'invoiceNum']) || {};
  const queryParams = useMemo(() => {
    if (type === 'settle') return { sourceDocId: settleHeaderId, blueDataSource: 'SRM_SETTLE_HEADER' };
    else return { invoiceCode, invoiceNum };
  }, [settleHeaderId, invoiceCode, invoiceNum, type]);
  const redListDs = useMemo(() => new DataSet(redListDS(queryParams)), [queryParams]);

  const handleSubmit = useCallback(async () => {
    const validateRes = await redListDs.validate();
    if (!validateRes) return false;
    const res = await redListDs.forceSubmit();
    if (!res) return false;
    if (isFunction(okCallback)) okCallback();
  }, [redListDs, okCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSubmit);
  }, [modal, handleSubmit]);


  const columns: any = useMemo(() => {
    return [
      {
        name: 'blueInvoiceCode',
      },
      {
        name: 'blueInvoiceNum',
      },
      {
        name: 'redConfirmType',
        editor: true,
      },
      {
        name: 'redConfirmReason',
        editor: true,
      },
    ];
  }, []);


  return (
    <div>
      <div style={{marginBottom: '10px'}}>{intl.get('ssta.common.view.button.operateRedConfirmTips').d('当前正在红冲税票，由于相关税票已发生用途确认，需要您操作确认红字确认单')}</div>
      <div>
        <Table
          dataSet={redListDs}
          columns={columns}
        />
      </div>
    </div>
  );
}) as (props: BatchSettleListProps) => ReactElement;

export default BatchSettleList;

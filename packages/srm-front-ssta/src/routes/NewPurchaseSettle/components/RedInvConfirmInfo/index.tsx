import React, { useMemo, useEffect, useCallback } from 'react';
import { isNil, isFunction } from 'lodash';
import { DataSet, Table } from 'choerodon-ui/pro';
import { tableDS } from './storeDS';

interface RedInvConfirmInfoProps {
  modal?: any;
  settleHeaderId?: string;
  settleHeaderIdList?: string[];
  okCallback: () => void;
}

const RedInvConfirmInfo = (props: RedInvConfirmInfoProps) => {

  const {
    modal,
    okCallback,
    settleHeaderId,
    settleHeaderIdList,
  } = props;

  const tableDs = useMemo(() => new DataSet(tableDS(settleHeaderIdList || [settleHeaderId])), [settleHeaderId, settleHeaderIdList]);

  const columns = useMemo(() => [
    (!isNil(settleHeaderIdList) && { name: 'settleNum', wdith: 150 }) as any,
    { name: 'invoiceCode', wdith: 120 },
    { name: 'invoiceNumber', wdith: 200 },
    { name: 'redInfoNumber', width: 250, editor: true },
  ], [settleHeaderIdList]);

  const handleOk = useCallback(async () => {
    if (tableDs.totalCount !== 0) {
      const res = await tableDs.submit();
      if (!res) return false;
    }
    if (isFunction(okCallback)) return okCallback();
  }, [tableDs, okCallback]);

  useEffect(() => {
    if (modal) {
      modal.handleOk(handleOk);
    }
  }, [modal, handleOk]);

  return (
    <Table
      dataSet={tableDs}
      columns={columns}
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    />
  );
};

export default RedInvConfirmInfo;
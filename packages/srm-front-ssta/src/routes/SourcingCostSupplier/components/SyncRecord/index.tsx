import React, { useMemo, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import type { DocType } from './storeDS';
import { syncRecordDS } from './storeDS';
import { statusTagRender } from '../../../Components/StatusTag';
import { DepositDetailGridUnitCode, ServiceDetailGridUnitCode, TenderDetailGridUnitCode } from '../../utils/type';


interface SyncRecordBaseProps {
  modal?: any,
  docType: DocType,
}

interface SyncRecordListProps extends SyncRecordBaseProps {
  feeRecord: DSRecord | null | undefined,
}

interface SyncRecordHeadProps extends SyncRecordBaseProps {
  feeDs: DataSet,
}

const girdCodeMap: Record<DocType, string> = {
  'tender': TenderDetailGridUnitCode.SYNC,
  'deposit': DepositDetailGridUnitCode.SYNC,
  'service': ServiceDetailGridUnitCode.SYNC,
};

const SyncRecord = (props: SyncRecordListProps | SyncRecordHeadProps) => {
  const { modal, docType } = props;
  const { feeRecord } = props as SyncRecordListProps;
  const { feeDs } = props as SyncRecordHeadProps;

  const modalFlag = Boolean(modal);

  const syncRecordDs = useMemo<DataSet>(() => new DataSet(syncRecordDS(feeRecord, docType)), [feeRecord, docType]);

  useEffect(() => {
    if (modalFlag) syncRecordDs.pageSize = 20;
  }, [modalFlag, syncRecordDs]);

  useEffect(() => {
    // 其他类型的childName不一定叫 depositSyncRecordList，但是没有，暂时占坑
    if (feeDs) syncRecordDs.bind(feeDs, 'depositSyncRecordList');
    else syncRecordDs.query();
  }, [feeDs, syncRecordDs]);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'syncStatus',
        width: 150,
        renderer: statusTagRender,
      },
      {
        name: 'syncSystem',
        width: 180,
      },
      {
        name: 'syncMessage',
        width: 200,
      },
      {
        name: 'syncTypeMeaning',
        width: 200,
      },
      {
        name: 'syncDate',
        width: 150,
      },
    ];
  }, []);

  const tableStyle = useMemo(() => ({ maxHeight: modalFlag ? 'calc(100% - 60px)' : 430 }), [modalFlag]);

  return (
    <Table
      columns={columns}
      style={tableStyle}
      dataSet={syncRecordDs}
      customizedCode={girdCodeMap[docType]}
    />
  );
};

export default SyncRecord;
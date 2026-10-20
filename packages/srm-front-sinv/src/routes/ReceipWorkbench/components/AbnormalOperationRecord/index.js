import React, { useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import intl from 'utils/intl';
import ds from './ds';

export default function AbnormalOperationRecord() {
  const ListDs = useMemo(() => new DataSet(ds()), []);
  const columns = [
    {
      name: 'trxSourceNum',
      width: 180,
    },
    {
      name: 'operationUserName',
      width: 90,
    },
    {
      name: 'operationDate',
      width: 160,
    },
    {
      name: 'operationTypeMeaning',
      width: 120,
    },
    {
      name: 'operationStatusMeaning',
      width: 120,
      renderer: ({ record, value }) => {
        const operationStatus = record.get('operationStatus');
        if (['SUCCESS'].includes(operationStatus)) {
          // 绿色 成功、已完成
          return (
            <Tag color="green" style={{ border: 'none', height: '70px', lineHeight: '18px' }}>
              {value}
            </Tag>
          );
        } else if (['IMPORTING'].includes(operationStatus)) {
          // 橙色：过程中
          return (
            <Tag color="orange" style={{ border: 'none' }}>
              {value}
            </Tag>
          );
        } else {
          // 红色:警告
          return (
            <Tag color="red" style={{ border: 'none' }}>
              {value}
            </Tag>
          );
        }
      },
    },
    {
      name: 'reason',
      with: 160,
    },
    {
      name: 'nodeConfigName',
      width: 120,
    },
    {
      name: 'quantity',
      width: 120,
    },
    {
      name: 'poSourceNum',
      width: 160,
    },
    {
      name: 'asnSourceNum',
      width: 160,
    },
    {
      name: 'pcSourceNum',
      width: 160,
    },
  ];
  return (
    <div style={{ height: 'calc(100vh - 200px)' }}>
      <FilterBarTable
        dataSet={ListDs}
        columns={columns}
        style={{ maxHeight: `calc(100% - 22px)` }}
        border={false}
        defaultExpand
        filterBarConfig={{
          fields: [
            {
              name: 'trxSourceNum',
              type: 'string',
              label: intl.get(`sinv.receiptWorkbench.model.view.trxSourceNum`).d('收货单行号'),
              display: true,
              merge: true,
            },
            {
              name: 'operationUserName',
              type: 'string',
              display: true,
              label: intl.get(`sinv.receiptWorkbench.model.view.operationUserName`).d('操作人'),
            },
            {
              name: 'operationDates',
              type: 'dateTime',
              range: ['start', 'end'],
              display: true,
              label: intl.get(`sinv.receiptWorkbench.model.view.operationDate`).d('操作日期'),
            },
            {
              name: 'poSourceNum',
              type: 'string',
              display: true,
              label: intl
                .get(`sinv.receiptWorkbench.model.view.poSourceNum`)
                .d('来源订单编号-行号'),
            },
            {
              name: 'asnSourceNum',
              type: 'string',
              display: true,
              label: intl
                .get(`sinv.receiptWorkbench.model.view.asnSourceNum`)
                .d('来源送货单编号-行号'),
            },
            {
              name: 'pcSourceNum',
              type: 'string',
              display: true,
              label: intl
                .get(`sinv.receiptWorkbench.model.view.pcSourceNum`)
                .d('来源协议编号-行号'),
            },
            {
              name: 'operationType',
              type: 'string',
              display: true,
              lookupCode: 'SINV_RCV_EXCEPTION_TYPE',
              label: intl.get(`sinv.receiptWorkbench.model.view.operationType`).d('操作类型'),
            },
            {
              name: 'operationStatus',
              type: 'string',
              display: true,
              lookupCode: 'SINV.RCV.OPERATION_STATUS',
              label: intl
                .get(`sinv.receiptWorkbench.model.view.operationStatusMeaning`)
                .d('操作状态'),
            },
          ],
        }}
      />
    </div>
  );
}

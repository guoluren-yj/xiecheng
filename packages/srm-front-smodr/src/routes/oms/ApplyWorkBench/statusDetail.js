import React, { useMemo } from 'react';
import { Button, Table, DataSet } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { useRenderTag } from '@/hooks/useRenderTag';
import { handleToRetry } from '@/services/oms/applyWorkBenchService';

export default function StatusDetail(props) {
  const organizationId = getCurrentOrganizationId();
  const { recordData } = props;
  const ds = useMemo(() => new DataSet({
    autoQuery: true,
    selection: false,
    pageSize: 20,
    fields: [
      {
        name: 'executeTypeMeaning',
        label: intl.get('smodr.apply.model.executeType').d('执行类型'),
      },
      {
        name: 'executeResultMeaning',
        label: intl.get('smodr.apply.model.executeStatus').d('执行状态'),
      },
      {
        name: 'remark',
        label: intl.get('smodr.apply.model.executeRemark').d('执行消息'),
      },
      {
        name: 'executeQuantity',
        label: intl.get('smodr.apply.model.executeQuan').d('执行数量'),
        type: 'number',
      },
      {
        name: 'executeDate',
        type: 'dateTime',
        label: intl.get('smodr.apply.model.executeDate').d('执行时间'),
      },
      {
        name: 'createdByName',
        label: intl.get('smodr.apply.model.createdByName').d('操作人'),
      },
      {
        name: 'operation',
        label: intl.get('smodr.apply.model.operation').d('操作'),
      },
    ],
    transport: {
      read() {
        return {
          url: `${SMALL_ORDER}/v1/${organizationId}/mall-request-entry-details/execute-result`,
          method: 'GET',
          data: { requestEntryId: recordData.get('requestEntryId') },
        };
      },
    },
  }), [recordData.get('requestEntryId')]);
  const colorList = [
    { colorType: 'success', matchList: ['SUCCESS'] },
    { colorType: 'failed', matchList: ['FAILED'] },
  ];
  async function handleRetry() {
    const res = getResponse(await handleToRetry({ requestId: recordData.get('requestId') }));
    if (res) {
      ds.query();
    }
  }
  const columns = [
    {
      name: 'executeResultMeaning',
      renderer: ({ record, text }) => {
        const { color, initStyle } = useRenderTag(colorList, record?.get('executeResult'));
        return (
          <Tag color={color} style={initStyle}>
            {text}
          </Tag>
        );
      },
    },
    { name: 'executeTypeMeaning' },
    { name: 'remark' },
    { name: 'executeQuantity' },
    { name: 'executeDate', width: 140 },
    { name: 'createdByName' },
    {
      name: 'operation',
      lock: 'right',
      renderer: ({ record }) => {
        if (record.get('retryFlag') === 1) {
          return <Button color='primary' funcType='link' onClick={() => handleRetry()}>{intl.get('smodr.apply.model.orderRetry').d('转单重试')}</Button>;
        }
        return '-';
      },
    },
  ];
  return (
    <Table
      style={{ maxHeight: 'calc(100vh - 196px)' }}
      dataSet={ds}
      columns={columns}
      customizedCode='APPLY_WORKBENCH.EXECUTE_STATUS'
    />
  );
}

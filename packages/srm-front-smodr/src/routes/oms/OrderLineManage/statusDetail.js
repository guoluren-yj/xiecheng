import React, { useMemo } from 'react';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { Tag } from 'choerodon-ui';
import notification from 'utils/notification';
import {
  fetchRetryService,
} from '@/services/oms/orderDetailService';
import { statusObjDisplay} from './colorRender';

const organizationId = getCurrentOrganizationId();

export default function StatusDetail({recordDs}){
  const {orderEntryId, orderId} = recordDs.get(['orderEntryId', 'orderId']);

  const ds = useMemo(()=>
    new DataSet({
      autoQuery: true,
      selection: false,
      pageSize: 20,
      fields: [
        {
          name: 'syncStatus',
          label: intl.get('smodr.orderLine.model.syncStatus').d('状态'),
        },
        {
          name: 'operation',
          label: intl.get('smodr.orderLine.model.operation').d('操作'),
        },
        {
          name: 'messageCodeMeaning',
          label: intl.get('smodr.orderLine.model.msgType').d('消息类型'),
        },
        {
          name: 'syncSysCodeMeaning',
          label: intl.get('smodr.orderLine.model.syncSysCodeMeaning').d('接收模块'),
        },
        {
          name: 'documentCode',
          label: intl.get('smodr.orderLine.model.externalDocuCode').d('外部单据编码'),
        },
        {
          name: 'errorMsg',
          label: intl.get('smodr.orderLine.model.errorMsg').d('说明'),
        },
        {
          name: 'lastUpdateDate',
          label: intl.get('smodr.orderLine.model.lastUpdateDate').d('更新时间'),
        },
      ],
      transport: {
        read: ({ data })=>{
          return {
            url: `${SMALL_ORDER}/v1/${organizationId}/document-synchronization-records/queryByOrderEntry`,
            method: 'GET',
            data: {
              ...data,
              orderEntryId,
              organizationId,
              orderId,
            },

          };
        },
      },
    })
  );

  const fetchRetry = async ()=>{
    await fetchRetryService({
      documentSynchronizationRecordId: ds.current.get('documentSynchronizationRecordId'),
    }).then((res)=>{
      // 返回的success必为true
      if(getResponse(res)){
          notification.success();
          ds.query();
      }
    });
  };

  const columns = [
    {
      name: 'syncStatus',
      width: 100,
      renderer: ({ value, record }) => {
        return <Tag style={{ border: 'none' }} color={statusObjDisplay(value).color}>{record.get('syncStatusMeaning')}</Tag>;
      },
    },
    {
      name: 'operation',
      width: 80,
      renderer: ({ record })=>{
        const enableRetry = record.get('enableRetry');
        return enableRetry?
          <Button funcType="link" onClick={fetchRetry}>{intl.get('smodr.orderLine.view.retry').d('重试')}</Button>
         :'-';
      },
    },
    {
      name: 'documentCode',
      width: 180,
    },
    {
      name: 'messageCodeMeaning',
      width: 180,
    },
    {
      name: 'syncSysCodeMeaning',
      width: 120,
    },
    {
      name: 'errorMsg',
      width: 230,
    },
    {
      name: 'lastUpdateDate',
    },
  ];


  return (
    <Table
      style={{ maxHeight: 'calc(100vh - 196px)' }}
      dataSet={ds}
      columns={columns}
      customizable
      customizedCode="column-group"
    />
  );
}
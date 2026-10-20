import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { SRM_MALL } from '_utils/config';
import { fetchRetry } from '@/services/ecAddressManageService';
import { getResponse } from 'utils/utils';
import tagRender from './tagRender';

export default function ViewProgress({ recordDs }) {
  const columns = useMemo(() => {
    return [
      {
        name: 'upgradeStatus',
        width: 120,
        renderer: ({ record }) => {
          const { upgradeStatus, upgradeStatusMeaning } = record?.get([
            'upgradeStatus',
            'upgradeStatusMeaning',
          ]);
          return tagRender(upgradeStatus, upgradeStatusMeaning);
        },
      },
      {
        name: 'operation',
        width: 80,
        renderer: ({ record }) => {
          return record?.get('upgradeStatus') === 'FAILED' ? (
            <span className="action-link">
              <a onClick={()=>retry(record)}>{intl.get('small.ecAddressManage.model.retry').d('重试')}</a>
            </span>
          ) : (
            '-'
          );
        },
      },
      { name: 'upgradeContent' },
      { name: 'processNum' },
      { name: 'upgradeVersionCode' },
      { name: 'upgradeTime' },
      { name: 'remark' },
    ];
  }, []);

  const retry = async (record) => {
    // 传单条对象
    const res = getResponse(await fetchRetry(record?.toData()));
    if (res) {
      notification.success();
      ds.query();
    }
  };

  const ds = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      autoQuery: true,
      selection: false,
      primaryKey: 'regionUpgradeProcessId',
      pageSize: 20,
      fields: [
        {
          name: 'upgradeStatus',
          label: intl.get('small.common.model.status').d('状态'),
        },
        {
          name: 'operation',
          label: intl.get('small.common.model.operation').d('操作'),
        },
        {
          name: 'upgradeContent',
          label: intl.get('small.ecAddressManage.model.upgradeContent').d('升级内容'),
          transformResponse: (_, record)=>{
            const {upgradeContentMeaning} = record;
            return upgradeContentMeaning;
          },
        },
        {
          name: 'processNum',
          label: intl.get('small.ecAddressManage.model.processNum').d('操作流程号'),
        },
        {
          name: 'upgradeVersionCode',
          label: intl.get('small.ecAddressManage.model.upgradeVersion').d('升级版本'),
        },
        {
          name: 'upgradeTime',
          label: intl.get('small.ecAddressManage.model.upgradeTime').d('升级时间'),
        },
        {
          name: 'remark',
          label: intl.get('hzero.common.explain').d('说明'),
        },
      ],
      transport: {
        read: () => {
          return {
            url: `${SRM_MALL}/v1/region-upgrade-processs`,
            method: 'GET',
            data: { tenantId: recordDs.get('tenantId') },
          };
        },
      },
    });
  }, []);

  return (
    <>
      <Table dataSet={ds} columns={columns} customizable customizedCode="column-group" style={{ maxHeight: 'calc(100vh - 196px)' }} />
    </>
  );
}

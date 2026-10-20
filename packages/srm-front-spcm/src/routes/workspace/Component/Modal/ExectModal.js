/*
 * @Description: 推送状态
 * @Date: 2022-06-29 10:52:52
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import intl from 'utils/intl';
import { Modal, DataSet, Table, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { againPushExternalSystemData, triggerPush } from '@/services/purchaseContractViewService';

const organizationId = getCurrentOrganizationId();

const exectDS = (props) => {
  const { pcHeaderId } = props;
  return {
    paging: true,
    selection: false,
    autoQuery: true,
    primaryKey: 'recordId',
    pageSize: 20,
    // table显示的字段
    fields: [
      {
        label: intl.get(`spcm.workspace.model.pushsap.status`).d('同步状态'),
        name: 'importStatus',
      },
      {
        label: intl.get(`spcm.purchaseContractView.model.pushsap.async`).d('同步执行'),
        name: 'sync',
      },
      {
        label: intl.get(`spcm.purchaseContractView.model.pushsap.importMessage`).d('反馈信息'),
        name: 'importMessage',
      },
      {
        label: intl.get(`spcm.purchaseContractView.model.pushsap.importType`).d('推送类型'),
        name: 'importTypeMeaning',
      },
      {
        label: intl
          .get(`spcm.purchaseContractView.model.pushsap.sourceDocumentTable`)
          .d('来源表单'),
        name: 'sourceDocumentTable',
      },
      {
        label: intl.get(`spcm.purchaseContractView.model.pushsap.lastUpdateDate`).d('推送时间'),
        name: 'lastUpdateDate',
      },
      {
        name: 'externalSystemCode',
        label: intl.get(`spcm.common.model.externalSystemCode`).d('外部系统'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { queryParams = {} } = data;
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/inter-records/pcHeader/${pcHeaderId}`,
          method: 'GET',
          data: { ...data, ...queryParams },
        };
      },
    },
  };
};

const ExectModal = (props) => {
  const { dataSet, record, remote } = props;

  const syncAlignModal = async (data) => {
    const { importType } = data;
    let res;
    if (remote?.event) {
      const res = await remote.event.fireEvent('handleCuxSyncAlignModal', {
        props,
        dataSet,
        data,
      });
      if (!res) {
        return;
      }
    }
    if (importType === 'SYNC_CONTRACT_TO_RECEIPT') {
      res = await triggerPush([record]);
    } else {
      res = await againPushExternalSystemData(data);
    }
    if (getResponse(res)) {
      dataSet.query();
    }
  };

  // const renderExportVendorSystemStatus = (importStatus, statusMeaning) => {
  //   const colorConfigList = [
  //     {
  //       // 绿色
  //       status: ['SUCCESS'],
  //       color: 'rgb(71, 184, 129)',
  //       name: intl.get('sodr.workspace.view.message.sucess').d('成功'),
  //     },
  //     {
  //       // 红色
  //       status: ['FAIL'],
  //       color: 'rgb(245, 99, 73)',
  //       name: intl.get('sodr.workspace.view.message.failure').d('失败'),
  //     },
  //   ];
  //   const colorConfig = colorConfigList.find((i) => i.status.includes(value));
  //   return (
  //     <Tag color={colorConfig?.color}>
  //       {statusMeaning}
  //     </Tag>
  //   );
  // };

  const columns = [
    {
      name: 'importStatus',
      width: 120,
      renderer: ({ value, record }) => (
        <Tag color={value === '1' ? 'green' : 'red'} style={{ border: 'none' }}>
          {record.get('importStatusMeaning')}
        </Tag>
      ),
    },
    {
      name: 'sync',
      width: 120,
      renderer: ({ record }) =>
        record.get('importStatus') === '1' ? null : (
          <Button funcType='link' onClick={() => syncAlignModal(record?.toData())}>
            {intl.get(`spcm.purchaseContractView.model.pushsap.againAsync`).d('重新同步')}
          </Button>
        ),
    },
    {
      name: 'importMessage',
      width: 200,
    },
    {
      name: 'importTypeMeaning',
      width: 180,
    },
    {
      name: 'sourceDocumentTable',
      width: 180,
    },
    {
      name: 'lastUpdateDate',
      width: 120,
    },
    {
      name: 'externalSystemCode',
      width: 120,
    },
  ];
  return <Table dataSet={dataSet} columns={columns} />;
};

export default function showExectModal(props) {
  const { data } = props;
  const exectDs = new DataSet(exectDS({ pcHeaderId: data.pcHeaderId }));

  Modal.open({
    key: Modal.key(),
    drawer: true,
    title: intl.get('spcm.workspace.view.push.title').d('推送(同步)情况'),
    children: <ExectModal {...props} dataSet={exectDs} record={data} />,
    closable: true,
    movable: false,
    destroyOnClose: true,
    okButton: false,
    style: { width: '1090px' },
    cancelText: intl.get('hzero.common.button.close').d('关闭'),
    cancelProps: { color: 'primary' },
  });
}

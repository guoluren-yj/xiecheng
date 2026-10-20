import React from 'react';
import { Modal, DataSet } from 'choerodon-ui/pro';
import { Record } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import { RecordTimeLine } from '@/components/Record';
import { activeOrStopService } from '@/services/ecSignService';

import { EcSignStatus } from './enum';

interface IActiveOrStop {
  activateFlag: 1|0,
  ecSignId: string,
  callback: () => void | Promise<any>,
}
// 激活/终止
export const handleActiveOrStop = async ({activateFlag, ecSignId, callback}: IActiveOrStop) => {
  Modal.confirm({
    title: intl.get('small.common.view.tips').d('提示'),
    children: activateFlag === 1 ? intl
      .get('small.ecSign.view.activeConfirm')
      .d('激活后，需求人员可通过该电商进行采购，是否确认激活电商？')
      : intl
      .get('small.ecSign.view.stopConfirm')
      .d('终止后，需求人员无法再通过该电商进行采购。确认要终止电商吗？'),
    onOk: async () => {
      const params = {
        activateFlag,
        ecSignId,
      };
      getResponse(await activeOrStopService(params));
      callback()
    },
  });
}

// 操作记录
function operatorRender({ record }) {
  const {
    description,
    operationTime,
    operationType,
  } = record.get([
    'description',
    'operationTime',
    'operationType',
  ]);
  const actions = {
    [EcSignStatus.UNSIGNED]: {
      icon: 'record_test',
    },
    [EcSignStatus.SIGNED]: {
      icon: 'authorize',
      color: '#3AB344',
    },
    [EcSignStatus.REJECTED]: {
      icon: 'authorize',
      color: '#F05434',
    },
    [EcSignStatus.ACTIVATED]: {
      icon: 'check_circle',
    },
    [EcSignStatus.TERMINATED]: {
      icon: 'not_interested',
    },
    [EcSignStatus.OFFLINE_ACTIVE]:{
      icon: 'mode_edit'
    }
  };

  const { icon = 'record_test', color } = actions[operationType] || {};

  return {
    icon,
    time: operationTime,
    color,
    header: <div dangerouslySetInnerHTML={{__html: description}} />,
  };
}

export const handleOperatRecord = ({record}) => {
  if (!record) return;
  const { ecSignId } = record?.get(['ecSignId']);
  const ds = new DataSet({
    autoQuery: true,
    paging: false,
    transport: {
      read: {
        url: `/smal/v1/${getCurrentOrganizationId()}/ec-sign-records`,
        method: 'GET',
        data: { ecSignId },
      },
    },
  });
  Modal.open({
    title: intl.get('small.common.model.operateRecord').d('操作记录'),
    mask: true,
    drawer: true,
    destroyOnClose: true,
    style: { width: 742 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: <RecordTimeLine dataSet={ds} renderer={(v: { record: Record }) => operatorRender(v)} />,
  });
};

// 处理富文本展示内容
export function handleEcIntroduction(value: string) {
  const htmlParser = new DOMParser();
  const dom = htmlParser.parseFromString(value || '', "text/html");
  return dom.documentElement.innerText;
}

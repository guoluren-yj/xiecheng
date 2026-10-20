import React from 'react';
import { Icon, Tag } from 'choerodon-ui';
import intl from 'srm-front-boot/lib/utils/intl';

export const ImprotStatus = {
  SUCCESS: 'SUCCESS', // 导入成功
  ERROR: 'ERROR', // 导出失败
  WARN: 'WARN', // 导出异常
  NOT_PROCESS: 'NOT_PROCESS', // 未处理
};

export const StatusColor = {
  SUCCESS: '#47B881',
  ERROR: '#F56349',
  WARN: '#FCA000',
  NOT_PROCESS: 'grey',
};

export function recordDetailTableDS() {
  return {
    selection: false,
    paging: false,
    fields: [
      { name: 'importStatus', label: intl.get('srm.common.import.status').d('状态') },
      {
        name: 'serviceTypeMeaning',
        label: intl.get('hwfp.serviceDefinition.model.service.serviceType').d('服务类别'),
      },
      {
        name: 'serviceCode',
        label: intl.get('hwfp.serviceDefinition.model.service.serviceCode').d('服务编码'),
      },
      {
        name: 'description',
        label: intl.get('hwfp.serviceDefinition.model.service.description').d('服务描述'),
      },
      {
        name: 'importMessage',
        label: intl.get('srm.common.model.reportTemplate.error').d('错误信息'),
      },
    ],
  };
}

export function importStatusRenderer(status) {
  switch (status) {
    case 'SUCCESS':
      return [
        <Icon type="check_circle" style={{ fontSize: '16px', color: StatusColor.SUCCESS }} />,
        intl.get('srm.common.import.status.pass').d('成功'),
      ];
    case 'ERROR':
      return [
        <Icon type="cancel" style={{ fontSize: '16px', color: StatusColor.ERROR }} />,
        intl.get('srm.common.import.status.error').d('失败'),
      ];
    default:
      return <Icon type="access_time_filled" style={{ fontSize: '16px', color: '#29bece' }} />;
  }
}

export function sortRecordList(list, sortBy) {
  const STATUS = {
    SUCCESS: 40,
    ERROR: 30,
  };
  list.sort((before, after) => {
    return STATUS[before[sortBy]] - STATUS[after[sortBy]];
  });
  return list;
}

export const tagRenderer = (value, text) => {
  switch (value) {
    // 审批规则
    case 'APPROVAL_CANDIDATE_RULE': {
      return <Tag color="geekblue">{text}</Tag>;
    }
    // 审批方式
    case 'APPROVAL_STRATEGY': {
      return <Tag color="pink">{text}</Tag>;
    }
    // 跳转条件
    case 'SEQUENCE_CONDITION': {
      return <Tag color="orange">{text}</Tag>;
    }
    // 服务任务
    case 'SERVICE_TASK': {
      return <Tag color="green">{text}</Tag>;
    }
    default:
      return null;
  }
};

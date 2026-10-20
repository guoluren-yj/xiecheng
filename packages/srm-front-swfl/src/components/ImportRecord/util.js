import React from 'react';
import { Icon } from 'choerodon-ui';
import intl from 'srm-front-boot/lib/utils/intl';

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
        name: 'categoryCode',
        label: intl.get('swfl.processAppoint.model.processClassify.code').d('流程分类编码'),
      },
      {
        name: 'categoryDescription',
        label: intl.get('swfl.processAppoint.model.processClassify.describe').d('流程分类描述'),
      },
      {
        name: 'documentCode',
        label: intl.get('swfl.processAppoint.model.processSecurity.code').d('流程单据编码'),
      },
      {
        name: 'documentDescription',
        label: intl.get('swfl.processAppoint.model.processSecurity.describe').d('流程单据描述'),
      },
      { name: 'message', label: intl.get('srm.common.model.reportTemplate.error').d('错误信息') },
    ],
  };
}

export function importStatusRenderer(status, showText = false) {
  switch (status) {
    case 'SUCCESS':
      return [
        <Icon type="check_circle" style={{ fontSize: '16px', color: StatusColor.SUCCESS }} />,
        showText && intl.get('srm.common.import.status.pass').d('成功'),
      ];
    case 'ERROR':
      return [
        <Icon type="cancel" style={{ fontSize: '16px', color: StatusColor.ERROR }} />,
        showText && intl.get('srm.common.import.status.error').d('失败'),
      ];
    case 'WARN':
      return [
        <Icon type="error" style={{ fontSize: '16px', color: StatusColor.WARN }} />,
        showText && intl.get('srm.common.import.status.warm').d('异常'),
      ];
    case 'NOT_PROCESS':
      return [
        <Icon
          type="access_time_filled"
          style={{ fontSize: '16px', color: StatusColor.NOT_PROCESS }}
        />,
        showText && intl.get('srm.common.import.status.noPass').d('未处理'),
      ];
    default:
      return <Icon type="access_time_filled" style={{ fontSize: '16px', color: '#29bece' }} />;
  }
}

export function sortRecordList(list, sortBy) {
  const STATUS = {
    SUCCESS: 40,
    ERROR: 30,
    WARN: 20,
    NOT_PROCESS: 10,
  };
  list.sort((before, after) => {
    return STATUS[before[sortBy]] - STATUS[after[sortBy]];
  });
  return list;
}

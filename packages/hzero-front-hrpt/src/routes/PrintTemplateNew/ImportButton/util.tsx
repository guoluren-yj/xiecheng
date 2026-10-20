import React from 'react';
import { Icon } from 'choerodon-ui';
import intl from 'srm-front-boot/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

export enum ImprotStatus {
  SUCCESS = 'SUCCESS', // 导入成功
  ERROR = 'ERROR', // 导出失败
  WARN = 'WARN',  // 导出异常
  NOT_PROCESS = 'NOT_PROCESS', // 未处理
}
export interface IImportHistory {
  id: string;
  date: string;
  fileUrl?: string;
  importStatus?: ImprotStatus;
  userName?: string;
  message?: string;
  statusCount?: {
    [ImprotStatus.SUCCESS]?: number;
    [ImprotStatus.ERROR]?: number;
  },
  reportList?: IReport[];
}

export interface IReport {
  reportCode: string;
  reportName: string;
  importStatus: string;
  message?: string;
}

export const StatusColor = {
  SUCCESS: '#47B881',
  ERROR: '#F56349',
  WARN: '#FCA000',
  NOT_PROCESS: 'grey'
};


export function recordDetailTableDS() {
  return {
    selection: false,
    paging: false,
    fields: [
      { name: 'importStatus', label: intl.get('srm.common.import.status').d('状态') },
      { name: 'reportName', label: intl.get('srm.common.model.reportTemplate.name').d('打印模板名称') },
      { name: 'reportCode', label: intl.get('srm.common.model.reportTemplate.code').d('打印模板编码') },
      { name: 'message', label: intl.get('srm.common.model.reportTemplate.error').d('错误信息') },
    ],
  } as DataSetProps;
}

export function importStatusRenderer(status?: string, showText: boolean = false) {
  switch (status) {
    case "SUCCESS":
      return [
        <Icon type="check_circle" style={{ fontSize: '16px', color: StatusColor.SUCCESS }} />,
        showText && intl.get('srm.common.import.status.pass').d('成功'),
      ];
    case "ERROR":
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
        <Icon type="access_time_filled" style={{ fontSize: '16px', color: StatusColor.NOT_PROCESS }} />,
        showText && intl.get('srm.common.import.status.noPass').d('未处理'),
      ];
    default:
      return <Icon type="access_time_filled" style={{ fontSize: '16px', color: '#29bece' }} />;
  }
}


export function sortRecordList(list: IReport[], sortBy: string): IReport[] {
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
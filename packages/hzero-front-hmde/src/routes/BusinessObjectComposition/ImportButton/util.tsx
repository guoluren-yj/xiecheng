import React from 'react';
import { Icon } from 'choerodon-ui';

export function ImportStatusRenderer(status) {
  switch (status) {
    case "SUCCESS":
      return <Icon type="check_circle" style={{ fontSize: '16px', color: '#47B881' }} />;
    case "ERROR":
      return <Icon type="cancel" style={{ fontSize: '16px', color: '#F56349' }} />;
    case 'EXCEPTION':
      return <Icon type="error" style={{ fontSize: '16px', color: '#FCA000' }} />;
    case 'SUBMITTED':
    case 'EXECUTING':
    default:
      return <Icon type="access_time_filled" style={{ fontSize: '16px', color: '#29bece' }} />;
  }
}


export function sortRecordList(list: any[], sortBy: string): any[] {
  const STATUS = {
    SUCCESS: 1,
    ERROR: 0,
  };
  list.sort((before, after) => {
    return STATUS[before[sortBy]] - STATUS[after[sortBy]];
  });
  return list;
}
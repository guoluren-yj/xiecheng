import React from 'react';
import { Tag } from 'choerodon-ui';
import { TagProps } from 'choerodon-ui/lib/tag';
import intl from 'utils/intl';

export type StatusType = 'running' | 'error' | 'idle';

interface StatusTagProps extends TagProps {
  status: StatusType;
}

const statusMap: Record<StatusType, { label: string; color: string }> = {
  running: {
    label: intl.get('spfm.aiAssistant.view.status.running').d('运行中'),
    color: 'green',
  },
  error: {
    label: intl.get('spfm.aiAssistant.view.status.error').d('异常'),
    color: 'red',
  },
  idle: {
    label: intl.get('spfm.aiAssistant.view.status.idle').d('空闲中'),
    color: 'gray',
  },
};

const StatusTag: React.FC<StatusTagProps> = ({ status, ...otherProps }) => {
  const config = statusMap[status] || statusMap.idle;
  return (
    <Tag
      color={config.color}
      style={{
        marginRight: 0,
        borderColor: 'transparent',
        padding: '0 5px',
      }}
      {...otherProps}
    >
      {config.label}
    </Tag>
  );
};

export default StatusTag;

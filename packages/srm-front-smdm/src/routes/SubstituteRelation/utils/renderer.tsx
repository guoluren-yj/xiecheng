import React from 'react';
import { Tag } from 'choerodon-ui';

import { TagTypes } from './constant';

interface TagStatusProps {
  status: string,
  statusMeaning: string,
}

// 列表行上状态 tag渲染
export function renderTagStatus(tagStatusProps: TagStatusProps) {
  const {status, statusMeaning} = tagStatusProps;
  return <Tag color={TagTypes[status]}>{statusMeaning}</Tag>;
}


import React from 'react';
import { Tag } from 'choerodon-ui';

// tag颜色
export function colorRender(value, meaning) {
  if (['1', 1].includes(value)) {
    // 绿色
    return (
      <Tag color="green" style={{ border: 'none' }}>
        {meaning}
      </Tag>
    );
  } else {
    // 红色
    return (
      <Tag color="red" style={{ border: 'none' }}>
        {meaning}
      </Tag>
    );
  }
}

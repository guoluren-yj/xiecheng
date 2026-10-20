import React from 'react';
import { Tag } from 'choerodon-ui';

// tag颜色
const colorRender = (value, meaning) => {
  if (['NOT_RELEASED'].includes(value)) {
    // 黄色
    return (
      <Tag color="yellow" style={{ border: 'none' }}>
        {meaning}
      </Tag>
    );
  } else {
    // 绿色
    return (
      <Tag color="green" style={{ border: 'none' }}>
        {meaning}
      </Tag>
    );
  }
};

export { colorRender };

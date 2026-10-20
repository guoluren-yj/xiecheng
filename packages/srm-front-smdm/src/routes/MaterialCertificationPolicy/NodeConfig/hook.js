import React from 'react';
import { Tag } from 'choerodon-ui';

// tag颜色
const colorRender = (value, meaning) => {
  if (['2'].includes(String(value))) {
    // 黄色
    return (
      <Tag color="yellow" style={{ border: 'none' }}>
        {meaning}
      </Tag>
    );
  } else if (['1'].includes(String(value))) {
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
};

export { colorRender };

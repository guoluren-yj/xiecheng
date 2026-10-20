import React from 'react';
import { Tag } from 'choerodon-ui';

// tag颜色
const colorRender = (value, meaning) => {
  if (['UNRELEASED'].includes(value)) {
    // 橘色
    return (
      <Tag color="yellow" style={{ border: 'none' }}>
        {meaning}
      </Tag>
    );
  } else if (['DISABLED'].includes(value)) {
    // 红色
    return (
      <Tag color="red" style={{ border: 'none' }}>
        {meaning}
      </Tag>
    );
  } else if (['BECAME_INVALID'].includes(value)) {
    // 红色
    return (
      <Tag color="gray" style={{ border: 'none' }}>
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

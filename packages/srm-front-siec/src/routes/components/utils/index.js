import React from 'react';
import { Tag } from 'choerodon-ui';

/**
 * 状态颜色控制
 */
const colorRender = (_value, record, name = '') => {
  const value = record?.get(name);
  if (['08'].includes(value)) {
    return (
      <Tag color="green" style={{ border: 'none' }}>
        <span>{record?.get(`${name}Meaning`)}</span>
      </Tag>
    );
  } else if (['01', '02', '03', '11'].includes(value)) {
    return (
      <Tag color="yellow" style={{ border: 'none' }}>
        <span>{record?.get(`${name}Meaning`)}</span>
      </Tag>
    );
  } else if (['04', '05'].includes(value)) {
    return (
      <Tag color="red" style={{ border: 'none' }}>
        <span>{record?.get(`${name}Meaning`)}</span>
      </Tag>
    );
  } else if (['09'].includes(value)) {
    return (
      <Tag color="gray" style={{ border: 'none' }}>
        <span>{record?.get(`${name}Meaning`)}</span>
      </Tag>
    );
  } else {
    return <>-</>;
  }
};

export { colorRender };

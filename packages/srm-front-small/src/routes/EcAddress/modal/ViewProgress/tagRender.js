import React from 'react';
import { Tag } from 'choerodon-ui';

//  text为valueMeaning
export default function tagRender(value, text){
  const mapColor = {
    SUCCESS: 'green',
    FAILED: 'red',
    UPGRADING: 'yellow',
  };

  if (!text || !value) return '-';
  const color = mapColor[value] || 'gray';

  return (
    <Tag color={color} style={{ border: 'none', fontWeight: 500 }}>
      {text}
    </Tag>
  );
}
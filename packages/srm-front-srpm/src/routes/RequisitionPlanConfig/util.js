import React from 'react';
import { Tag } from 'choerodon-ui';
import classnames from 'classnames';

// 需求配置tag颜色
const colorRender = (value, meaning) => {
  if (['PUBLISHED'].includes(value)) {
    // 绿色
    return (
      <Tag className={classnames('c7n-tag-green')} style={{ border: 0 }}>
        {meaning}
      </Tag>
    );
  } else if (['Invalid'].includes(value)) {
    return (
      <Tag className={classnames('c7n-tag-red')} style={{ border: 0 }}>
        {meaning}
      </Tag>
    );
  } else {
    // 橘色
    return (
      <Tag className={classnames('c7n-tag-yellow')} style={{ border: 0 }}>
        {meaning}
      </Tag>
    );
  }
};

export { colorRender };

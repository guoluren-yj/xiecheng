
import React from 'react';
import { Icon } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { isNil } from 'lodash';

const onHandleUpdateResult = (value, code) => {
    if (isNil(value)) {
        return '-';
    }
    const colorConfigList = [
        {
          // 红色
          status: ["FAIL"],
          color: 'red',
          style: { border: 'none'},
        },
        {
            // 绿色
            status: ["SUCCESS"],
            color: 'green',
            style: { border: 'none'},
      },
      {
        // 黄色
        status: [
          'IMPORTING',
        ],
        color: 'yellow',
        style: { border: 'none' },
      },
      {
        // 灰色
        status: [
          'NONE',
        ],
        color: 'gray',
        style: { border: 'none' },
      },
    ];
    const colorConfig = colorConfigList.find((i) => i.status.includes(code));
    return (
      <Tag color={colorConfig?.color} style={colorConfig?.style}>
        {value}<Icon style={{ fontSize: '14px', marginLeft: '4px', fontWeight: 'normal' }} type="wysiwyg" />
      </Tag>
      );
};

export { onHandleUpdateResult };
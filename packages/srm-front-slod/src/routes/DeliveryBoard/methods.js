import React from 'react';
import { Modal, Icon } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';

import CreateResult from './components/CreateResult';

/**
 * 状态颜色控制
 */
const renderStatus = (code, meaning) => {
  const colorConfigList = [
    {
      // 黄色
      status: [
        'PENDING',
        'DELIVERY_DATE_REVIEW',
        'CLOSEING',
        'CANCELING',
        'CANCELLED_PARTIAL',
        'CLOSETOBECOMFIRMED',
        'CANCELTOBECOMFIRMED',
        'PROCESSING', // 执行中
        'WAIT_PROCESS', // 待执行
      ],
      color: 'yellow',
      style: { border: 'none' },
    },
    {
      // 绿色
      status: [
        'APPROVED',
        'PUBLISHED',
        'CONFIRMED',
        'PART_FEED_BACK',
        'SUBMITTED',
        'SUBMITTED_WFL',
        'COMPLETED', // 已完成
        'COMPLETED_PARTIAL', // 部分完成
      ],
      color: 'green',
      style: { border: 'none' },
    },
    {
      // 红色
      status: ['REJECTED', 'DELIVERY_DATE_REJECT'],
      color: ' red',
      style: { border: 'none' },
    },
    {
      // 灰色
      status: [
        'CLOSED',
        'CANCELED',
        'PUBLISH_CANCEL',
        'NEEDLESS_PROCESS', // 无需执行
      ],
      color: 'gray',
      style: { border: 'none' },
    },
  ];
  const colorConfig = colorConfigList.find((i) => i.status.includes(code));
  return (
    <Tag color={colorConfig?.color} style={colorConfig?.style}>
      <span>{meaning}</span>
      {['WAIT_PROCESS', 'COMPLETED', 'COMPLETED_PARTIAL', 'PROCESSING'].includes(code) && (
        <span style={{ marginLeft: '4px' }}>
          <Icon style={{ fontSize: 'inherit' }} type="alt_route-o" />
        </span>
      )}
    </Tag>
  );
};

// 弹框
const onOpenLinkChange = (_object) => {
  Modal.open({
    mask: true,
    drawer: true,
    okCancel: false,
    closable: true,
    title: intl.get('slod.deliveryBoard.model.common.createResult').d('自动创建结果'),
    style: { width: '742px', minWidth: '600px', padding: 0 },
    children: <CreateResult {..._object} />,
    okText: intl.get('hzero.common.button.close').d('关闭'),
  });
};

export { renderStatus, onOpenLinkChange };

import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import styles from './index.less';

const renderStatus = (code, meaning) => {
  if (!code || !meaning) {
    return;
  }
  const colorConfigList = [
    {
      // 黄色
      status: ['PENDING', 'DELIVERY_DATE_REVIEW', 'CLOSEING', 'CANCELING', 'CANCELLED_PARTIAL'],
      color: '#fef4e2',
      style: { color: '#fca400' },
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
      ],
      color: '#ebf7f1',
      style: { color: '#47b883' },
    },
    {
      // 红色
      status: ['REJECTED', 'DELIVERY_DATE_REJECT'],
      color: ' #ffeeeb',
      style: { color: '#f56649' },
    },
    {
      // 灰色
      status: ['CLOSED', 'CANCELED', 'PUBLISH_CANCEL'],
      color: '#F0F0F0',
      style: { color: 'rgba(0,0,0, .65)' },
    },
  ];
  const colorConfig = colorConfigList.find((i) => i.status.includes(code));
  return (
    <Tag color={colorConfig?.color} style={colorConfig?.style}>
      {meaning}
    </Tag>
  );
};

const tooltipRender = (type, text, placement = 'right', theme = 'light', title = '') => {
  return (
    <Tooltip
      placement={type === 'topRight' ? 'topRight' : placement}
      title={title || text}
      theme={theme}
    >
      {text}
    </Tooltip>
  );
};
/*
    COMMON 常规：#000 font-weight：400
    FOCUS 重点：#000 font-weight：600
    COMMON 标红：#F56349 font-weight：400
  */
const getSpecialStyleData = (type, value) => {
  if (!type) {
    return <span>{value}</span>;
  }

  const styleMap = new Map([
    [
      'COMMON', // 常规
      {
        color: '#000',
        fontWeight: 400,
      },
    ],
    [
      'FOCUS', // 重点
      {
        color: '#000',
        fontWeight: 600,
      },
    ],
    [
      'MARKED_RED', // 标红
      {
        color: '#F56349',
        fontWeight: 400,
      },
    ],
  ]);
  return <span style={styleMap.get(type)}>{value}</span>;
};
const actionTagRender = (actionList) => {
  if (!actionList || !(actionList instanceof Array)) {
    return;
  }

  const actionTagColor = new Map([
    ['NORMAL', { bgColor: '#E8E8EB', color: '#6A6A6D' }], // 普通状态 灰
    ['REMIND', { bgColor: '#FC8800', color: '#FFF' }], // 提醒状态 橘
    ['WARN', { bgColor: '#F56349', color: '#FFF' }], // 警告状态 红
  ]);

  return actionList.map((item) => (
    <Tooltip placement="top" title={item?.desc ?? null}>
      <Tag
        color={actionTagColor.get(item?.color ?? 'REMIND').bgColor}
        style={{ color: actionTagColor.get(item?.color ?? 'REMIND').color }}
      >
        {item.actionTitle}
      </Tag>
    </Tooltip>
  ));
};
// SWBH_card 单据图标及图标背景色
const docImgMap = new Map([
  [
    'ALL',
    {
      // 全部
      backgroundColor: '',
      iconType: 'widgets_line',
    },
  ],
  [
    'SINV',
    {
      // 物流 收发货
      backgroundColor: '#FF9E01', // 橙
      iconType: 'local_shipping',
    },
  ],
  [
    'SINV-SLOD',
    {
      // 物流 发货
      backgroundColor: '#FF9E01', // 橙
      iconType: 'local_shipping',
    },
  ],
  [
    'SINV-TRX',
    {
      // 物流 收货
      backgroundColor: '#FF9E01', // 橙
      iconType: 'archive',
    },
  ],
  [
    'SMALL',
    {
      // 商城
      backgroundColor: '#F56349', // 红
      iconType: 'storefront-o',
    },
  ],
  [
    'SODR',
    {
      // 订单
      backgroundColor: '#0A7DF5', // 蓝
      iconType: 'wysiwyg',
    },
  ],
  [
    'SPCM',
    {
      // 协议
      backgroundColor: '#0A7DF5', // 蓝
      iconType: 'assignment_turned_in',
    },
  ],
  [
    'SQAM',
    {
      // 质量
      backgroundColor: '#0A7DF5', // 蓝
      iconType: 'security',
    },
  ],
  [
    'SPRM',
    {
      // 需求
      backgroundColor: '#FF9E01', // 橙
      iconType: 'post_add',
    },
  ],
  [
    'SSLM',
    {
      // 供应商
      backgroundColor: '#36C2CF', // 绿
      iconType: 'supervised_user_circle',
    },
  ],
  [
    'SSRC',
    {
      // 寻源
      backgroundColor: '#36C2CF', // 绿
      iconType: 'travel_explore',
    },
  ],
  [
    'SSTA',
    {
      // 结算
      backgroundColor: '#F56349', // 绿
      iconType: 'calculate',
    },
  ],
  // [
  //   'SMDM',
  //   {
  //     // 物料
  //     backgroundColor: '#F56349', // 绿
  //     iconType: 'calculate',
  //   },
  // ],
]);
const statusTagRender = (code, meaning) => {
  if (!code || !meaning) {
    return;
  }
  const statusTagStyle = new Map([
    ['RED', { bgColor: 'rgba(240,84,52, 0.15)', color: 'rgb(240,84,52)' }], // 风险 红
    ['ORANGE', { bgColor: 'rgba(252,119,0, 0.15)', color: 'rgb(252,119,0)' }], // 待办 橘
    ['BLUE', { bgColor: 'rgba(25,131,245,0.15)', color: 'rgb(25,131,245)' }], // 进行中 蓝
    ['GREEN', { bgColor: 'rgba(58,179,68,0.15)', color: 'rgb(58,179,68)' }], // 完成 绿
    ['GREY', { bgColor: 'rgb(229,231,236)', color: 'rgb(78,87,105)' }], // 取消&失效 灰
  ]);

  const styleConfig = statusTagStyle.get(code);
  return (
    <Tag
      color={styleConfig?.bgColor}
      style={{ color: styleConfig?.color }}
      className={styles['status-color']}
    >
      {meaning}
    </Tag>
  );
};
export {
  docImgMap,
  renderStatus,
  tooltipRender,
  getSpecialStyleData,
  actionTagRender,
  statusTagRender,
};

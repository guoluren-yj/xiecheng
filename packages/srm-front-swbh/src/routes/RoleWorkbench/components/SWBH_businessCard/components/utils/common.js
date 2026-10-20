import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';

import { Tag } from 'choerodon-ui';
// 超级查询菜单类型
const ObjectMenuType = {
  syntheses: 'syntheses', // 综合
  bill: 'bill', // 单据
  supplier: 'supplier', // 供应商
  matter: 'matter', // 物料
};

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
      status: ['APPROVED', 'PUBLISHED', 'CONFIRMED', 'PART_FEED_BACK', 'SUBMITTED', 'SUBMITTED_WFL'],
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
const tooltipRender = (text, placement = 'right') => {
  return (
    <Tooltip placement={placement} title={text} theme="light">
      {text}
    </Tooltip>
    // <Text onMouseEnter={this.handleMouseEnter} />
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
      'COMMON', // 标红
      {
        color: '#F56349',
        fontWeight: 400,
      },
    ],
  ]);
  return <span style={styleMap.get(type)}>{value}</span>;
  // return <span>{value}</span>;
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
      backgroundColor: '#29BECE',
      iconType: 'widgets_line',
    },
  ],
  [
    'SINV',
    {
      // 物流
      backgroundColor: '#FF9E01', // 橙
      iconType: 'widgets_line',
    },
  ],
  [
    'SMALL',
    {
      // 商城
      backgroundColor: '#F56349', // 红
      iconType: 'widgets_line',
    },
  ],
  [
    'SODR',
    {
      // 订单
      backgroundColor: '#0A7DF5', // 蓝
      iconType: 'assignment',
    },
  ],
  [
    'SPCM',
    {
      // 协议
      backgroundColor: '#0A7DF5', // 蓝
      iconType: 'widgets_line',
    },
  ],
  [
    'SQAM',
    {
      // 质量
      backgroundColor: '#0A7DF5', // 蓝
      iconType: 'widgets_line',
    },
  ],
  [
    'SRRM',
    {
      // 需求
      backgroundColor: '#FF9E01', // 橙
      iconType: 'widgets_line',
    },
  ],
  [
    'SSLM',
    {
      // 供应商
      backgroundColor: '#36C2CF', // 绿
      iconType: 'widgets_line',
    },
  ],
  [
    'SSRC',
    {
      // 寻源
      backgroundColor: '#36C2CF', // 绿
      iconType: 'widgets_line',
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
]);
export { ObjectMenuType, renderStatus, tooltipRender, getSpecialStyleData, actionTagRender, docImgMap };

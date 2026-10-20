/*
 * @Description: 状态标签
 * @Date: 2023-05-05 20:37:24
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
import { Icon } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { isNil } from 'lodash';
import type { TagProps } from 'choerodon-ui/lib/tag';
import type { ColumnRenderProps } from 'choerodon-ui/pro/lib/table/Column';
import type { Renderer, RenderProps } from 'choerodon-ui/pro/lib/field/FormField';

import styles from './index.less';

enum tagColorTransMap {
  info = 'gray',
  success = 'green',
  warn = 'yellow',
  error = 'red',
  gray = 'gray',
  green = 'green',
  yellow = 'yellow',
  red = 'red',
  blue = 'blue',
};

type TagSize = 'normal' | 'small';
type TagColor = keyof typeof tagColorTransMap;

interface StatusTagProps extends TagProps {
  text?: ReactNode,
  size?: TagSize,
  value?: any;
  color?: TagColor,
  icon?: string,
}

type ColorConfig = {
  status: string[];
  color: string;
};

export const getTagColor = (dataSet, record, fieldName): TagColor => {
  const { tag } = dataSet?.getField(fieldName)?.getLookupData(undefined, record) || {};
  return tag || 'info';
};

export const colorConfigList: ColorConfig[] = [
  {
    // 黄色
    status: [
      'PENDING',
      'SUBMITTED',
      'SUBMITTED_WFL',
      'DELIVERY_DATE_REVIEW',
      'CLOSEING',
      'CANCELING',
      'CHANGE_TO_APPROVAL',
      'APPROVAL_PENDING',
      'INVALID_TO_APPROVAL',
      'TERMINATION_TO_APPROVAL',
      'ARCHIVE_TO_APPROVAL',
      'TERMINATION_CONFIRM',
      'REPLENISHING',
      'UN_PUBLISHED',
      'PURCHASER_SIGN_CONTRACT',
      'SUPPLIER_SIGN_CONTRACT',
    ],
    color: 'yellow',
  },
  {
    // 绿色
    status: ['APPROVED', 'PUBLISHED', 'EFFECTED', 'CONFIRMED', 'ARCHIVE', 'HAVE_ALTERATION', 'SUPPLEMENT_COMPLETE'],
    color: 'green',
  },
  {
    // 红色
    status: ['REJECTED','DISABLED', 'DELIVERY_DATE_REJECT', 'SUPPLIER_REJECTED', 'disable'],
    color: 'red',
  },
  {
    // 灰色
    status: ['DELETED', 'TERMINATION', 'CANCELLATION', 'EXPIRED','VALID', 'FIRST_EDITION',],
    color: 'gray',
  },
  // {
  //   // 青色
  //   status: ['FIRST_EDITION'],
  //   color: 'cyan',
  // },
];

const StatusTag: React.FC<StatusTagProps> = (props) => {
  const {
    text, // 显示字段
    size = 'normal', // 尺寸
    value, // 值字段
    color,
    icon, // 右边的icon
    ...otherProps
  } = props;

  const className = useMemo(() => styles[`spcm-${size}-tag`], [size]);

  if (color) {
    const bgColor = useMemo(() => tagColorTransMap[color], [color]);
    return (
      <Tag
        color={bgColor}
        className={className}
        style={{ border: 'none' }}
        {...otherProps}
      >
        {text || value || '-'}
        {!isNil(icon) && (
          <Icon type={icon} className={styles['spcm-status-tag-icon']} />
        )}
      </Tag>
    );
  } else {
    const colorConfig = useMemo(() => value && colorConfigList.find((i) => i.status.includes(value)), [value]);
    return (
      <Tag color={colorConfig ? colorConfig.color : 'green'} style={{ border: 'none' }} {...otherProps}>
        {text}
      </Tag>
    );
  }
};

interface StatusTagRenderProps extends RenderProps, ColumnRenderProps, StatusTagProps { };

export const statusTagRender: Renderer<StatusTagRenderProps> =
  ({ text, dataSet, record, name, icon, onClick }) => {
    return (
      <StatusTag
        text={text}
        icon={icon}
        onClick={onClick}
        color={getTagColor(dataSet, record, name)}
      />
    );
  };

export default StatusTag;

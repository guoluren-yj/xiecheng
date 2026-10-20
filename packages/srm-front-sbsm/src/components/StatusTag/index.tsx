import type { ReactNode } from 'react';
import React, { useMemo, memo } from 'react';
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

type HexColor = string; // 副作用在字符串插值
type TagSize = 'normal' | 'small';
type TagColor = keyof typeof tagColorTransMap;

interface StatusTagProps extends TagProps {
  text?: ReactNode,
  size?: TagSize,
  value?: any;
  color?: TagColor | HexColor,
  icon?: string,
}

export const getTagColor = (dataSet, record, fieldName): TagColor => {
  const { tag } = dataSet?.getField(fieldName)?.getLookupData(undefined, record) || {};
  return tag || 'info';
};

const StatusTag = memo((props: StatusTagProps) => {
  const {
    text, // 显示字段
    size = 'normal', // 尺寸
    value, // 值字段
    color = 'info',
    icon, // 右边的icon
    ...otherProps
  } = props;

  const tagStyle = useMemo<any>(() => {
    const baseStyle = {
      marginRight: 4,
      borderColor: 'transparent',
    };
    if (size === 'normal') {
      Object.assign(baseStyle, { padding: '0 5px' });
    } else if (size === 'small') {
      Object.assign(baseStyle, { padding: '0 2px', height: 16, lineHeight: '15px' });
    };
    return baseStyle;
  }, [size]);

  // className加上后会被hover或者click删除掉，必须用style或者外层嵌套
  return (
    <Tag
      color={tagColorTransMap[color]}
      style={tagStyle}
      {...otherProps}
    >
      {text || value || '-'}
      {!isNil(icon) && (
        <Icon type={icon} className={styles['sbsm-status-tag-icon']} />
      )}
    </Tag>
  );
});

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

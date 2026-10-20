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

// @ts-ignore
type HexColor = `#${string}`; // 副作用在字符串插值
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

/**
 * @description: 颜色十六进制代码转rgba
 * @param {string} hex 16进制颜色代码
 * @param {number} opacity 透明度
 * @return {string} rgba颜色
 */
export function hexToRgba(hex: string = '', opacity: number = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return hex && `rgba(${r},${g},${b},${opacity})`;
}

const StatusTag = memo((props: StatusTagProps) => {
  const {
    text, // 显示字段
    size = 'normal', // 尺寸
    value, // 值字段
    color = 'info',
    icon, // 右边的icon
    ...otherProps
  } = props;

  const hexColorFlag = useMemo<Boolean>(() => color?.startsWith('#'), [color]);

  // 兼容早期租户直接配置16进制颜色代码
  const { hexColor, bgColor } = useMemo(
    () =>
      hexColorFlag
        ? { hexColor: color, bgColor: hexToRgba(color, 0.1) }
        : { bgColor: tagColorTransMap[color] },
    [color, hexColorFlag]
  );

  const tagStyle = useMemo<any>(() => {
    const baseStyle = {
      marginRight: 4,
      borderColor: 'transparent',
    };
    if (hexColor) {
      Object.assign(baseStyle, { color: hexColor });
    };
    if (size === 'normal') {
      Object.assign(baseStyle, { padding: '0 5px' });
    } else if (size === 'small') {
      Object.assign(baseStyle, { padding: '0 2px', height: 16, lineHeight: '15px' });
    };
    return baseStyle;
  }, [hexColor, size]);

  // className加上后会被hover或者click删除掉，必须用style或者外层嵌套
  return (
    <Tag
      color={bgColor}
      style={tagStyle}
      {...otherProps}
    >
      {text || value || '-'}
      {!isNil(icon) && (
        <Icon type={icon} className={styles['sqam-status-tag-icon']} />
      )}
    </Tag>
  );
});

interface StatusTagRenderProps extends RenderProps, ColumnRenderProps, StatusTagProps { };

export const statusTagRender: Renderer<StatusTagRenderProps> =
  ({ text, value, dataSet, record, name, icon, onClick }) => {
    if (isNil(value)) return text;
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

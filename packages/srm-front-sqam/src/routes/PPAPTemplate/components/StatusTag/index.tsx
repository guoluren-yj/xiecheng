import React, { useMemo, memo } from 'react';
import { Tag } from 'choerodon-ui';

import styles from './index.less';
// import styles from './index.less';

interface StatusTagProps {
  // 尺寸
  size?: 'normal' | 'small';
  // 值
  value: any;
  // 颜色
  color?: string;
  flag?: boolean | undefined | null;
  renderTextFlag?: boolean; // 渲染成纯文字
  icon?: any;
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

export const tagColors = {
  success: { hex: '#47B881', rgba: 'rgba(71, 184, 129, 0.1)' },
  warn: { hex: '#F88D10', rgba: 'rgba(248, 141, 16, 0.1)' },
  error: { hex: '#F56349', rgba: 'rgba(245, 99, 73, 0.1)' },
  danger: { hex: '#F56349', rgba: 'rgba(245, 99, 73, 0.1)' },
  info: { hex: 'rgba(0, 0, 0, 0.65)', rgba: 'rgba(0, 0, 0, 0.1)' },
  green: { hex: 'rgb(17, 217, 84)', rgba: 'rgb(230, 255, 234)' },
};

const StatusTag = memo((props: StatusTagProps) => {
  const { size = 'normal', value, color = 'gray', flag = false, renderTextFlag, icon } = props;

  const { hex, rgba } = useMemo(
    () =>
      color.startsWith('#')
        ? { hex: color, rgba: hexToRgba(color, 0.1) }
        : tagColors[color] || tagColors.info,
    [color]
  );

  if (renderTextFlag) return (<span> {value}</span>);

  if (flag) {
    return (
      <Tag color={color} className={styles[`tag-color`]}>
        {' '}
        <span> {value}</span>
        {icon && <span>{icon}</span>}
      </Tag>
    );
  }

  return (
    <Tag color={rgba} className={styles[`${size}-tag`]}>
      {' '}
      <span style={{ color: hex }}> {value}</span>
      {icon && <span>{icon}</span>}
    </Tag>
  );

});

export default StatusTag;

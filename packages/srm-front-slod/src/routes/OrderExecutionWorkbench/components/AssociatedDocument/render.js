import React from 'react';
import { Tag } from 'choerodon-ui';

const tabColors = {
  success: { hex: '#47B881', rgba: 'rgba(71, 184, 129, 0.1)' },
  warn: { hex: '#F88D10', rgba: 'rgba(248, 141, 16, 0.1)' },
  error: { hex: '#F56349', rgba: 'rgba(245, 99, 73, 0.1)' },
  info: { hex: 'rgba(0, 0, 0, 0.65)', rgba: 'rgba(0, 0, 0, 0.1)' },
};

/*
 * @param: hex { string}
 * @param: opacity  { string || number } 透明度
 * @return: { string } rgba格式
 */
function hexToRgba(hex = '', opacity = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return hex && `rgba(${r},${g},${b},${opacity})`;
}

export function statusTagRender(value, color = 'info') {
  const { hex, rgba } = color.startsWith('#')
    ? { hex: color, rgba: hexToRgba(color, 0.1) }
    : tabColors[color];
  return (
    <Tag color={rgba} style={{ fontWeight: 600, padding: '0 5px' }}>
      {' '}
      <span style={{ color: hex }}> {value}</span>
    </Tag>
  );
}
export default statusTagRender;

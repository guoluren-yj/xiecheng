import React from 'react';
import { Tag, Tooltip } from 'choerodon-ui';
import { Icon } from 'choerodon-ui/pro';

export default function TagPro(props) {
  const { color = 'default', bgColor, fontColor, fontWeight = 500, message, children } = props;
  const colorMaps = {
    default: ['rgba(252,160,0,0.10)', '#F88D10'], // 默认｜未操作状态
    success: ['rgba(71,184,129,0.10)', '#47B881'], // 成功状态
    invalid: ['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.85)'], // 失效状态
    error: ['#ffeeeb', '#f56649'], // 失败|错误状态
  };
  const [defaultBgColor, defaultFontColor] = colorMaps[color] || colorMaps.default;
  return (
    <Tag
      color={bgColor || defaultBgColor}
      style={{ color: fontColor || defaultFontColor, fontWeight, margin: 0 }}
    >
      {children}
      {message && (
        <Tooltip title={message} placement="top">
          <Icon
            type="help"
            style={{
              fontSize: '14px',
              marginBottom: 4,
              marginLeft: 6,
              fontWeight: 'normal',
              color: fontColor || defaultFontColor || 'rgba(0, 0, 0, 0.65)',
            }}
          />
        </Tooltip>
      )}
    </Tag>
  );
}

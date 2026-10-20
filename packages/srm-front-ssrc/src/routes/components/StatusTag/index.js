import React, { useMemo, memo } from 'react';
import { Icon } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { isNil } from 'lodash';

import styles from './index.less';

const tagColorTransMap = {
  info: 'gray',
  success: 'green',
  warn: 'yellow',
  error: 'red',
  gray: 'gray',
  green: 'green',
  yellow: 'yellow',
  red: 'red',
  blue: 'blue',
};

export const getTagColor = (dataSet, record, fieldName) => {
  const { tag } = dataSet?.getField(fieldName)?.getLookupData(undefined, record) || {};
  return tag || 'info';
};

const StatusTag = memo(props => {
  const {
    text, // 显示字段
    size = 'normal', // 尺寸
    value, // 值字段
    color = 'info',
    icon, // 右边的icon
    ...otherProps
  } = props;

  const { bgColor } = useMemo(() => ({ bgColor: tagColorTransMap[color] }), [color]);

  const tagStyle = useMemo(() => {
    const baseStyle = {
      marginRight: 4,
      borderColor: 'transparent',
    };
    if (size === 'normal') {
      Object.assign(baseStyle, { padding: '0 5px' });
    } else if (size === 'small') {
      Object.assign(baseStyle, { padding: '0 2px', height: 16, lineHeight: '15px' });
    }
    return baseStyle;
  }, [size]);

  // className加上后会被hover或者click删除掉，必须用style或者外层嵌套
  return (
    <Tag color={bgColor} style={tagStyle} {...otherProps}>
      {text || value || '-'}
      {!isNil(icon) && <Icon type={icon} className={styles['ssrc-status-tag-icon']} />}
    </Tag>
  );
});

export const statusTagRender = ({ text, dataSet, record, name, icon, onClick, size }) => {
  return (
    <StatusTag
      text={text}
      icon={icon}
      onClick={onClick}
      color={getTagColor(dataSet, record, name)}
      size={size}
    />
  );
};

export default StatusTag;

import React from 'react';
import { Tag, Tooltip, Icon } from 'choerodon-ui';
// import classNames from 'classnames';

// import styles from './index.less';

function StatusTag(props) {
  const { text, color = 'gray', message } = props;
  return (
    <Tag border={false} color={color}>
      {text}
      {message && (
        <Tooltip title={message} placement="top">
          <Icon
            type="help"
            style={{
              fontSize: '12px',
              marginBottom: 4,
              marginLeft: 6,
              fontWeight: 'normal',
            }}
          />
        </Tooltip>
      )}
    </Tag>
  );
}

export default StatusTag;

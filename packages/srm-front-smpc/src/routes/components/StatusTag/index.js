import React from 'react';
import { Tag, Tooltip, Icon } from 'choerodon-ui';
import classNames from 'classnames';

import styles from './index.less';

function StatusTag(props) {
  const { text, type, message } = props;
  // const codeColorMap = {
  //    NEW: '#f88c0d', // 橙色 新建
  //    SUBMITTED: '#47b881', // 绿色 已提交
  //    APPROVED: '#47b881', // 绿色 审批通过
  //    REJECT: '#f56649', // 红色 审批拒绝
  //    DISABLED: '#000000d9', // 灰色 已失效
  //    PUBLISHED: '#47b881', // 绿色 已发布
  //    TERMINATED: '#000000d9', // 灰色 已终止
  // };
  return (
    <Tag className={classNames({ [styles.tag]: true, [styles[`tag-${type}`]]: true })}>
      {text}
      {message && (
        <Tooltip title={message} placement="top">
          <Icon
            type="help"
            className={classNames({ [styles[`tag-${type}`]]: true })}
            style={{
              fontSize: '14px',
              marginBottom: 4,
              marginLeft: 6,
              fontWeight: 'normal',
              // color: fontColor || 'rgba(0, 0, 0, 0.65)',
            }}
          />
        </Tooltip>
      )}
    </Tag>
  );
}

export default StatusTag;

import React from 'react';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';

export function EnableColorTag({
  enabledFlag = 1,
  yesText = intl.get('hzero.common.button.enable').d('启用'),
  noText = intl.get('hzero.common.button.disable').d('禁用'),
}) {
  return enabledFlag === 1 ? (
    <Tag color="green" style={{ fontWeight: 500, border: 'none' }}>
      {yesText}
    </Tag>
  ) : (
    <Tag color="red" style={{ fontWeight: 500, border: 'none' }}>
      {noText}
    </Tag>
  );
}

export function StatusTag({ published = true }) {
  return published ? (
    <Tag color='green' style={{ fontWeight: 500, border: 'none' }}>
      {intl.get('sstk.common.view.tag.published').d('已发布')}
    </Tag>
  ) : (
    <Tag color="yellow" style={{ fontWeight: 500, border: 'none' }}>
      {intl.get('sstk.common.view.tag.unPublish').d('未发布')}
    </Tag>
  );
}

export const statusRender = (statusCode, codeMeaning, isDelete = false) => {
  const tagMap = {
    NEW: {
      color: 'yellow',
    },
    REJECTED: {
      color: 'red',
    },
    WORKFLOW_WAITING: {
      color: 'yellow',
    },
    APPROVED: {
      color: 'green',
    },
    // OUTED: {
    //   color: 'green',
    // },
    // ENTERED: {
    //   color: 'green',
    // },
    // WAITING_STORAGE: {
    //   color: 'yellow',
    // },
    COMPLETE: {
      color: 'green',
    },
  };
  return isDelete ? (
    <Tag color='gray' style={{ fontWeight: 500, border: 'none' }}>
      {intl.get('sstk.stockWorkbench.view.tag.isDelete').d('已删除')}
    </Tag>
  ) : (
    <Tag color={tagMap[statusCode]?.color || 'gray'} style={{ fontWeight: 500, border: 'none' }}>
      {codeMeaning}
    </Tag>
  );
};
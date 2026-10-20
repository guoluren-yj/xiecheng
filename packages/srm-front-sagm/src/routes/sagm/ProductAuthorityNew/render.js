import React from 'react';
import { Tag, Tooltip, Icon } from 'choerodon-ui';

import intl from 'utils/intl';

const renderAuthorityStatus = ({ record, value }) => {
  if (record) {
    const { statusCode, enableFlag, optRemarkMeaning } = record.get([
      'statusCode',
      'enableFlag',
      'optRemarkMeaning',
    ]);
    let code = statusCode;
    if (!['PUBLISHED', 'EXECUTING', 'PUBLISH_FAILED'].includes(statusCode)) {
      code = 'UNPUBLISH';
    }
    if (!enableFlag) {
      code = 'DISABLED';
    }
    const _map = {
      PUBLISHED: {
        color: 'green',
        meaning: value,
      },
      UNPUBLISH: {
        color: 'yellow',
        meaning: intl.get('sagm.common.view.status.unPublish').d('未发布'),
      },
      DISABLED: {
        color: 'red',
        meaning: intl.get('sagm.common.view.status.disabled').d('已禁用'),
      },
      EXECUTING: {
        color: 'yellow',
        meaning: value,
      },
      PUBLISH_FAILED: {
        color: 'red',
        meaning: value,
      },
    };
    return (
      <Tag color={_map[code]?.color} border={false}>
        {_map[code]?.meaning}
        {code === 'PUBLISH_FAILED' && optRemarkMeaning && (
          <Tooltip title={optRemarkMeaning} placement="top">
            <Icon
              type="error"
              style={{
                fontSize: '14px',
                marginBottom: 2,
                marginLeft: 4,
                fontWeight: 'normal',
              }}
            />
          </Tooltip>
        )}
      </Tag>
    );
  }
  return '-';
};

export { renderAuthorityStatus };

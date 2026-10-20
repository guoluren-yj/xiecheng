import React from 'react';
import { isNil } from 'lodash';
import { Badge } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import StatusTag from '.';
import { ReactComponent as IntelligentReviewIcon } from '../../../assets/intelligent_review.svg';

const AI_PRE_REVIEW_COLOR = {
  EXECUTING: 'blue',
  FAIL: 'yellow',
  APPROVED: 'green',
  REJECTED: 'red',
  APPROVED_SUGGEST: 'yellow',
};

export const aiPreReviewRenderer = ({ text, value, record, onClick }) => {
  if (isNil(value)) return text;
  return (
    <Tooltip
      theme="light"
      placement="bottom"
      popupStyle={{ minWidth: 180 }}
      title={
        ['REJECTED', 'APPROVED', 'APPROVED_SUGGEST'].includes(value) ? (
          <div style={{ margin: 8 }}>
            <div style={{ marginBottom: 8 }}>
              <Badge status="success" />
              <span>{intl.get('ssta.common.model.common.aiApprovedCount').d('通过数量')}</span>
              <span style={{ float: 'right' }}>
                {record?.get('sstaAiApproveResult.aiApprovedCount') || 0}
              </span>
            </div>
            <div>
              <Badge status="error" />
              <span>{intl.get('ssta.common.model.common.aiRejectedCount').d('不通过数量')}</span>
              <span style={{ float: 'right' }}>
                {record?.get('sstaAiApproveResult.aiRejectedCount') || 0}
              </span>
            </div>
          </div>
        ) : null
      }
    >
      <StatusTag
        text={text}
        onClick={onClick}
        color={AI_PRE_REVIEW_COLOR[value]}
        icon={<IntelligentReviewIcon style={{ marginLeft: '4px', verticalAlign: 'sub' }} />}
      />
    </Tooltip>
  );
};

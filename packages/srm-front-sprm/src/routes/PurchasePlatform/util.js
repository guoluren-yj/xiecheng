import React from 'react';
import { Tag, Tooltip, Badge } from 'choerodon-ui';
import intl from 'utils/intl';
import { ReactComponent as AiCheckIcon } from '@/assets/aiCheck.svg';

// 采购申请工作台tag颜色
const colorRender = (value, meaning) => {
  let styleColor = 'yellow';
  switch (value) {
    case 'NOT_STARTED':
      styleColor = 'gray';
      break;
    case 'REJECTED':
    case 'SEND_BACK':
    case 'CANCELLED':
    case 'CLOSED':
      styleColor = 'red';
      break;
    case 'SUBMIT_SYNC':
    case 'UNCLOSED':
    case 'UNCANCELLED':
    case 'EXCUTED':
    case 'ASSIGNED':
    case 'APPROVED':
    case 'SUBMITTED':
    case 'FINISHED':
      styleColor = 'green';
      break;
    default:
      styleColor = 'yellow';
      break;
  }
  return (
    value && (
      <Tag color={styleColor} style={{ border: 0 }}>
        {meaning}
      </Tag>
    )
  );
};

const aiApproveStatusRender = ({ record }) => {
  const aiCheckResultDTO = record.get('aiCheckResultDTO');
  const { approveCount, rejectCount, approveResult, approveResultMeaning } = aiCheckResultDTO || {};
  let color = '';
  switch (approveResult) {
    case 'APPROVED':
      color = 'green';
      break;
    case 'REJECTED':
      color = 'red';
      break;
    case 'APPROVING':
      color = 'blue';
      break;
    default:
      color = 'yellow';
      break;
  }
  return approveResultMeaning ? (
    <Tooltip
      theme="light"
      placement="bottom"
      popupStyle={{ minWidth: 120 }}
      title={
        <div style={{ margin: 8 }}>
          <div style={{ marginBottom: 8 }}>
            <Badge status="success" />
            <span>{intl.get('sprm.common.view.aiPassNum').d('通过数量')}</span>
            <span style={{ float: 'right' }}>{approveCount || 0}</span>
          </div>
          <div>
            <Badge status="error" />
            <span>{intl.get('sprm.common.view.aiNotPassNum').d('不通过数量')}</span>
            <span style={{ float: 'right' }}>{rejectCount || 0}</span>
          </div>
        </div>
      }
    >
      <Tag color={color} style={{ border: 'none' }}>
        {approveResultMeaning}
        <AiCheckIcon style={{ marginLeft: 4, verticalAlign: 'sub' }} />
      </Tag>
    </Tooltip>
  ) : (
    '-'
  );
};

export { colorRender, aiApproveStatusRender };

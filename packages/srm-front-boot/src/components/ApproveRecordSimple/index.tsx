import React from 'react';
import { Popover, Icon, Timeline } from 'choerodon-ui';
import { toJS } from 'mobx';
import { isNil } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

import formatterCollections from '../../utils/intl/formatterCollections';
import { getApproveActionStyle } from './utils';
import './index.less';

type Record = {
  headerAction?: string;
  action?: string;
  lineTime?: string;
  fullMessage?: string;
  employeeList?: string[];
  comment?: string;
}

interface ApproveRecordSimpleProps {
  data: Record[];
}

const clsPrefix = 'srm-common-approve-record-simple';

function ApproveRecordSimple(props: ApproveRecordSimpleProps) {
  const { data } = props;
  const renderNodeTitle = (node: Record, isHeader, color?: string, headerAction?: string) => {
    const { action, fullMessage, employeeList } = node;
    if (headerAction === 'SUSPENDED') {
      return (
        <span>
          {employeeList && employeeList[0] === 'hwfp.approver.error.assignee' && !isHeader ?
            intl.get('hwfp.common.view.title.errorAssigne').d('错误审批人') :
            intl.get('hwfp.common.view.title.processSuspended').d('流程挂起')}
        </span>
      );
    }
    if (action) {
      return (
        <span style={{ wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fullMessage}
          {action.toLowerCase() === 'approved' && intl.get('hwfp.task.button.approvalAdopt').d('审批通过')}
          {action.toLowerCase() === 'rejected' && intl.get('hzero.common.view.message.title.reject').d('审批拒绝')}
        </span>
      );
    }
    if (employeeList && employeeList[0] === 'hwfp.approver.error.assignee') {
      return (
        <span style={{ color: !isHeader ? '#868D9C' : undefined, wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {intl.get('hwfp.common.view.title.errorAssigne').d('错误审批人')}
        </span>
      );
    }
    return (
      <span style={{ color, wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {employeeList ? employeeList.filter(item => !isNil(item)).join(',') : ''}{intl.get('hwfp.common.view.title.pending').d('待审批')}
      </span>
    );
  };

  const renderNode = (item: Record) => {
    const { color } = getApproveActionStyle(item.action);
    const action = item.action && item.action.toLowerCase();
    return (
      <Timeline.Item color={!action ? '#E5E7EC' : `rgb(${color})`}>
        <div className={`${clsPrefix}-list-item-title`}>
          {renderNodeTitle(item, false, !action ? '#868D9C' : undefined)}
          {!!action && ['approveandaddsign', 'approved'].includes(action) && (
            <Icon type='check' style={{ color: '#47B883' }} className={`${clsPrefix}-list-item-icon`} />
          )}
          {!!action && ['jump', 'rejected'].includes(action) && (
            <Icon type='close' style={{ color: '#F56349' }} className={`${clsPrefix}-list-item-icon`} />
          )}
        </div>
        {action === 'rejected' && !!item.comment && (
          <div className={`${clsPrefix}-list-item-comment`}>
            {intl.get('hzero.common.view.message.comment').d('审批意见')}: {item.comment}
          </div>
        )}
        <div className={`${clsPrefix}-list-item-content`}>{item.lineTime ? dateTimeRender(item.lineTime) : ''}</div>
      </Timeline.Item>
    );
  };

  const renderLsit = () => {
    return (
      <Timeline>
        {data.map(item => renderNode(item))}
      </Timeline>
    );
  };

  const render = () => {
    if (data && data.length) {
      // 外面展示最后一条记录
      const lastNode = data[data.length - 1];
      const { color } = getApproveActionStyle(lastNode.action);
      const isApproving = !lastNode.action && lastNode.headerAction !== 'SUSPENDED' && (!lastNode.employeeList || lastNode.employeeList[0] !== 'hwfp.approver.error.assignee');
      return (
        <Popover
          content={renderLsit}
          overlayClassName={`${clsPrefix}-list`}
          placement="bottom"
        >
          <div
            className={clsPrefix}
            style={{
              color: `rgb(${color})`,
              backgroundColor: isApproving ? 'rgba(242,128,26,0.15)' : `rgba(${color}, 0.15)`,
            }}
          >
            {renderNodeTitle(
              lastNode,
              true,
              isApproving ? '#F06200' : undefined,
              lastNode.headerAction
            )}
            <Icon
              type='alt_route-o'
              style={{ color: isApproving ? '#F06200' : undefined }}
            />
          </div>
        </Popover>
      );
    }
    return null;
  };

  return render();
}

ApproveRecordSimple.displayName = 'ApproveRecordSimple';

export default formatterCollections({ code: ['hwfp.common', 'hwfp.task'] })(ApproveRecordSimple);
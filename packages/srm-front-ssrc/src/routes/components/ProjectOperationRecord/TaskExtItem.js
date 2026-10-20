/**
 * 具体审批记录
 */
import React from 'react';
import { Tag, Icon } from 'choerodon-ui';
import moment from 'moment';

import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import Upload from '_components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';

import { FIlESIZE } from '@/utils/SsrcRegx';
import FormItem from './components/FormItem';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const TaskExtItem = (props) => {
  const { item, index } = props;

  const renderTitle = (_item) => {
    const { action, actionMeaning } = _item;
    let tagNode = null;
    switch (action) {
      case 'Approved':
        tagNode = <Tag color="#47B881">{actionMeaning}</Tag>;
        break;
      case 'Rejected':
        tagNode = <Tag color="#F56649">{actionMeaning}</Tag>;
        break;
      default:
        break;
    }
    return (
      <div className={styles['approve-record-timeline-title']}>
        <h4>
          {item.actType === 'endEvent'
            ? intl.get('ssrc.common.view.message.processEnd').d('流程结束')
            : item.name}
        </h4>
        {tagNode}
      </div>
    );
  };

  const renderApprovalResultIcon = (_item) => {
    let iconNode = null;
    switch (_item.action) {
      case 'Approved':
        iconNode = <Icon type="done" style={{ fontSize: '14px', color: '#47B883' }} />;
        break;
      case 'Rejected':
        iconNode = <Icon type="close" style={{ fontSize: '14px', color: '#F56649' }} />;
        break;
      default:
        break;
    }
    return iconNode;
  };

  return (
    <div className={styles['common-record-timeline-wrap']}>
      {renderTitle(item)}
      {item.actType !== 'endEvent' && (
        <>
          {index === 0 && (
            <FormItem label={intl.get('ssrc.common.model.common.processId').d('流程标识')}>
              {item.processInstanceId}
            </FormItem>
          )}
          <FormItem
            label={
              item.actType === 'startEvent'
                ? intl.get('ssrc.common.model.common.submitUser').d('发起人')
                : intl.get('ssrc.common.model.common.approvalUser').d('审批人')
            }
          >
            {item.assigneeName} {renderApprovalResultIcon(item)}
          </FormItem>
          {['Approved', 'Rejected'].includes(item.action) && (
            <FormItem label={intl.get('ssrc.common.model.common.approvalComment').d('审批意见')}>
              {item.comment}
            </FormItem>
          )}
          <FormItem label={intl.get('ssrc.common.model.common.attachment').d('附件')}>
            <Upload
              filePreview
              viewOnly
              bucketName={PRIVATE_BUCKET}
              tenantId={organizationId}
              attachmentUUID={item.attachmentUuid}
              fileSize={FIlESIZE}
            />
          </FormItem>
          <FormItem label={intl.get('ssrc.common.model.common.date').d('日期')}>
            {item.endTime && moment(item.endTime).format(DEFAULT_DATETIME_FORMAT)}
          </FormItem>
        </>
      )}
    </div>
  );
};

export default TaskExtItem;

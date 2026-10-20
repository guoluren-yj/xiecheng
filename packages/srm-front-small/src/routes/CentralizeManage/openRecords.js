import React from 'react';
import { Modal, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { RecordTimeLine } from '@/components/Record';
import OverflowTip from '@/components/OverflowTip';
import styles from './styles.less';

function operatorRender({ record }, templateName) {
  const {
    remarkList,
    operatorName,
    creationDate,
    // templateName,
    operationType,
    operationTypeMeaning,
  } = record.get([
    'remarkList',
    'operatorName',
    'templateName',
    'creationDate',
    'operationType',
    'operationTypeMeaning',
  ]);
  const actions = {
    CREATED: {
      icon: 'add',
    },
    DISABLED: {
      icon: 'not_interested',
      color: '#f56649',
    },
    ENABLED: {
      icon: 'finished',
      color: '#47b883',
    },
    UPDATED: {
      icon: 'mode_edit',
    },
    EXPIRED: {
      icon: 'cancel_presentation',
    },
    PUBLISH: {
      icon: 'publish2',
    },
    CHANGE: {
      icon: 'publish2',
    },
    CANCEL: {
      icon: 'cancel',
    },
    COPY: {
      icon: 'baseline-file_copy',
    },
    INVALID: {
      icon: 'cancel_presentation',
    },
  };

  const { icon = 'add', color } = actions[operationType] || {};

  const showRemark = ['UPDATED', 'CHANGE'].includes(operationType) && remarkList && remarkList.length > 0;

  const remarkListRender = () =>
    remarkList.map(m => (
      <OverflowTip className={styles['operate-remark']} lines={2}>
        {m}
      </OverflowTip>
    ));

  return {
    icon,
    color,
    time: creationDate,
    header: (
      <div className={styles['operate-action']}>
        <div className="action-wrapper">
          <span className="action-name">{operatorName}</span>
          <span className="action-type">{operationTypeMeaning}</span>
          <span className="action-destination">
            【<OverflowTip className="action-destination-text">{templateName}</OverflowTip>】
          </span>
        </div>
      </div>
    ),
    content: showRemark ? remarkListRender() : null,
  };
}

// 操作记录
export default function openRecords(record) {
  if (!record) return;
  const { templateId, templateName } = record.get(['templateId', 'templateName']);
  const ds = new DataSet({
    autoQuery: true,
    paging: false,
    transport: {
      read: {
        url: `/smct/v1/${getCurrentOrganizationId()}/centralized-historys`,
        method: 'GET',
        data: { templateId },
      },
    },
  });
  Modal.open({
    title: intl.get('small.common.model.operateRecord').d('操作记录'),
    mask: true,
    drawer: true,
    destroyOnClose: true,
    style: { width: 742 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: <RecordTimeLine dataSet={ds} renderer={v => operatorRender(v, templateName)} />,
  });
}

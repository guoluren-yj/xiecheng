import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import SettleBatchModal from './index';
import styles from './index.less';

export function handleViewBatchNum(props) {
  return Modal.open({
    title: intl.get(`ssta.common.view.title.settleDocBatch`).d('结算单批次'),
    size: 'large',
    drawer: true,
    key: Modal.key(),
    destroyOnClose: true,
    closable: true,
    className: styles['ssta-batch-modal'],
    children: (
      <SettleBatchModal {...props} />
    ),

  });
}

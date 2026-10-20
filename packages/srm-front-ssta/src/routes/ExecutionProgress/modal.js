import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import ExecutionProgress from './index';
import styles from './index.less';

export function handleViewTaskProgress(props) {
  return Modal.open({
    title: intl.get(`ssta.common.view.title.taskProgress`).d('任务进度'),
    size: 'large',
    drawer: true,
    key: Modal.key(),
    destroyOnClose: true,
    closable: true,
    className: styles['ssta-batch-modal'],
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    children: <ExecutionProgress {...props} />,
  });
}

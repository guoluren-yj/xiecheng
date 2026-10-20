import React from 'react';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import Container from './Container';
import styles from './index.less';
import { downloadAllFileNew, downloadAllScoreFileNew } from './service';

const downloadAll = (rfxHeaderId, store, others) => {
  const { sourceFrom } = others || {};
  const download = sourceFrom === 'score-rpt' ? downloadAllScoreFileNew : downloadAllFileNew;
  return download({
    rfxHeaderId,
    fileType: store.currentTab,
    permissionFilterFlag: store?.permissionFilterFlag || 0,
  }).then((res) => {
    return getResponse(res);
  });
};

const openC7nProcessAttachmentModal = ({ rfxHeaderId, permissionFilterFlag = 0, ...others }) => {
  const store = { currentTab: '', permissionFilterFlag };
  return () => {
    const modal = Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.common.button.open').d('过程附件下载'),
      children: <Container modal={modal} rfxHeaderId={rfxHeaderId} myStore={store} {...others} />,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      onOk: () => downloadAll(rfxHeaderId, store, others),
      okText: intl.get(`ssrc.common.model.common.downloadNew`).d('下载最新文档'),
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      className: styles['modal-body-wrapper'],
    });
  };
};

export { openC7nProcessAttachmentModal };

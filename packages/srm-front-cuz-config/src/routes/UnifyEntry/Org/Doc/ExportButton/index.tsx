import React from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';

import { FuncType } from 'choerodon-ui/pro/lib/button/enum';

import styles from './index.less';
import ExportModal from './ExportModal';

const ExportButton = () => {

  const openExportModal = () => {
    Modal.open({
      title: null,
      style: { width: '750px' },
      drawer: true,
      className: styles['export-modal'],
      children: <ExportModal />,
      footer: null,
    });
  };

  return (
    <Button
      funcType={FuncType.flat}
      icon="unarchive"
      onClick={openExportModal}
      style={{ height: '32px' }}
    >
      {intl.get('hzero.common.export').d('导出')}
    </Button>
  );
};

export default ExportButton;

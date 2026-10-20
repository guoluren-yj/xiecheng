import React, { useCallback } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';

import intl from 'hzero-front/lib/utils/intl';

import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import styles from './index.less';
import ImportModal from './ImportModal';

let modal;

export default function ImportDetailButton({ templateCode, docCode, loading }){

  const openImportModal = useCallback(() => {
    if (modal) {
      return;
    }
    modal = Modal.open({
      title: intl.get('hpfm.individual.view.title.viewHistory').d('查看导入历史'),
      style: { width: '1000px' },
      drawer: true,
      className: styles['import-modal'],
      bodyStyle: { padding: 0 },
      children: (
        <ImportModal templateCode={templateCode} docCode={docCode} isInDetail />
      ),
      footer: (
        <>
          {/* <Button>
            {intl.get('hpfm.individual.view.button.importDetailRecord').d('导出明细记录')}
          </Button> */}
          <Button onClick={handleCloseModal} color={ButtonColor.primary}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        </>
      ),
    });
  }, [templateCode, docCode]);

  const handleCloseModal = useCallback(() => {
    if (modal && modal.close) {
      modal.close();
      modal = null;
    }
  }, []);

  return (
    <Button style={{ height: '32px' }} onClick={openImportModal} funcType={FuncType.flat} loading={loading} icon="feed-o">
      {intl.get('hzero.common.componenets.import.title.viewhistory').d('查看导入记录')}
    </Button>
  );
};

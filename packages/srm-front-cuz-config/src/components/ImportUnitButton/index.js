import React, { useMemo } from 'react';
import { Button, Modal, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from './index.less';
import ImportModal from './ImportModal';

let modal;

const ImportButton = ({ groupCode, unitCode, unitType }) => {
  const isSearchBarUnit = useMemo(() => unitType === 'SEARCHBAR', [unitType]);

  const openImportModal = () => {
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
        <ImportModal groupCode={groupCode} unitCode={unitCode} isSearchBarUnit={isSearchBarUnit} />
      ),
      footer: (
        <>
          {/* <Button>
            {intl.get('hpfm.individual.view.button.importDetailRecord').d('导出明细记录')}
          </Button> */}
          <Button onClick={handleCloseModal} color="primary">
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        </>
      ),
    });
  };

  const handleCloseModal = () => {
    if (modal && modal.close) {
      modal.close();
      modal = null;
    }
  };

  return (
    <Button onClick={openImportModal} funcType="flat" icon="assignment">
      {intl.get('hzero.common.componenets.import.title.viewhistory').d('查看导入记录')}
    </Button>
  );
};

export default ImportButton;

import React, { useRef, useCallback, memo, useMemo } from 'react';
import { Dropdown, Menu, Modal, Button } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'srm-front-boot/lib/utils/intl';
import { Button as ButtonPermission } from 'components/Permission';

import HistoryDrawer from './HistoryDrawer';
import ImportModal from './ImportModal';

function ImportButton() {
  const importModal = useRef();

  const handleImport = useCallback(() => {
    importModal.current = Modal.open({
      title: intl.get('hzero.common.import').d('导入'),
      drawer: true,
      style: { width: '480px' },
      children: <ImportModal onClose={handleCloseImportModal} />,
      closable: true,
      footer: (_, cancelBtn) => (
        <>
          {cancelBtn}
          <Button onClick={handleOpenHistoryDrawer}>
            {intl.get('srm.common.view.button.viewImportRecord').d('查看导入记录')}
          </Button>
        </>
      ),
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
    });
  }, [handleOpenHistoryDrawer, handleCloseImportModal]);

  const handleOpenHistoryDrawer = useCallback(() => {
    Modal.open({
      title: intl.get('srm.common.view.button.viewImportRecord').d('查看导入记录'),
      drawer: true,
      style: { width: '1000px' },
      bodyStyle: { padding: 0 },
      children: <HistoryDrawer />,
      footer: (_, cancelBtn) => cancelBtn,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
    });
  }, []);

  const handleCloseImportModal = useCallback(() => {
    if (importModal.current && importModal.current.close) {
      importModal.current.close();
    }
  }, []);

  const menu = useMemo(() => {
    return (
      <Menu selectable={false}>
        <Menu.Item key="import" onClick={handleImport}>
          {intl.get('srm.common.view.button.importJsonFile').d('导入JSON文件')}
        </Menu.Item>
        <Menu.Item key="record" onClick={handleOpenHistoryDrawer}>
          {intl.get('srm.common.view.button.viewImportRecord').d('查看导入记录')}
        </Menu.Item>
      </Menu>
    );
  }, [handleImport, handleOpenHistoryDrawer]);

  return (
    <Dropdown overlay={menu}>
      <ButtonPermission
        type="c7n-pro"
        funcType={FuncType.flat}
        icon="archive"
        permissionList={[
          {
            code: 'hzero.wp.setup.service-definition.button.import',
            type: 'button',
          },
        ]}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          {intl.get('hzero.common.import').d('导入')}
          <Icon type="expand_more" style={{ marginLeft: '4px' }} />
        </span>
      </ButtonPermission>
    </Dropdown>
  );
}

export default formatterCollections({ code: ['srm.common'] })(memo(ImportButton));

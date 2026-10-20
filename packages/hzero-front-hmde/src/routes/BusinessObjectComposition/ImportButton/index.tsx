import React, { FC, useCallback, memo, useMemo } from 'react';
import { Dropdown, Button, Menu, Modal } from 'choerodon-ui/pro';
import { Upload, Icon } from 'choerodon-ui';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'srm-front-boot/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';

import { importModalDataJson } from '../../../services/businessObjectService';

import HistoryDrawer from './HistoryDrawer';

interface IImportButton {
  buttonProps?: { [propName: string]: any };
}

const ImportButton: FC<IImportButton> = ({
  buttonProps = {},
}) => {

  const handleImport = useCallback(file => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    importModalDataJson(formData).then(res => {
      if (getResponse(res)) {
        notification.success({
          message: intl.get('srm.common.view.message.ImportTaskSubmitted').d('导入任务已提交'),
        });
      }
    });
    return false;
  }, []);

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


  const menu = useMemo(() => {
    return (
      <Menu selectable={false}>
        <Menu.Item key='import'>
          <Upload
            accept=".json"
            beforeUpload={handleImport}
            showUploadList={false}
          >
            <span style={{ display: 'inline-block', padding: 0, fontWeight: 400 }}>
              {intl.get('srm.common.view.button.importJsonFile').d('导入JSON文件')}
            </span>
          </Upload>
        </Menu.Item>
        <Menu.Item key='record' onClick={handleOpenHistoryDrawer}>
          {intl.get('srm.common.view.button.viewImportRecord').d('查看导入记录')}
        </Menu.Item>
      </Menu>
    );
  }, [handleImport, handleOpenHistoryDrawer]);

  return (
    <Dropdown overlay={menu}>
      <Button {...buttonProps} funcType={FuncType.flat} icon='archive'>
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          {intl.get('hzero.common.import').d('导入')}
          <Icon type="expand_more" style={{ marginLeft: '4px' }} />
        </span>
      </Button>
    </Dropdown>
  );
};

export default formatterCollections({ code: ['srm.common'] })(memo(ImportButton));
import React, { useState } from 'react';
import { Button, Modal, Dropdown, Menu, Icon, Tooltip } from 'choerodon-ui/pro';
import { isString } from 'lodash';

import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import intl from 'utils/intl';
import notification from 'utils/notification';

import { exportUnitConfig, exportUnitConfigForExcel } from '@/services/customizeConfigService';
import { downloadFileByAxios } from '@/utils/file';
import { isJSON } from '@/utils/util';

import styles from './index.less';
import ExportModal from './ExportModal';

const MenuItem = Menu.Item;
let modal;
const tenantId = getCurrentOrganizationId();

const ExportButton = () => {
  const [loading, setLoading] = useState(false);

  const openExportModal = () => {
    modal = Modal.open({
      title: null,
      style: { width: '750px' },
      drawer: true,
      className: styles['export-modal'],
      children: <ExportModal closeModal={closeModal} onExport={handleExport} />,
      footer: null,
    });
  };

  const closeModal = () => {
    if (modal && modal.close) {
      modal.close();
    }
  };

  const handleExport = async unitCodes => {
    closeModal();
    setLoading(true);
    const res = await exportUnitConfig(unitCodes);
    if (res && isString(res)) {
      if (isJSON(res) && JSON.parse(res).failed) {
        notification.error({ description: JSON.parse(res).message });
        setLoading(false);
      } else {
        const api = `${HZERO_FILE}/v1/${tenantId}/files/download`;
        const queryParams = [
          { name: 'url', value: encodeURIComponent(res) },
          { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
        ];
        downloadFileByAxios({ requestUrl: api, queryParams })
          .then(resp => getResponse(resp))
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      notification.error();
      setLoading(false);
    }
  };

  const exportExcel = async() => {
    setLoading(true);
    const res = await exportUnitConfigForExcel();
    if (res && isString(res)) {
      if (isJSON(res) && JSON.parse(res).failed) {
        notification.error({ description: JSON.parse(res).message });
        setLoading(false);
      } else {
        const api = `${HZERO_FILE}/v1/${tenantId}/files/download`;
        const queryParams = [
          { name: 'url', value: encodeURIComponent(res) },
          { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
        ];
        downloadFileByAxios({ requestUrl: api, queryParams })
          .then(resp => getResponse(resp))
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      notification.error();
    }
    setLoading(false);
  };

  return (
    <Dropdown
      overlay={
        <Menu>
          <MenuItem key="import" className={styles['import-menu-item']} onClick={exportExcel}>
            {intl.get('hpfm.customize.common.exportForExcel').d('导出EXCEL文件')}
          </MenuItem>
          <MenuItem key="importHistory" onClick={openExportModal}>
            <Tooltip placement="left" title={intl.get('hpfm.customize.common.exportJsonTip1').d('如需跨环境同步个性化配置，请使用该JSON文件导出进行同步')}>
              {intl.get('hpfm.customize.common.exportForJson').d('导出JSON文件')}
            </Tooltip>
          </MenuItem>
        </Menu>
      }
      trigger={['click', 'hover']}
    >
      <Button
        funcType="flat"
        icon="unarchive"
        loading={loading}
        style={{ height: '32px' }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          {intl.get('hzero.common.export').d('导出')}
          <Icon type="expand_more" style={{ marginLeft: '4px' }} />
        </span>
      </Button>
    </Dropdown>
  );
};

export default ExportButton;

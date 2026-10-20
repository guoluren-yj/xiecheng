import React, { FC, useState, useCallback, memo, useRef, useMemo } from 'react';
import { Dropdown, Button, Menu, Modal, Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { HZERO_FILE } from 'hzero-front/lib/utils/config';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { isObject, isString } from 'lodash';
import intl from 'srm-front-boot/lib/utils/intl';

import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import { exportModalDataToExcel, exportModalDataToJson, exportTemplateDataToJson } from '@/services/businessObjectService';
import ExportModal from './ExportModal';
import styles from './index.less';

function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}

interface IExportButton {
  buttonProps?: { [propName: string]: any };
  data?: any[];
}

const ExportButton: FC<IExportButton> = ({
  buttonProps = {},
  data = [],
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const hasSelectedData = useMemo(() => data && data.length > 0, [data]);
  const exportModalRef = useRef<any>();

  const closeExportModal = () => {
    if (exportModalRef.current && exportModalRef.current.close) {
      exportModalRef.current.close();
    }
  };

  const handleExportTemplate = useCallback(async (params: { importTemplates: any[], exportTemplates: any[] }): Promise<boolean> => {
    const exprotResult = await exportTemplateDataToJson(params);
    if (exprotResult && isString(exprotResult)) {
      if (isJSON(exprotResult)) {
        const { failed, message } = JSON.parse(exprotResult);
        if (failed) {
          notification.error({ description: message });
        }
      } else {
        const downLoadResult = await downloadFileByAxios({
          requestUrl: `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`,
          queryParams: [
            { name: 'url', value: encodeURIComponent(exprotResult) },
            { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
          ],
          method: 'GET',
        });
        if (getResponse(downLoadResult)) {
          closeExportModal();
          return true;
        }
      }
    } else {
      notification.error({});
    }
    return false;
  }, []);

  const openDrawer = useCallback(() => {
    exportModalRef.current = Modal.open({
      title: null,
      drawer: true,
      style: { width: '1000px' },
      className: styles['export-modal'],
      children: (
        <ExportModal closeModal={closeExportModal} onExport={handleExportTemplate} />
      ),
      footer: null,
    });
  }, [handleExportTemplate]);

  const handleClick = useCallback(async ({ key }) => {
    if (key === 'exportToTemplateJSON') {
      openDrawer();
      return;
    }
    setLoading(true);
    const param = hasSelectedData ? data.map(i => i.get('businessObjectId')) : null;
    const res = key === 'exportToJSON' ? await exportModalDataToJson(param) : await exportModalDataToExcel();
    if (res && isString(res)) {
      if (isJSON(res) && JSON.parse(res).failed) {
        notification.error({ description: JSON.parse(res).message });
        setLoading(false);
      } else {
        downloadFileByAxios({
          requestUrl: `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`,
          queryParams: [
            { name: 'url', value: encodeURIComponent(res) },
            { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
          ],
          method: 'GET',
        })
          .then(resp => getResponse(resp))
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      notification.error({});
      setLoading(false);
    }
  }, [data, openDrawer, hasSelectedData]);

  const menu = useMemo(() => {
    if (loading) {
      return;
    }
    return (
      <Menu onClick={handleClick}>
        <Menu.Item key='exportToJSON'>
          {hasSelectedData ?
            intl.get('srm.common.exportSelected.toJSON').d('导出勾选JSON文件')
            : intl.get('srm.common.exportAll.toJSON').d('导出全量JSON文件')}
          <Tooltip title={intl.get('srm.common.exportSelected.toJSON.help').d('仅导出业务对象、组合业务对象租户级配置数据JSON格式文件，不包含导入导出模板配置数据')}>
            <Icon type='help_outline' style={{ marginLeft: '2px', fontSize: '14px' }} />
          </Tooltip>
        </Menu.Item>
        <Menu.Item key='exportToEXCEL'>
          {intl.get('srm.common.exportAll.toEXCEL').d('导出全量EXCEL文件')}
          <Tooltip title={intl.get('srm.common.exportAll.toEXCEL.help').d('仅导出业务对象、组合业务对象租户级配置数据JSON格式文件，不包含导入导出模板配置数据')}>
            <Icon type='help_outline' style={{ marginLeft: '2px', fontSize: '14px' }} />
          </Tooltip>
        </Menu.Item>
        <Menu.Item key='exportToTemplateJSON'>
          {intl.get('srm.common.exportAll.exportToTemplateJSON').d('导出模板JSON文件')}
        </Menu.Item>
      </Menu>
    );
  }, [loading, hasSelectedData, handleClick]);

  return (
    <Dropdown overlay={menu}>
      <Button {...buttonProps} funcType={FuncType.flat} icon='archive' loading={loading}>
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          {intl.get('hzero.common.export').d('导出')}
          {/* {hasSelectedData ?
            intl.get('hzero.common.button.exportSelect').d('勾选导出')
            : intl.get('hzero.common.export').d('导出')
          } */}
          <Icon type="expand_more" style={{ marginLeft: '4px' }} />
        </span>
      </Button>
    </Dropdown>
  );
};

export default formatterCollections({ code: ['srm.common'] })(memo(ExportButton));
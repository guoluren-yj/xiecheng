import React, { useCallback, memo, useRef } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { HZERO_FILE } from 'hzero-front/lib/utils/config';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { isString } from 'lodash';
import intl from 'srm-front-boot/lib/utils/intl';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';

import { exportReportDataToJson } from '../../../services/printTemplateService';
import ExportModal from './ExportModal';
import styles from './index.less';
import { isJSON } from '../../../utils/utils';

function ExportButton() {
  const modalRef: any = useRef();

  const handleExport = useCallback(async (param: string[] | number[] = []): Promise<boolean> => {
    const exprotResult = await exportReportDataToJson(param);
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
          return true;
        }
      }
    } else {
      notification.error({});
    }
    return false;
  }, []);

  const handleCloseModal = useCallback(() => {
    if (modalRef.current && modalRef.current.close) {
      modalRef.current.close();
    }
  }, []);

  const handleOpenModal = useCallback(() => {
    modalRef.current = Modal.open({
      title: null,
      footer: null,
      drawer: true,
      className: styles['export-modal'],
      style: { width: '750px' },
      children: <ExportModal closeModal={handleCloseModal} onExport={handleExport} />
    })
  }, [handleCloseModal, handleExport]);

  return (
    <Button funcType={FuncType.flat} icon='archive' onClick={handleOpenModal}>
      {intl.get('hzero.common.export').d('导出')}
    </Button>
  );
};

export default formatterCollections({ code: ['srm.common'] })(memo(ExportButton));
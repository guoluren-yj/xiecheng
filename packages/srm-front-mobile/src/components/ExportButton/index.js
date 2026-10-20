import React, { useState } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { exportUnitConfig } from '@/services/checkRuleService';
import { isJSON } from '@/utils/utils';

import styles from './index.less';
import ExportModal from './ExportModal';

let modal;

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

  /**
   * 真正调用导出接口
   * @param {{ documents: Array<{ documentId:number, categoryIds:number[] }> }} payload
   */
  const handleExport = async (payload) => {
    closeModal();
    setLoading(true);
    const res = await exportUnitConfig(payload);

    const { data, headers } = res;

    if (data && Object.keys(data).length > 0) {
      if (isJSON(data) && JSON.parse(data)?.failed) {
        notification.error({ description: JSON.parse(data)?.message });
        setLoading(false);
      } else {
        const blob = new Blob([data], { type: 'application/octet-stream' });

        let fileName = '';

        const temp = !headers['content-disposition']
          ? undefined
          : headers['content-disposition'].match(/[fF][iI][Ll][Ee][Nn][Aa][Mm][Ee]=(.*)/)[1];
        fileName = temp;
        if (fileName && (fileName[0] === "'" || fileName[0] === '"')) {
          fileName = fileName.substring(1, fileName.length - 1);
        }

        if (!fileName) {
          throw Error('cannot get fileName!');
        }

        if (window.navigator && typeof window.navigator.msSaveBlob !== 'undefined') {
          window.navigator.msSaveBlob(blob, decodeURI(fileName));
        } else {
          const blobURL = window.URL.createObjectURL(blob);
          const tempLink = document.createElement('a');
          tempLink.style.display = 'none';
          tempLink.href = blobURL;
          tempLink.setAttribute('download', decodeURI(fileName));
          if (typeof tempLink.download === 'undefined') {
            tempLink.setAttribute('target', '_blank');
          }
          document.body.appendChild(tempLink);
          tempLink.click();
          document.body.removeChild(tempLink);
          window.URL.revokeObjectURL(blobURL);
        }

        setLoading(false);
      }
    } else {
      notification.error();
      setLoading(false);
    }
  };

  return (
    <Button
      funcType="flat"
      icon="unarchive"
      loading={loading}
      style={{ height: '32px' }}
      onClick={openExportModal}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {intl.get('hzero.common.export').d('导出')}
      </span>
    </Button>
  );
};

export default ExportButton;

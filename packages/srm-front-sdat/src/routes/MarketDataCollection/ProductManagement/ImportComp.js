import React, { useState } from 'react';
import intl from 'utils/intl';
import { Button } from 'choerodon-ui/pro';
import { Upload, Alert } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { ReactComponent as UploadComp } from '@/assets/product-collection-upload.svg';
import { fetchUploadFile } from '@/services/marketCollection/productManageService';

import styles from './index.less';

const { Dragger } = Upload;

const ImportComp = ({ record, handleClose }) => {
  const rowData = record?.toData() ?? {};

  const [fileList, setFileList] = useState([]);

  const beforeUpload = file => {
    const fileSize = 5; // 限制不超过5MB
    if (file.size > fileSize * 1024 * 1024) {
      file.status = 'error';
      const res = {
        message: intl
          .get('hzero.common.upload.error.size', {
            fileSize,
          })
          .d(`上传文件大小不能超过: ${fileSize} MB`),
      };
      file.response = res;
      return false;
    }

    setFileList([file]);
    return false;
  };

  const handleRemoveFile = () => {
    setFileList([]);
  };

  const uploadProps = {
    name: 'file',
    accept: ['.jpeg', '.jpg', '.png', '.pdf', '.xls', '.xlsx'],
    action: '',
    onRemove: handleRemoveFile,
    beforeUpload: e => beforeUpload(e, record),
    showFileSize: true,
    fileList,
  };

  const handleOk = () => {
    if (fileList.length > 0) {
      // 处理上传文件
      const formData = new FormData();
      formData.append('file', fileList[0]);
      formData.append('fileName', fileList[0].name);

      fetchUploadFile({
        formData,
        commodityCode: rowData.commodityCode,
        tenantCommodityId: rowData.tenantCommodityId,
      }).then(res => {
        if (getResponse(res)) {
          notification.success();
          handleClose();
        } else {
          return false;
        }
      });
    } else {
      fetchUploadFile({
        formData: null,
        commodityCode: rowData.commodityCode,
        tenantCommodityId: rowData.tenantCommodityId,
      }).then(res => {
        if (getResponse(res)) {
          notification.success();
          handleClose();
        } else {
          return false;
        }
      });
    }
  };

  return (
    <>
      <div className={styles['price-modal-form']} style={{ height: 'calc(100vh - 120px)' }}>
        <Alert
          style={{ margin: '4px' }}
          message={intl
            .get('sdat.productManagement.view.message.importTip')
            .d(
              '对于自定义商品支持导入数据，导入数据时，可以上传相应数据文件支持jpeg/jpg/png/pdf/excel格式，建议单个附件不超过5M'
            )}
          showIcon
          iconType="help"
        />
        <div className={styles['upload-container']}>
          <Dragger {...uploadProps} style={{ height: '210px' }}>
            <p className="c7n-upload-drag-icon">
              <UploadComp />
            </p>
            <p className="c7n-upload-text">
              {intl
                .get('sdat.productManagement.view.message.uploadFileTip')
                .d('拖拽或点击此处选择文件')}
            </p>
            <p className="c7n-upload-hint">{fileList.length}/1</p>
          </Dragger>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #e5e5e5', padding: '16px 20px' }}>
        <Button color="primary" onClick={handleOk}>
          {intl.get('hzero.common.btn.ok').d('确定')}
        </Button>
        <Button onClick={handleClose}>{intl.get('hzero.common.btn.cancel').d('取消')}</Button>
      </div>
    </>
  );
};

export default ImportComp;

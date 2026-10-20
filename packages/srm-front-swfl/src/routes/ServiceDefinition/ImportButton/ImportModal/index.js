import React, { useState } from 'react';
import { Button } from 'choerodon-ui/pro';
import { Upload, notification as C7nNotification } from 'choerodon-ui';
import notification from 'hzero-front/lib/utils/notification';
import intl from 'srm-front-boot/lib/utils/intl';
import { getResponse } from 'utils/utils';
import { ReactComponent as UploadFileSvg } from '@/assets/upload_file.svg';
import { ReactComponent as JsonFileSvg } from '@/assets/json_file.svg';
import { importDataToJson } from '@/services/serviceDefinitionService';

import styles from './index.less';

const { Dragger } = Upload;
// const { Dragger } = Attachment;
const UPLOAD_STATUS = {
  initial: 'initial', // 初始
  ready: 'ready', // 准备上传
  uploading: 'uploading', // 上传中
  done: 'done', // 上传结束
};

const ImportModal = () => {
  const [state, setState] = useState({
    uploadStatus: UPLOAD_STATUS.initial,
    uploadPercent: 0,
    uploadFile: undefined,
  });

  const updateState = (newState) => {
    setState((prevState) => ({
      ...prevState,
      ...newState,
    }));
  };

  const handleBeforeUpload = (file) => {
    const isLimit = file.size < 1000 * 1024 * 1024;
    if (!isLimit) {
      notification.error({
        message: intl
          .get('hzero.common.components.import.title.fileSize', { size: 1000 })
          .d(`只支持小于${1000}MB的文件！`),
      });
    } else {
      updateState({
        uploadFile: file,
        uploadStatus: UPLOAD_STATUS.ready,
      });
    }
    return isLimit;
  };

  const handleReUpload = () => {
    updateState({
      uploadStatus: UPLOAD_STATUS.initial,
      uploadFile: undefined,
    });
  };

  const handleImport = async () => {
    const formData = new FormData();
    formData.append('file', state.uploadFile, state.uploadFile ? state.uploadFile.name : '');
    updateState({
      uploadStatus: UPLOAD_STATUS.uploading,
    });
    const res = await importDataToJson(formData);
    handleReUpload();
    if (getResponse(res) && res) {
      const total = res.importCount || 0;
      const success = res.importSuccessCount || 0;
      const failed = total - success;
      C7nNotification.open({
        message: intl.get('srm.common.improt.serviceDefinition.complete').d('导入完成'),
        description: intl
          .get('srm.common.import.serviceDefinition.result', {
            total,
            success,
            failed,
          })
          .d(
            `共导入${total}个服务定义，其中${success}个成功,${failed}个失败，请打开导入记录查看详情。`
          ),
      });
    }
    // onClose();
  };

  const renderUploaderContent = () => {
    switch (state.uploadStatus) {
      case UPLOAD_STATUS.initial: {
        return (
          <Dragger
            multiple={false}
            accept={['.json']}
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
          >
            <div>
              <div className={styles['import-upload-pic']}>
                <UploadFileSvg />
              </div>
              <div className={styles['import-upload-text']}>
                {intl
                  .get('hzero.common.components.import.message.drag')
                  .d('拖拽或点击此处选择文件')}
              </div>
              <div className={styles['import-upload-text']} style={{ paddingBottom: '24px' }}>
                0/1
              </div>
            </div>
          </Dragger>
        );
      }
      case UPLOAD_STATUS.uploading:
      case UPLOAD_STATUS.ready: {
        return (
          <div className={styles['import-upload-complete']}>
            <div className={styles['import-upload-complete-pic']}>
              <JsonFileSvg />
            </div>
            <div className={styles['import-upload-complete-filename']}>
              {state.uploadFile ? state.uploadFile.name : ''}
            </div>
            <div className={styles['import-upload-complete-button']}>
              <Button color="primary" onClick={handleImport}>
                {intl.get('hzero.common.components.import.dataImport').d('数据导入')}
              </Button>
              <Button
                onClick={handleReUpload}
                disabled={state.uploadStatus === UPLOAD_STATUS.uploading}
              >
                {intl.get('hzero.common.components.import.reUpload').d('重新上传')}
              </Button>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className={styles['import-content']}>
      <div className={styles['import-title']}>
        {intl
          .get('srm.common.view.title.importServicesDefinitionJSON')
          .d('导入服务定义对应的JSON文件')}
      </div>
      <div className={styles['import-uploader']}>{renderUploaderContent()}</div>
      <div className={styles['import-desc']}>
        <div>{intl.get('srm.common.view.title.import.description').d('导入说明')}</div>
        <div>
          1.
          {intl
            .get('srm.common.view.title.import.description.tip1')
            .d('服务定义导入支持新增，不支持更新与删除。')}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;

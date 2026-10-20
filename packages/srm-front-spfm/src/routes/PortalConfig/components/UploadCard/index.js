/**
 * UploadCard - url附件卡片上传或预览
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, {useState, useEffect } from 'react';
import { Icon, Modal, notification } from 'choerodon-ui/pro';
import { Upload } from 'choerodon-ui';
import { HZERO_FILE } from 'utils/config';
import { isEmpty } from 'lodash';
import {
  getAccessToken,
  getResponse,
  getAttachmentUrl,
  getCurrentOrganizationId,
  getPlatformVersionApi,
} from 'utils/utils';
import intl from 'utils/intl';
import { PUBLIC_BUCKET } from '_utils/config';
import classnames from 'classnames';

import styles from './index.less';

const bucketDirectory = 'spfm-templates-config';
const tenantId = getCurrentOrganizationId();

const UploadCard = ({
  fileSize = 50 * 1024 * 1024,
  onUploadSuccess = () => {},
  onUploadRemove = () => {},
  label = intl.get(`hzero.common.title.uploadImage`).d('上传图片'),
  accept = 'image/jpeg,image/jpg,image/png,svg,ico',
  fileUrl = '',
  fileName = '',
  viewInModal = false,
  requiredFlag = false,
}) => {
  const [uploadList, setUploadList] = useState([]);
  const [filePath, setFilePath] = useState('');
  useEffect(() => {
    if (fileUrl) {
      const fileNameOfUrl = handleFileName(fileUrl);
      const newFileName = fileNameOfUrl || fileName;
      const attachmentUrl = getAttachmentUrl(fileUrl, PUBLIC_BUCKET, tenantId, bucketDirectory);
      const url = `${attachmentUrl}`;
      const list = [
        {
          uid: newFileName,
          name: newFileName,
          response: fileUrl,
          status: 'done',
          url,
        },
      ];
      setUploadList(list);
      setFilePath(url);
    }
  }, [fileUrl]);

  const uploadData = file => {
    return {
      bucketName: PUBLIC_BUCKET,
      directory: bucketDirectory,
      fileName: file.name,
    };
  };

  const beforeUpload = file => {
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      notification.error({
        placement: 'bottomRight',
        message: intl
          .get(`hzero.common.upload.error.size`, {
            fileSize: `${fileSize / (1024 * 1024)}`,
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      });
      return false;
    }
    return true;
  };

  const handlePreview = () => {
    const { url = '' } = (uploadList || [])[0];
    Modal.preview({
      list: [url],
    });
  };

  const handleChange = ({ file }) => {
    const { status } = file || {};
    if (status === 'error') {
      setUploadList([]);
    } else {
      setUploadList([{ ...file }]);
    }
  };

  // 处理附件名字
  const handleFileName = url => {
    if (!url) {
      return '';
    }
    const temp = url.split('/');
    if (!isEmpty(temp)) {
      const fileFullName = temp[temp.length - 1];
      const index = fileFullName.indexOf('@');
      if (index !== -1) {
        const finallFileName = fileFullName.substring(index + 1);
        return finallFileName;
      } else {
        return '';
      }
    } else {
      return '';
    }
  };

  // 上传成功
  const onSuccess = (response, file) => {
    if (getResponse(response)) {
      onUploadSuccess(response, file);
    } else {
      onUploadSuccess('');
      setUploadList([]);
    }
  };

  const accessToken = getAccessToken();
  const headers = {};
  if (accessToken) {
    headers.Authorization = `bearer ${accessToken}`;
  }

  const uploadButton = (
    <div>
      <Icon type="add" style={{ color: 'rgba(0,0,0,0.25)', fontSize: 28 }} />
      <div className="c7n-upload-text">{label}</div>
    </div>
  );

  return (
    <div className={styles["upload-card"]}>
      <Upload
        className={classnames(styles['c7n-upload-url'], {
        [styles['upload-card-url-required']]: requiredFlag,
      })}
        name="file"
        accept={accept}
        data={uploadData}
        headers={headers}
        onSuccess={onSuccess}
        showUploadList={false}
        listType="picture-card"
        onChange={handleChange}
        beforeUpload={beforeUpload}
        onPreview={() => handlePreview(headers.Authorization)}
        action={`${HZERO_FILE}/v1/${getPlatformVersionApi('files/multipart')}`}
      >
        {uploadButton}
      </Upload>
      {filePath && (
      <div
        className={classnames(
            styles['upload-img-style'],
            viewInModal ? styles['view-img-model'] : styles['view-img-no-model']
          )}
      >
        <img src={filePath} alt="" />
        <div className={styles['img-btn']}>
          <a onClick={() => handlePreview(headers.Authorization)}>
            <Icon type="visibility-o" style={{cursor: "pointer"}} />
          </a>
          <Icon
            type="delete"
            style={{cursor: "pointer"}}
            onClick={() =>onUploadRemove()}
          />
        </div>
      </div>
      )}
    </div>
  );
};

export default UploadCard;

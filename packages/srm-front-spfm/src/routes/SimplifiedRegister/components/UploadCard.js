/**
 * UploadCard - url附件
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useState, useEffect } from 'react';
import { Icon, Modal, notification } from 'choerodon-ui/pro';
import { Upload, Spin } from 'choerodon-ui';
import { HZERO_FILE } from 'utils/config';
import { isEmpty, isString } from 'lodash';
import {
  getAccessToken,
  getResponse,
  getAttachmentUrl,
  getCurrentOrganizationId,
} from 'utils/utils';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import classnames from 'classnames';
import { removeUploadFile } from 'services/api';

import uploadPdf from '@/assets/icon-register-upload-pdf.svg';

import { FILE_BUCKET_DIRECTORY } from '../utils';
import styles from '../index.less';

const bucketDirectory = FILE_BUCKET_DIRECTORY;
const tenantId = getCurrentOrganizationId();

const UploadCard = ({
  fileSize = 50 * 1024 * 1024,
  onUploadSuccess = () => {},
  onUploadRemove = () => {},
  label = intl.get(`hzero.common.title.uploadImage`).d('上传图片'),
  accept = 'image/jpeg,image/jpg,image/png',
  viewOnly = false,
  fileUrl = '',
  fileName = '',
  viewInModal = false,
  enableImageWatermark = 0, // 是否开启图片水印
}) => {
  const [uploadList, setUploadList] = useState([]);
  const [filePath, setFilePath] = useState('');
  const [spin, setSpin] = useState(false);
  useEffect(() => {
    if (fileUrl) {
      const fileNameOfUrl = handleFileName(fileUrl);
      const newFileName = fileNameOfUrl || fileName;
      const attachmentUrl = getAttachmentUrl(fileUrl, PRIVATE_BUCKET, tenantId, bucketDirectory);
      let url = `${attachmentUrl}&enableImageWatermark=${enableImageWatermark}`;
      if (/.(pdf)$/i.test(newFileName)) {
        url = uploadPdf;
      }
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
    } else {
      setUploadList([]);
    }
  }, [fileUrl]);

  const uploadData = (file) => {
    return {
      bucketName: PRIVATE_BUCKET,
      directory: bucketDirectory,
      fileName: file.name,
      enableImageWatermark,
    };
  };

  const beforeUpload = (file) => {
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
    if (accept && accept.indexOf(file.type) === -1) {
      file.status = 'error'; // eslint-disable-line
      const fileTypeList = accept.split(',').map((n) => {
        const index = n.indexOf('/');
        const type = n.substring(index);
        return type.replace('/', '.');
      });
      const fileType = fileTypeList.join(',');
      notification.error({
        placement: 'bottomRight',
        message: intl
          .get('hzero.common.upload.error.type', {
            fileType,
          })
          .d(`上传文件类型必须是：${fileType}`),
      });
      return false;
    }
    return true;
  };

  const handlePreview = (token) => {
    const { response = '', url = '', name } = (uploadList || [])[0];
    if (/.(pdf)$/i.test(name)) {
      window.open(
        `${HZERO_FILE}/v1/file-preview/by-url?url=${encodeURIComponent(
          response
        )}&bucketName=${PRIVATE_BUCKET}&access_token=${token}`
      );
    } else {
      Modal.preview({
        list: [url],
      });
    }
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
  const handleFileName = (url) => {
    if (!url || !isString(url)) {
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
    onUploadSuccess(response, file);
  };

  // 删除文件回调函数
  const onRemove = (file = {}) => {
    const payload = {
      bucketName: PRIVATE_BUCKET,
      urls: [],
    };
    if (file.response) {
      payload.urls = [file.response];
    } else {
      payload.urls = [fileUrl];
    }
    setSpin(true);
    removeUploadFile(payload)
      .then((res) => {
        if (getResponse(res)) {
          onUploadRemove();
          setUploadList([]);
          notification.success({
            placement: 'bottomRight',
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          });
        }
      })
      .finally(() => {
        setSpin(false);
      });
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

  // 附件未上传显示上传附件组件问题
  const hiddenFileFlag = viewOnly && isEmpty(uploadList);
  return !fileUrl ? (
    <Upload
      className={styles['upload-file-picture-card']}
      action={`${HZERO_FILE}/v1/files/multipart`}
      accept={accept}
      listType="picture-card"
      // fileList={uploadList}
      data={uploadData}
      headers={headers}
      name="file"
      beforeUpload={beforeUpload}
      onPreview={() => handlePreview(headers.Authorization)}
      onChange={handleChange}
      onSuccess={onSuccess}
      // onRemove={onRemove}
      showUploadList={{
        showRemoveIcon: !viewOnly,
      }}
    >
      {hiddenFileFlag ? null : uploadList.length >= 1 ? null : uploadButton}
    </Upload>
  ) : (
    <Spin spinning={spin}>
      <div
        className={classnames(
          styles['upload-img-style'],
          viewInModal ? styles['view-img-model'] : styles['view-img-no-model']
        )}
      >
        <img src={filePath} alt="" />
        <div className={styles['img-btn']}>
          <a onClick={() => handlePreview(headers.Authorization)}>
            <Icon type="visibility-o" />
          </a>
          {!viewOnly && (
            <Icon
              type="delete"
              onClick={() => {
                onRemove();
              }}
            />
          )}
        </div>
      </div>
    </Spin>
  );
};

export default UploadCard;

/**
 * UrlUpload - url附件卡片上传或预览
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import uuid from 'uuid/v4';
import { isEmpty } from 'lodash';
import { Upload, Divider } from 'choerodon-ui';
import React, { useState, useEffect, Fragment } from 'react';
import { Icon, Modal, notification } from 'choerodon-ui/pro';
import classnames from 'classnames';

import {
  getAccessToken,
  getResponse,
  getAttachmentUrl,
  getCurrentOrganizationId,
} from 'utils/utils';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { PRIVATE_BUCKET } from '_utils/config';
import { removeUploadFile } from 'services/api';

import styles from './index.less';

const bucketDirectory = 'spfm-comp';
const tenantId = getCurrentOrganizationId();

const UrlUpload = ({
  isEdit,
  viewOnly = false,
  help = '',
  label = '',
  fileUrl = '',
  newLine = false,
  enableImageWatermark = 0, // 是否开启图片水印
  fileSize = 50 * 1024 * 1024,
  onUploadSuccess = () => {},
  onUploadRemove = () => {},
  accept = 'image/jpeg,image/jpg,image/png,application/pdf',
  required = false,
}) => {
  const [uploadList, setUploadList] = useState([]);

  // 总不可编辑标识
  const readOnly = !isEdit || viewOnly;

  useEffect(() => {
    if (fileUrl) {
      const fileNameOfUrl = handleFileName(fileUrl);
      const newFileName = fileNameOfUrl;
      const attachmentUrl = getAttachmentUrl(fileUrl, PRIVATE_BUCKET, tenantId, bucketDirectory);
      const url = `${attachmentUrl}&enableImageWatermark=${enableImageWatermark}`;
      const list = [
        {
          uid: newFileName || uuid(),
          name: newFileName,
          response: fileUrl,
          status: 'done',
          url,
        },
      ];
      setUploadList(list);
    } else {
      setUploadList([]);
    }
  }, [fileUrl]);

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

  // 预览
  const handlePreview = (token) => {
    if (isEmpty(uploadList)) {
      return;
    }
    const { response = '', url = '', name } = (uploadList || [])[0];
    if (/.(pdf)$/i.test(name)) {
      window.open(
        `${HZERO_FILE}/v1/${tenantId}/file-preview/by-url?url=${encodeURIComponent(
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
      const attachmentUrl = getAttachmentUrl(
        file.response,
        PRIVATE_BUCKET,
        tenantId,
        bucketDirectory
      );
      const url = `${attachmentUrl}&enableImageWatermark=${enableImageWatermark}`;
      setUploadList([{ ...file, url }]);
    }
  };

  // 处理附件名字
  const handleFileName = (url) => {
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
  const onSuccess = (response) => {
    if (getResponse(response)) {
      notification.success({
        placement: 'bottomRight',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      onUploadSuccess(response);
    } else {
      onUploadSuccess('');
      setUploadList([]);
    }
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
    removeUploadFile(payload).then((res) => {
      if (getResponse(res)) {
        onUploadRemove();
        setUploadList([]);
        notification.success({
          placement: 'bottomRight',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
      }
    });
  };

  const uploadData = (file) => {
    return {
      bucketName: PRIVATE_BUCKET,
      directory: bucketDirectory,
      fileName: file.name,
      enableImageWatermark,
    };
  };

  const accessToken = getAccessToken();
  const headers = {};
  if (accessToken) {
    headers.Authorization = `bearer ${accessToken}`;
  }

  return (
    <Fragment>
      {isEdit && (
        <span>
          <span
            className={classnames({
              [styles['sslm-c7n-url-upload-required']]: required,
            })}
          >
            {label}
          </span>
          <Divider type="vertical" hidden={viewOnly} />
        </span>
      )}
      <Upload
        newLine={newLine}
        action={`${HZERO_FILE}/v1/${tenantId}/files/multipart`}
        accept={accept}
        listType="picture"
        data={uploadData}
        headers={headers}
        name="file"
        beforeUpload={beforeUpload}
        onPreview={() => handlePreview(headers.Authorization)}
        onChange={handleChange}
        onSuccess={onSuccess}
        fileList={uploadList}
        onRemove={onRemove}
        showUploadList={{
          showRemoveIcon: !readOnly,
        }}
      >
        {!readOnly && (
          <a
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icon type="file_upload" style={{ fontSize: 14, marginRight: 5 }} />
            {isEdit
              ? intl.get('hzero.common.upload.text').d('上传附件')
              : intl.get('hzero.common.upload.view').d('查看附件')}
          </a>
        )}
      </Upload>
      {/* 查看页面无数据时显示"-" */}
      {isEmpty(uploadList) && readOnly && '-'}
      {!readOnly && <div className={styles['sslm-c7n-url-upload']}>{help}</div>}
    </Fragment>
  );
};

export default UrlUpload;

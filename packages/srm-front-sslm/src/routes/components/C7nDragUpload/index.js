/**
 * C7nDragUpload - c7n拖拽上传
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useState } from 'react';
import { isString } from 'lodash';
import { Upload, Icon } from 'hzero-ui';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import { removeUploadFile } from 'services/api';
import { getResponse, getAccessToken, getCurrentOrganizationId } from 'utils/utils';

const { Dragger } = Upload;
const organizationId = getCurrentOrganizationId();

// 附件上传
const C7nDragUpload = (props = {}) => {
  const [fileList, setFileList] = useState([]);

  if (props.modal) {
    props.modal.handleOk(() => {
      props.onOk(fileList);
    });
  }

  /**
   * 附件配置
   * @param {object} file
   */
  const uploadData = (file) => {
    return {
      bucketName: PRIVATE_BUCKET,
      directory: 'sslm-common',
      fileName: file.name,
    };
  };

  /**
   * 上传前的校验
   * @param {*} file
   */
  const beforeUpload = (file) => {
    const { fileSize = 50 * 1024 * 1024 } = props;
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line

      const res = {
        message: intl
          .get(`hzero.common.upload.error.size`, {
            fileSize: `${fileSize / (1024 * 1024)}`,
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    return true;
  };

  /**
   * 上传change触发事件
   * @param {Object} info - 上传的文件
   */
  const onDraggerUploadChange = (info) => {
    const { status, response } = info.file;
    if (status === 'done') {
      if (isString(response)) {
        notification.success();
        setFileList([...fileList, info.file]);
      } else {
        notification.error();
      }
    } else if (status === 'error') {
      notification.error(response);
    }
  };

  /**
   * 删除文件回调函数
   * @param {*} file
   */
  const onDraggerUploadRemove = (file) => {
    if (isString(file.response)) {
      const payload = {
        organizationId,
        bucketName: PRIVATE_BUCKET,
        directory: 'sslm-common',
        urls: [file.response],
      };
      removeUploadFile(payload).then((response) => {
        const res = getResponse(response);
        if (res) {
          const newList = fileList.filter((o) => o.uid !== file.uid);
          setFileList(newList);
          notification.success();
        }
      });
    }
  };

  const accessToken = getAccessToken();
  const headers = {};
  if (accessToken) {
    headers.Authorization = `bearer ${accessToken}`;
  }
  const draggerUploadProps = {
    name: 'file',
    multiple: true,
    // accept: 'image/*',
    data: uploadData,
    headers,
    action: `${HZERO_FILE}/v1/${organizationId}/files/multipart`,
    beforeUpload,
    onChange: onDraggerUploadChange,
    onRemove: onDraggerUploadRemove,
  };
  return (
    <Dragger {...draggerUploadProps}>
      <p className="ant-upload-drag-icon">
        <Icon type="inbox" />
      </p>
      <p className="ant-upload-text">
        {intl
          .get(`sslm.common.view.message.uploadMessage`)
          .d('单击或拖动附件(50MB以下)到此区域进行上传')}
      </p>
      <p className="ant-upload-hint">
        {intl.get(`hzero.common.upload.hint`).d('支持单个或批量上传')}
      </p>
    </Dragger>
  );
};

export default C7nDragUpload;

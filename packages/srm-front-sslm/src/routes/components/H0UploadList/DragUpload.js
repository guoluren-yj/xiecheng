/*
 * @Date: 2021-11-17 11:20:22
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, { useState } from 'react';
import { isString } from 'lodash';
import { Upload, Icon, Modal } from 'hzero-ui';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { removeUploadFile } from 'services/api';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId, getAccessToken } from 'utils/utils';

const { Dragger } = Upload;
const organizationId = getCurrentOrganizationId();
const accessToken = getAccessToken();

const DragUpload = ({ visible, onOk, onCancel, fileSize = 50 * 1024 * 1024 }) => {
  const [fileList, setFileList] = useState([]);

  // 上传前的校验
  const beforeUpload = (file) => {
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

  // 上传change触发事件
  const onDraggerUploadChange = (info) => {
    const { status, response } = info.file;
    if (status === 'done') {
      if (isString(response)) {
        notification.success();
        setFileList((prevState) => [...prevState, info.file]);
      } else {
        notification.error();
      }
    } else if (status === 'error') {
      notification.error(response);
    }
  };

  // 删除文件回调函数
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

  // 附件上传确认按钮回调
  const hanldeOnOk = () => {
    onCancel();
    onOk(fileList);
    setFileList([]);
  };

  // 附件配置
  const uploadData = (file) => {
    return {
      bucketName: PRIVATE_BUCKET,
      directory: 'sslm-supplyAbility',
      fileName: file.name,
    };
  };

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
    <Modal
      title={intl.get('hzero.common.upload.text').d('上传附件')}
      visible={visible}
      onOk={hanldeOnOk}
      onCancel={onCancel}
      destroyOnClose
      width={520}
    >
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
    </Modal>
  );
};

export default DragUpload;

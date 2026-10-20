/*
 * @Date: 2023-10-31 11:14:27
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Upload } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { isString } from 'lodash';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import { getAccessToken, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const Index = ({ onOk, setLoading }) => {
  const onDraggerUploadChange = info => {
    const { status, response } = info.file;
    if (status === 'done') {
      if (isString(response)) {
        notification.success();
        onOk(info.file);
      } else {
        notification.error();
      }
    } else if (status === 'error') {
      notification.error(response);
    }
  };

  const beforeUpload = file => {
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

  const uploadData = file => {
    return {
      bucketName: PRIVATE_BUCKET,
      directory: 'sslm-common',
      fileName: file.name,
    };
  };

  const accessToken = getAccessToken();
  const headers = {};
  if (accessToken) {
    headers.Authorization = `bearer ${accessToken}`;
  }

  const props = {
    name: 'file',
    headers,
    multiple: true,
    data: uploadData,
    showUploadList: false,
    action: `${HZERO_FILE}/v1/${organizationId}/files/multipart`,
    beforeUpload,
    onChange: onDraggerUploadChange,
    onStart: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
    },
  };

  return (
    <Upload {...props}>
      <Button icon="playlist_add" funcType="flat">
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>
    </Upload>
  );
};

export default Index;

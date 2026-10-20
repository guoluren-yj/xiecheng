/**
 * FileCardByUuid - uuid附件
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useState, useEffect } from 'react';
import { Icon, Modal, notification, Attachment } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { HZERO_FILE } from 'utils/config';
import { isEmpty, isArray } from 'lodash';
import {
  getAccessToken,
  getResponse,
  getAttachmentUrl,
  getCurrentOrganizationId,
} from 'utils/utils';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import classnames from 'classnames';
import { removeFile, queryFileList } from 'services/api';

import styles from '../index.less';

const bucketDirectory = 'spfm-comp';
const tenantId = getCurrentOrganizationId();

const UploadCard = ({
  uuid,
  record,
  viewOnly,
  label = '',
  fieldName = '',
  fileSize = 50 * 1024 * 1024,
  enableImageWatermark = 0, // 是否开启图片水印
}) => {
  const [uploadList, setUploadList] = useState([]);
  const [filePath, setFilePath] = useState('');
  const [spin, setSpin] = useState(false);
  const idType = !isEmpty(record) && record.get('idType');

  useEffect(() => {
    if (uuid) {
      queryFileList({
        bucketName: PRIVATE_BUCKET,
        attachmentUUID: uuid,
      }).then(res => {
        if (getResponse(res) && isArray(res) && !isEmpty(res)) {
          handleFileInfo(res[0] || {});
        }
      });
    }
  }, [uuid]);

  // 处理附件相关信息
  const handleFileInfo = file => {
    const { fileUrl, fileId, fileName: newFileName } = file;
    const attachmentUrl = getAttachmentUrl(fileUrl, PRIVATE_BUCKET, tenantId, bucketDirectory);
    const url = `${attachmentUrl}&enableImageWatermark=${enableImageWatermark}`;
    const list = [
      {
        uid: fileId,
        name: newFileName,
        response: fileUrl,
        status: 'done',
        url,
      },
    ];
    setUploadList(list);
    setFilePath(url);
  };

  const handlePreview = token => {
    if (isEmpty(uploadList)) {
      return;
    }
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

  // 删除文件回调函数
  const onRemove = () => {
    const { response = '' } = (uploadList || [])[0];
    const url = response;
    setSpin(true);
    const payload = {
      bucketName: PRIVATE_BUCKET,
      attachmentUUID: record.get(fieldName),
      urls: [url],
    };
    removeFile(payload)
      .then(res => {
        if (getResponse(res)) {
          setFilePath('');
          // 更新后台表暂时不需要
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

  const beforeUpload = file => {
    if (file.size > fileSize) {
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

    const accept = 'image/jpeg,image/jpg,image/png,image/bmp';
    if (accept && accept.indexOf(file.type) === -1) {
      const fileTypeList = accept.split(',').map(n => {
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

  return !filePath && !viewOnly ? (
    <Attachment
      accept={['image/jpeg', 'image/jpg', 'image/png', 'image/bmp']}
      filePreview
      bucketName={PRIVATE_BUCKET}
      bucketDirectory={bucketDirectory}
      fileSize={500 * 1024 * 1024}
      listType="picture-card"
      multiple={false}
      showHistory={false}
      pictureWidth={180}
      onUploadSuccess={file => {
        handleFileInfo(file);
      }}
      value={!isEmpty(record) && record.get(fieldName)}
      onChange={value => {
        if (!record.get(fieldName)) {
          record.set(fieldName, value);
        }
      }}
      beforeUpload={beforeUpload}
      className={classnames(styles['file-card-uuid'], {
        [styles['file-card-uuid-required']]: idType === 'I',
      })}
    >
      {label}
    </Attachment>
  ) : (
    filePath && (
      <Spin spinning={spin}>
        <div className={classnames(styles['upload-img-style'], styles['view-img-no-model'])}>
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
    )
  );
};

export default UploadCard;

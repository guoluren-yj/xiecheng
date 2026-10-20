/**
 * UploadCard - url附件
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import classnames from 'classnames';
import React, { useState, useEffect } from 'react';
import { Icon, Modal } from 'choerodon-ui/pro';
import { HZERO_FILE } from 'utils/config';
import { isEmpty } from 'lodash';
import { getAccessToken, getAttachmentUrl, getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';

import uploadPdf from '@/assets/icon-register-upload-pdf.svg';
import styles from '../index.less';

const bucketDirectory = 'spfm-comp';
const tenantId = getCurrentOrganizationId();

const UploadCard = ({
  fileUrl = '',
  fileName = '',
  imgWrapClass = '',
  enableImageWatermark = 0, // 是否开启图片水印
}) => {
  const [uploadList, setUploadList] = useState([]);
  const [filePath, setFilePath] = useState('');
  useEffect(() => {
    if (fileUrl) {
      const newFileName = fileName;
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
    }
  }, [fileUrl]);

  const handlePreview = token => {
    if (!isEmpty(uploadList)) {
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
    }
  };

  const accessToken = getAccessToken();
  const headers = {};
  if (accessToken) {
    headers.Authorization = `bearer ${accessToken}`;
  }

  // 附件未上传显示上传附件组件问题
  return (
    filePath && (
      <div className={classnames(styles['upload-img-style'], imgWrapClass)}>
        <img src={filePath} alt="" />
        <div className={styles['img-btn']}>
          <a onClick={() => handlePreview(headers.Authorization)}>
            <Icon type="visibility-o" />
          </a>
        </div>
      </div>
    )
  );
};

export default UploadCard;

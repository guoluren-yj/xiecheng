/**
 * @author: Danica <ke.wang01@gonig-link.com>
 * @since: 2021-12-20
 * @description: 门户-上传附件
 * @copyright: Copyright (c) 2020, Hand
 */

import React, { useState, useMemo, memo } from 'react';
import { Upload } from 'choerodon-ui/pro';
import { HZERO_FILE } from 'utils/config';
import { isEmpty } from 'lodash';
import { PUBLIC_BUCKET } from '_utils/config';
import { getAccessToken, getPlatformVersionApi } from 'utils/utils';

export default memo(({ result, record, showUploadList = true, language }) => {
  const [bannerType, setBannerType] = useState('');
  // 上传成功
  const onUploadSuccess = (file, response, data) => {
    if (isEmpty(file)) return;
    if (showUploadList) {
      record.set(data, {
        url: file,
        type: bannerType,
        uid: response.uid,
      });
    } else {
      const content = record.get(language) || [];
      record.set(language, [...content, { insert: { image: `${file}` } }]);
    }
  };

  const uploadProps = useMemo(() => {
    return {
      headers: { Authorization: `bearer ${getAccessToken()}` },
      action: `${HZERO_FILE}/v1/${getPlatformVersionApi('files/multipart')}`,
      accept: ['.jepg', '.jpg', '.png', 'image/jpeg', '.svg'],
      multiple: false,
      fileListMaxLength: showUploadList ? 1 : 0,
      data: (file) => {
        setBannerType(file.type);
        return {
          bucketName: PUBLIC_BUCKET,
          directory: 'spfm-templates-config',
          fileName: file.name,
        };
      },
    };
  }, []);
  return (
    <Upload
      {...uploadProps}
      defaultFileList={isEmpty(result.data) ? [] : [result.data]}
      onUploadSuccess={(file, response) => {
        onUploadSuccess(file, response, result.type);
      }}
      showUploadList={showUploadList}
    />
  );
});

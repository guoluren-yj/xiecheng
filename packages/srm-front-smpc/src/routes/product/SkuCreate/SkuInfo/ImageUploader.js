import React, { useState } from 'react';
import { ImageCrop } from 'choerodon-ui';

import { API_HOST } from 'utils/config';
import { getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import { PUBLIC_BUCKET } from '_utils/config';

const { AvatarUploader } = ImageCrop;

const organizationId = getCurrentOrganizationId();

const action = `${API_HOST}/hfle/v1/${organizationId}/files/multipart`;

export default function ImageUploader(props) {
  const { onRef = (e) => e } = props;
  const [visible, setVisible] = useState(false);
  onRef({ toggle: () => setVisible(!visible) });

  const accessToken = getAccessToken();
  const headers = {};
  if (accessToken) {
    headers.Authorization = `bearer ${accessToken}`;
  }

  const uploadProps = {
    action,
    headers,
    accept: 'image/*',
    data: { bucketName: PUBLIC_BUCKET, directory: 'smpc/sku/media' },
  };

  const modalProps = {
    style: { width: 700 },
  };

  return (
    <AvatarUploader
      visible={visible}
      uploadProps={uploadProps}
      modalProps={modalProps}
      uploadUrl={action}
    />
  );
}

import React, { Fragment, useEffect, useState } from 'react';
// import { DataSet } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isArray, isFunction } from 'lodash';
import qs from 'query-string';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
// import { PUBLIC_BUCKET } from '_utils/config';
import { PRIVATE_BUCKET } from '_utils/config';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { queryFileList } from 'services/api';
// import { getPublicLanguage, isText, getToken } from '@/utils/utils';

import { getPreviewUrl, getFileExtension } from '../utils';

import styles from './index.less';

export default observer(function Page(props) {
  const {
    location: { search },
  } = props;

  const { attachmentUUID = '3099a3c4b5a32d42d99e89aaa77c639022' } = qs.parse(search);
  const [previewUrl, setPreviewUrl] = useState('');

  const [loading, setLoading] = useState(false);
  // const [doubleUnitFlag, setDoubleUnitFlag] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);

    const fileList = await queryFileList({
      attachmentUUID,
      organizationId: getCurrentOrganizationId(),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-template-requirement',
    });

    const attachment = { ...(fileList[0] || {}) };
    const { fileType: type, fileUrl: url } = attachment;
    if (getResponse(fileList)) {
      if (isArray(fileList) && fileList.length) {
        // 获取预览url
        const getPreview = getPreviewUrl({
          attachment: {
            ...attachment,
            type,
            url,
            ext: getFileExtension(url),
          },
          bucketName: PRIVATE_BUCKET,
          bucketDirectory: 'ssrc-template-requirement',
          // storageCode: '',
          // isPublic:
        });

        const preview = isFunction(getPreview) ? await getPreview() : getPreview;
        console.log('previewUrl', preview);
        setPreviewUrl(preview);
        setLoading(false);
      } else {
        console.error('fileList.length', fileList.length);
      }
    }
  };

  // return ();
  return (
    <Fragment>
      <Header
        title={intl.get('ssrc.findBusiness.view.message.title.menu').d('发现商机')}
        backPath="/ssrc/find-business-opportunities/list"
      />

      <Content className={styles['detail-content-wrap']}>
        <Spin spinning={loading}>
          <iframe
            src={previewUrl}
            title="title"
            style={{ border: 'none', height: 'calc(100vh - 1.5rem - 32px)', width: '100%' }}
          />
        </Spin>
      </Content>
    </Fragment>
  );
});

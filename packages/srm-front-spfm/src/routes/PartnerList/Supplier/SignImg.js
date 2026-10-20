import React, { useEffect, useState } from 'react';
import { Tabs, Upload } from 'hzero-ui';
import intl from 'utils/intl';
// import UploadA from 'components/Upload/UploadButton';
import { getCurrentOrganizationId, getAttachmentUrl } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';

import styles from './index.less';

export default ({ onSearch }) => {
  const [esignFileList, useEsignFileList] = useState([]);
  const [fddFileList, useFddFileList] = useState([]);
  useEffect(() => {
    onSearch().then((res) => {
      if (res && res.length > 0) {
        const eFileList = [];
        const fFileList = [];
        res.forEach((element) => {
          if (element.sealFileUrl) {
            const url = getAttachmentUrl(
              element.sealFileUrl,
              PRIVATE_BUCKET,
              getCurrentOrganizationId()
              // bucketDirectory,
            );
            if (element.sealType === 'ESIGN') {
              eFileList.push({
                uid: element.sealId,
                name: element.sealName,
                thumbUrl: url,
                url,
              });
            } else {
              fFileList.push({
                uid: element.sealId,
                name: element.sealName,
                thumbUrl: url,
                url,
              });
            }
          }
        });
        useEsignFileList(eFileList);
        useFddFileList(fFileList);
      }
    });
  }, []);

  return (
    <Tabs defaultActiveKey="esign" animated={false}>
      <Tabs.TabPane
        tab={intl.get('spfm.supplier.view.router.supplier.esign').d('E签宝')}
        key="esign"
      >
        {/* <Upload
          fileList={}
          bucketName={PRIVATE_BUCKET}
          text={intl.get('hzero.common.button.upload').d('上传')}
        /> */}
        <Upload
          // viewOnly
          fileType="image/jpeg;image/png"
          listType="picture-card"
          fileList={esignFileList}
          className={styles.noDelete}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab={intl.get('spfm.supplier.view.router.supplier.fdd').d('法大大')} key="fdd">
        <Upload
          // viewOnly
          fileType="image/jpeg;image/png"
          listType="picture-card"
          fileList={fddFileList}
          className={styles.noDelete}
        />
      </Tabs.TabPane>
    </Tabs>
  );
};

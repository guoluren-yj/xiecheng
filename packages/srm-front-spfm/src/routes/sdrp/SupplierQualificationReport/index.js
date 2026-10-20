/* eslint-disable no-unused-expressions */
import React, { Fragment, useState, useEffect } from 'react';
import { Attachment } from 'choerodon-ui/pro';
import { querySignedUrl } from 'hzero-front/lib/services/api/file';
import { PRIVATE_BUCKET } from '_utils/config';
import { flow } from 'lodash';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';

const SupplierQualificationReport = (props) => {
  const { match: { params: { attachmentId, url } = {} } = {}, modal } = props;
  const [showAttachment, setShowAttachment] = useState(false);

  const download = async () => {
    const signUrl = await querySignedUrl({
      url: decodeURIComponent(url),
      bucketName: PRIVATE_BUCKET,
    });
    const link = document.createElement('a');
    link.href = signUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.href = '';
    document.body.removeChild(link);
    modal?.close();
  };

  useEffect(() => {
    if (attachmentId) {
      setShowAttachment(true);
      modal?.update({ mask: true, style: { width: 500 } });
    } else if (url) {
      download();
    } else {
      modal?.close();
    }
  }, []);

  return (
    <Fragment>
      <Header title={intl.get('spfm.attachment.view.title.tab.attachmentTable').d('附件信息')} />
      <Content>
        {showAttachment && (
          <Attachment
            showHistory
            bucketName={PRIVATE_BUCKET}
            labelLayout="float"
            value={[attachmentId]}
          />
        )}
      </Content>
    </Fragment>
  );
};

export default flow([
  formatterCollections({
    code: ['spfm.attachment'],
  }),
  withProps(() => ({}), { cacheState: true }),
])(SupplierQualificationReport);

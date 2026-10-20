import React, { useState, useEffect } from 'react';
import { Content, Header } from 'components/Page';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import uuidv4 from 'uuid/v4';
import { PUBLIC_BUCKET } from '_utils/config';
import { isNil, isEmpty, isNull } from 'lodash';
import { observer } from 'mobx-react';
import request from 'utils/request';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const tenantId = getCurrentOrganizationId();

function TopstarNotice() {
  const [noticeData, setNoticeData] = useState({});

  useEffect(() => {
    getNotice();
  }, []);

  // 获取最新一条公告信息
  const getNotice = () => {
    const requestUrl = `/marmot/v1/${tenantId}/marmot-api/QtS5DvRe2t8gynyp8d9YhZS00d5eO2ljLzHdL2N9MuM`;
    request(requestUrl, {
      method: 'GET',
      query: { tenantId },
    }).then((res) => {
      console.log(res);
      setNoticeData(res);
    });
  };

  const uploadModalProps = {
    filePreview: true,
    btnProps: {
      disabled: false,
      type: 'primary',
    },
    btnText: intl.get(`scux.topstarNotice.tag`).d('附件'),
    bucketName: PUBLIC_BUCKET,
    bucketDirectory: 'spfm-notice-detail',
    viewOnly: true,
    attachmentUUID:
      isEmpty(noticeData?.attachmentUuid) || isNull(noticeData?.attachmentUuid)
        ? uuidv4()
        : noticeData?.attachmentUuid,
    showFilesNumber: false,
  };

  return (
    <>
      <Header title={isNil(noticeData?.title) ? '' : noticeData?.title}>
        <UploadModal {...uploadModalProps} />
      </Header>
      <Content>
        {isNil(noticeData?.noticeBody) ? (
          ''
        ) : (
          <div dangerouslySetInnerHTML={{ __html: noticeData?.noticeBody }} />
        )}
      </Content>
    </>
  );
}

export default formatterCollections({ code: ['scux.topstarNotice', 'hzero.common'] })(
  observer(TopstarNotice)
);

/*
 * @Descripttion: 关闭征询书--Index
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-09-01 10:51:17
 * @LastEditors: yiping.liu
 */
import React from 'react';
import intl from 'utils/intl';
import { Form, TextArea, Attachment } from 'choerodon-ui/pro';
import { PRIVATE_BUCKET } from '_utils/config';

const CloseInquiry = (props) => {
  const { closeRfDs } = props;

  const attProps = {
    name: 'closeAttachmentUuid',
    help: (
      <div style={{ marginTop: '10px' }}>
        {intl
          .get(`ssrc.inquiryHall.view.message.upload.help`)
          .d('大小不超过50M，支持扩展名：.zip .doc .pdf .jpg...')}
      </div>
    ),
    max: 9,
    fileSize: 50 * 1024 * 1024,
    sortable: false,
    bucketName: PRIVATE_BUCKET,
    bucketDirectory: 'ssrc-rfi-rfiheader',
  };

  return (
    <React.Fragment>
      <Form dataSet={closeRfDs} labelWidth={100} labelLayout="float">
        <TextArea name="closeRemark" resize />
        <Attachment {...attProps} />
      </Form>
    </React.Fragment>
  );
};

export default CloseInquiry;

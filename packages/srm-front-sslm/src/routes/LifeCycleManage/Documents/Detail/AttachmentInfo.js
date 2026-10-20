/*
 * @Date: 2022-12-09 13:53:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';

import { PRIVATE_BUCKET } from '_utils/config';

const AttachmentInfo = ({ dataSet, isEdit, custLoading, customizeForm, customizeUnitCode }) => {
  return customizeForm(
    {
      code: customizeUnitCode,
    },
    <Form
      columns={2}
      dataSet={dataSet}
      custLoading={custLoading}
      labelLayout={isEdit ? 'float' : 'vertical'}
      className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
    >
      <Attachment
        readOnly={!isEdit}
        name="attachmentUuid"
        bucketName={PRIVATE_BUCKET}
        bucketDirectory="sslm-lifecycle"
      />
    </Form>
  );
};

export default AttachmentInfo;

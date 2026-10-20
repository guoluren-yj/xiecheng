/*
 * ResultAttachment - 考评结果附件
 * @Date: 2023-12-07 11:07:00
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';

import { PRIVATE_BUCKET } from '_utils/config';

const ResultAttachment = ({ basicDs, readOnlyFlag }) => {
  const { evalStatus } = basicDs?.current?.get(['evalStatus']) || {};
  return (
    <Form columns={2} dataSet={basicDs} labelLayout="float">
      <Attachment
        name="evalAttUuid"
        bucketName={PRIVATE_BUCKET}
        readOnly={readOnlyFlag || !['FINAL_COLLECTED', 'REJECTED'].includes(evalStatus)}
      />
    </Form>
  );
};

export default ResultAttachment;

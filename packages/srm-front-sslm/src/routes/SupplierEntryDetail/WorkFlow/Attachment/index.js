/*
 * @Date: 2023-09-15 11:16:50
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { Form, Attachment } from 'choerodon-ui/pro';
import { PRIVATE_BUCKET } from '_utils/config';

const Index = ({ commonProps }) => {
  const { entryBaseInfoDs, isEdit = false } = commonProps;
  return (
    <div className="card-wrap">
      <div className="card-detail-title">
        {intl.get('hzero.common.upload.modal.title').d('附件')}
      </div>
      {entryBaseInfoDs && (
        <div style={{ paddingBottom: 20 }}>
          <Form columns={2} dataSet={entryBaseInfoDs} labelLayout="float">
            <Attachment
              readOnly={!isEdit}
              name="attachmentUuid"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="sslm-lifecycle"
            />
          </Form>
        </div>
      )}
    </div>
  );
};

export default Index;

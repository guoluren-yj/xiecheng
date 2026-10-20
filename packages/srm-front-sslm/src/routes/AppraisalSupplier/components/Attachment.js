/*
 * @Date: 2023-11-01 14:00:29
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';
import { PRIVATE_BUCKET } from '_utils/config';

const Index = ({ dataSet }) => {
  return (
    <Form columns={2} dataSet={dataSet} labelLayout="float">
      <Attachment name="confirmSupplierUuid" bucketName={PRIVATE_BUCKET} />
    </Form>
  );
};

export default Index;

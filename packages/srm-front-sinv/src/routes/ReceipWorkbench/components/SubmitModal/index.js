import React from 'react';
import { noop } from 'lodash';
import { Form } from 'choerodon-ui/pro';

const SubmitModal = (props) => {
  const { ds, remote, customizeUnitCode = '', customizeForm = noop, remoteCode = '' } = props;

  const getFields = () => {
    return remote ? remote.process(remoteCode, []) : [];
  };

  return customizeForm(
    {
      code: customizeUnitCode,
      dataSet: ds,
    },
    <Form dataSet={ds} columns={1} labelLayout="float">
      {getFields()}
    </Form>
  );
};

export default SubmitModal;

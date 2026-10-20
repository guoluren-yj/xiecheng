import React from 'react';
import { Form } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

export default function ModalContent(props) {
  const { dataSet, customizeCode, customizeForm } = props;

  return customizeForm({
    code: customizeCode,
  }, (
    <Form dataSet={dataSet} labelLayout={LabelLayout.float} />
  ));
}
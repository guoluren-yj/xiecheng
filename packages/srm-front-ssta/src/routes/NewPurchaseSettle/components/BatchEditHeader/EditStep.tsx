import React from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import { Form, DatePicker, Lov } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import type { DocType } from '.';
import { batchEditCodeMap } from '.';

interface EditStepProps {
  editDs: DataSet;
  documentType: DocType,
  customizeForm: Function,
}

const EditStep = (props: EditStepProps) => {

  const { editDs, documentType, customizeForm } = props;

  return customizeForm(
    { code: batchEditCodeMap[documentType].EDIT },
    <Form dataSet={editDs} columns={3} labelLayout={LabelLayout.float}>
      <DatePicker name="expectPaymentDate" />
      <Lov name="paymentCondition" />
      <Lov name="paymentMethodLov" />
    </Form>
  );
};

export default EditStep;
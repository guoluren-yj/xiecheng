import React from 'react';
import { Form, TextArea } from 'choerodon-ui/pro';
import { noop } from 'lodash';
import { observer } from 'mobx-react';

import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

const BackToCheckPrice = ({ bidFlag = false, customizeForm = noop, backToCheckPriceDs }) => {
  return customizeForm(
    {
      code: bidFlag
        ? 'SSRC.INQUIRY_BID_DETAIL.RETURN_MODAL.FORM'
        : 'SSRC.INQUIRY_HALL_DETAIL.RETURN_MODAL.FORM',
      dataSet: backToCheckPriceDs,
    },
    <Form dataSet={backToCheckPriceDs} labelLayout="float">
      <TextArea name="checkRollbackRemark" colSpan={3} newLine resize />
    </Form>
  );
};

export default WithCustomizeC7N({
  unitCode: [
    'SSRC.INQUIRY_BID_DETAIL.RETURN_MODAL.FORM',
    'SSRC.INQUIRY_HALL_DETAIL.RETURN_MODAL.FORM',
  ],
})(observer(BackToCheckPrice));

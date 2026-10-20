import React, { useContext } from 'react';
import { Output } from 'choerodon-ui/pro';

import CollapseForm from '_components/CollapseForm';

import { Store } from '../store/index';

export default function ProgrammeCard() {
  const {
    routerParams: { sourceCategory },
    commonDs: { rfFormDs },
    // ref: { rfFormInfoRef },
    customizeCollapseForm,
    storeData: { noBackFlag },
  } = useContext(Store);
  return customizeCollapseForm(
    {
      code: noBackFlag
        ? `SSRC.SUPPLIER_REPLY.${sourceCategory}_HISTORY.BASE_FORM`
        : `SSRC.SUPPLIER_REPLY_${sourceCategory}.BASE_FORM`,
      dataSet: rfFormDs,
      enableEmpty: true,
    },
    <CollapseForm
      dataSet={rfFormDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
      // formRef={(ref) => {
      //   rfFormInfoRef.current = ref;
      // }}
    >
      <Output
        disabled
        newLine
        name="rfContent"
        colSpan={3}
        resize="both"
        autoSize={{ minRows: 3 }}
      />
    </CollapseForm>
  );
}

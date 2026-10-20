import React, { useContext, useEffect } from 'react';
import { Output } from 'choerodon-ui/pro';

import CollapseForm from '_components/CollapseForm';

import Store from '../../store/index';

export default function ProgrammeCard() {
  const {
    routerParams: { sourceCategory },
    commonDs: { rfFormDs },
    customizeCollapseForm,
  } = useContext(Store);

  useEffect(() => {
    rfFormDs.query();
  }, []);

  return customizeCollapseForm(
    {
      code: `SSRC.INQUIRY_HALL_RF_DETAIL.FORM_${sourceCategory === 'RFP' ? 'FRP' : 'RFI'}`,
      dataSet: rfFormDs,
    },
    <CollapseForm
      dataSet={rfFormDs}
      columns={2}
      labelLayout="vertical"
      labelAlign="left"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="rfContent" colSpan={3} />
    </CollapseForm>
  );
}

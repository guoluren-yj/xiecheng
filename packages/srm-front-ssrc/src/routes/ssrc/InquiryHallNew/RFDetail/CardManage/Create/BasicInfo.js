import React, { useContext, useEffect } from 'react';
import { Tooltip, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import CollapseForm from '_components/CollapseForm';

import Store from '../../store/index';

export default observer(function BasicInfoCard() {
  const {
    routerParams: { sourceCategory },
    commonDs: { createBasicFormDs },
    customizeCollapseForm,
  } = useContext(Store);

  const { current } = createBasicFormDs;

  useEffect(() => {
    createBasicFormDs.query();
  }, []);

  return customizeCollapseForm(
    {
      code: `SSRC.INQUIRY_HALL_RF_DETAIL.HEADER_INFO_${sourceCategory}`,
      dataSet: createBasicFormDs,
    },
    <CollapseForm
      dataSet={createBasicFormDs}
      columns={3}
      labelLayout="vertical"
      labelAlign="left"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="rfTitle" />
      <Output name="templateName" />
      {current?.get('sourceFrom') === 'PROJECT' && (
        <Output
          name="sourceProjectName"
          renderer={({ record, value }) => (
            <Tooltip
              title={`${record?.get('sourceProjectNum')} - ${record?.get('sourceProjectName')}`}
            >
              {value}
            </Tooltip>
          )}
        />
      )}
      <Output newLine name="rfRemark" colSpan={2} />
    </CollapseForm>
  );
});

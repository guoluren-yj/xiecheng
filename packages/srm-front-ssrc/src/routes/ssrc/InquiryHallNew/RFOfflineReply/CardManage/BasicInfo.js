import React, { useContext } from 'react';
import { Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import CollapseForm from '_components/CollapseForm';

import Store from '../store/index';

const BasicInfo = observer(() => {
  const {
    commonDs: { basicFormDs },
    routerParams: { sourceCategory },
    customizeCollapseForm,
  } = useContext(Store);

  const { current } = basicFormDs;

  return customizeCollapseForm(
    {
      code: `SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.BASE_HEADER_${sourceCategory}`,
      dataSet: basicFormDs,
    },
    <CollapseForm
      dataSet={basicFormDs}
      columns={3}
      labelLayout="vertical"
      labelAlign="left"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="rfTitle" />
      <Output name="templateName" />
      {current?.get('sourceFrom') === 'PROJECT' ? (
        <Output name="sourceProjectName" showHelp="tooltip" />
      ) : null}
      <Output name="rfRemark" />
    </CollapseForm>
  );
});

export default BasicInfo;

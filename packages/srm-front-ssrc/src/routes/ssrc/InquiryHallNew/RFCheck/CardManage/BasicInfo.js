import React, { useContext } from 'react';
import { Output, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { Store } from '../store/index';

export default observer(function BasicInfoCard() {
  const {
    remote,
    routerParams: { sourceCategory },
    commonDs: { basicFormDs },
    customizeForm,
  } = useContext(Store);

  return customizeForm(
    {
      code: `SSRC.INQUIRY_HALL.RF_CHECK.HEADER_INFO_${sourceCategory}`,
      dataSet: basicFormDs,
    },
    <Form
      dataSet={basicFormDs}
      labelAlign="left"
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="rfTitle" />
      {basicFormDs?.current?.get('sourceFrom') === 'PROJECT' && [
        <Output name="sourceProjectNum" />,
        <Output name="sourceProjectName" />,
      ]}
      <Output name="rfRemark" />
      {remote?.process('SSRC.INQUIRY_HALL.RF_CHECK.HEADER_INFO_RF', null, {
        sourceCategory,
        basicFormDs,
      })}
    </Form>
  );
});

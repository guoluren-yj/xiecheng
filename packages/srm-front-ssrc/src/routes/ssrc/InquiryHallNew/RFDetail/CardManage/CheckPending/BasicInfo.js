import React, { useContext, useEffect } from 'react';
import { Output, Form, Tooltip } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../../store/index';

export default observer(function BasicInfoCard(props) {
  const { currentStep } = props;
  const {
    remote,
    routerParams: { sourceCategory, setPath },
    commonDs: { checkPendingBasicFormDs, ItemLineDetailDs, supplierDs },
    customizeForm,
  } = useContext(Store);

  const { current } = checkPendingBasicFormDs;

  useEffect(() => {
    checkPendingBasicFormDs.query();
  }, []);

  return customizeForm(
    {
      code: `SSRC.INQUIRY_HALL_RF_DETAIL.CHECK_RF_INFO_${sourceCategory}`,
      dataSet: checkPendingBasicFormDs,
    },
    <Form
      dataSet={checkPendingBasicFormDs}
      labelAlign="left"
      columns={3}
      labelLayout="vertical"
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
      <Output name="rfRemark" />
      {remote?.process('SSRC.INQUIRY_HALL_RF_DETAIL.CHECK_RF_INFO_RF', null, {
        setPath,
        supplierDs,
        currentStep,
        sourceCategory,
        ItemLineDetailDs,
        checkPendingBasicFormDs,
      })}
    </Form>
  );
});

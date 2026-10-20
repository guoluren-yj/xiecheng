import React, { useContext } from 'react';
import { Select, TextField, IntlField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import CollapseForm from '_components/CollapseForm';

import { Store } from '../store/index';

export default observer(function BasicInfoCard() {
  const {
    routerParams: { isHistory = false, useRFContent = 'ALL' },
    commonDs: { basicFormDs },
    customizeCollapseForm,
  } = useContext(Store);

  const getOptionsFilter = (record) => {
    if (useRFContent === 'ALL') {
      return true;
    } else if (useRFContent === 'RFP') {
      return record.get('value') === 'RFP';
    } else {
      return record.get('value') === 'RFI';
    }
  };

  return customizeCollapseForm(
    {
      code: `SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.BASIC_INFO`,
      dataSet: basicFormDs,
    },
    <CollapseForm dataSet={basicFormDs} columns={3} labelLayout="float" disabled={isHistory}>
      <IntlField name="templateName" />
      <Select name="sourceCategory" optionsFilter={getOptionsFilter} />
      <Select name="templateStatus" newLine />
      <TextField name="versionNumber" />
    </CollapseForm>
  );
});

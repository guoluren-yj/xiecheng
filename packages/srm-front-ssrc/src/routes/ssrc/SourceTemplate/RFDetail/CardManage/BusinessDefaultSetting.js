import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { Select } from 'choerodon-ui/pro';

import CollapseForm from '_components/CollapseForm';

import Store from '../store/index';

const BusinessDefaultSetting = observer(() => {
  const {
    routerParams: { isHistory = false },
    commonDs: { ruleFormDs },
    customizeCollapseForm,
  } = useContext(Store);

  return (
    <React.Fragment>
      {customizeCollapseForm(
        {
          code: 'SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.BUSINESS_DEFAULT_SETTING',
          dataSet: ruleFormDs,
        },
        <CollapseForm dataSet={ruleFormDs} columns={3} labelLayout="float" disabled={isHistory}>
          <Select name="replyType" />
        </CollapseForm>
      )}
    </React.Fragment>
  );
});

export default BusinessDefaultSetting;

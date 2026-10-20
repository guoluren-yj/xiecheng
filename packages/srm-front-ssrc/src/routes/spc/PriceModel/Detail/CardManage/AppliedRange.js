import React, { useContext } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

export default observer(function AppliedRange() {
  const {
    commonDs: { headerDs },
  } = useContext(Store);
  return (
    <div className="card-content-form">
      <Form
        columns={3}
        labelLayout="vertical"
        labelAlign="left"
        className="c7n-pro-vertical-form-display"
        dataSet={headerDs}
      >
        <Output name="appDimensionCode" />
        <Output name="appScopesLov" />
      </Form>
    </div>
  );
});

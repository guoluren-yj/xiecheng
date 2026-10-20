import React, { useContext } from 'react';
import { Output, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

export default observer(function basicInfo() {
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
        <Output name="modelCode" />
        <Output name="modelName" />
        <Output name="modelStatusMeaning" />
        <Output name="modelRemark" colSpan={2} />
      </Form>
    </div>
  );
});

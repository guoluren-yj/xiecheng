import React, { useContext } from 'react';
import { Form, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

export default observer(function BusinessRule() {
  const {
    commonDs: { headerDs },
  } = useContext(Store);
  return (
    <div className="card-content-form">
      <Form columns={3} labelLayout="float" dataSet={headerDs}>
        <Select name="needApprovalFlag" clearButton={false} />
        <Select name="needConfirmFlag" clearButton={false} />
        <Select name="triggerRule" clearButton={false} />
      </Form>
    </div>
  );
});

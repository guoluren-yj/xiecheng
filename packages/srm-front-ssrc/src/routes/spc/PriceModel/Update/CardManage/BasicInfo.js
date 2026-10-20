import React, { useContext } from 'react';
import { Form, TextField, TextArea } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

export default observer(function basicInfo() {
  const {
    commonDs: { headerDs },
  } = useContext(Store);
  return (
    <div className="card-content-form">
      <Form columns={3} labelLayout="float" dataSet={headerDs}>
        <TextField name="modelCode" />
        <TextField name="modelName" />
        <TextField name="modelStatusMeaning" />
        <TextArea name="modelRemark" />
      </Form>
    </div>
  );
});

import React, { useContext } from 'react';
import { Form, Lov, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

export default observer(function AppliedRange() {
  const {
    commonDs: { headerDs },
  } = useContext(Store);
  return (
    <div className="card-content-form">
      <Form columns={3} labelLayout="float" dataSet={headerDs}>
        <Select name="appDimensionCode" clearButton={false} />
        <Lov
          name="appScopesLov"
          tableProps={
            headerDs.current?.get('appDimensionCode') === 'CATEGORY' ? { mode: 'tree' } : null
          }
        />
      </Form>
    </div>
  );
});

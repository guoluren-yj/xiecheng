import React from 'react';
import { Form, Lov, TextField } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react-lite';
import intl from 'utils/intl';

const Index = (props) => {
  const { createModalDs, record } = props;
  const formProps = {};
  if (createModalDs) {
    formProps.dataSet = createModalDs;
  } else {
    formProps.record = record;
  }
  return (
    <Observer>
      {() => (
        <Form {...formProps} columns={2}>
          <Lov colSpan={2} name="combineName" />
          <TextField
            label={intl.get('swbh.roManagement.view.message.header.roleObjectCode').d('单据对象编码')}
            colSpan={2}
            name="roleCombineCode"
            disabled
          />
        </Form>
      )}
    </Observer>
  );
};

export default Index;

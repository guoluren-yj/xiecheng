import React, { Fragment, useMemo, forwardRef, useImperativeHandle } from 'react';
import { DataSet, Form, TextField, Spin, Select, IntlField } from 'choerodon-ui/pro';
import { formDS } from './indexDS';

const CreateFormStrategy = forwardRef((props, ref) => {
  const formDs = useMemo(() => new DataSet(formDS()), []);

  useImperativeHandle(ref, () => ({
    ref: ref.current,
    indexDs: formDs,
  }));
  return (
    <Fragment>
      <Spin spinning={false}>
        <Form labelLayout="float" dataSet={formDs} columns={1}>
          <TextField name="strategyCode" />
          <IntlField name="strategyName" />
          <Select name="sourceCode" disabled />
        </Form>
      </Spin>
    </Fragment>
  );
});

export default CreateFormStrategy;

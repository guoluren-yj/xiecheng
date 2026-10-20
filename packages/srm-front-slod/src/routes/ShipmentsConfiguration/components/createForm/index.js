import React, { Fragment, useMemo, forwardRef, useImperativeHandle } from 'react';
import { DataSet, Form, TextField, Spin, Select, Lov, IntlField } from 'choerodon-ui/pro';
import { useMount } from '@/utils/utils';
import { indexDS } from './indexDS';

const CreateForm = forwardRef((props, ref) => {
  const indexDs = useMemo(() => new DataSet(indexDS()), []);

  useMount(() => {
    const data = props.dataSet?.current?.toData();
    indexDs.loadData([data]);
  });

  useImperativeHandle(ref, () => ({
    ref: ref.current,
    indexDs,
  }));
  return (
    <Fragment>
      <Spin spinning={false}>
        <Form labelLayout="float" dataSet={indexDs} columns={1}>
          <TextField name="nodeConfigCode" />
          <IntlField name="nodeConfigName" />
          <Select name="nodeTemplateCode" />
          <Lov name="customerUnitCodeAll" showHelp="tooltip" />
          <Lov name="cuszDocTmplCodeObj" showHelp="tooltip" />
          <Lov name="documentCodeRuleAll" />
          <Lov name="uniqueLabelCodeRuleAll" />
          <IntlField name="nodeRemark" />
        </Form>
      </Spin>
    </Fragment>
  );
});

export default CreateForm;

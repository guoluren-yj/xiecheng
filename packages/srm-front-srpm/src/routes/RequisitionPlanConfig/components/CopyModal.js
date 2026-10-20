import React, { useImperativeHandle } from 'react';
import { Form, DataSet, TextField } from 'choerodon-ui/pro';
import { copyDS } from '../stores/indexDS';
// import CollapseForm from '_components/CollapseForm';

const Base = React.forwardRef(({ required = false }, ref) => {
  const copyeInfo = new DataSet(copyDS({ required }));
  // 函数组件调用到子组件的函数
  useImperativeHandle(ref, () => ({
    loadCurrentData,
    saveCurrentData,
    ref: ref.current,
  }));

  const loadCurrentData = (data) => {
    copyeInfo.loadData([data]);
  };

  const saveCurrentData = () => {
    return copyeInfo;
  };

  return (
    <div>
      <Form dataSet={copyeInfo} useColon={false} labelLayout="float">
        <TextField name="containerCode" />
      </Form>
    </div>
  );
});

export default Base;

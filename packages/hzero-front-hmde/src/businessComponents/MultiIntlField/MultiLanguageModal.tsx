import React from 'react';
import { TextArea, Form, DataSet } from 'choerodon-ui/pro';

interface IProps {
  initDefaultData?: any;
  formDs: DataSet;
  disabled?: boolean;
}

export default (props: IProps) => {
  const { initDefaultData, formDs, disabled } = props;
  return (
    <Form dataSet={formDs} disabled={disabled}>
      {initDefaultData?.map((item: any) => (
        <TextArea name={item?.code} />
      ))}
    </Form>
  );
};

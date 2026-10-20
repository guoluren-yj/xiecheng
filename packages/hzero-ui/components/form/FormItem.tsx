import type { FunctionComponent } from 'react';
import React from 'react';
import type { FormItemProps } from 'choerodon-ui/lib/form/FormItem';
import Form from 'choerodon-ui/lib/form';

const C7NFormItem = Form.Item;

export type {
  FormItemProps,
};

const FormItem: FunctionComponent<FormItemProps> = function FormItem(props) {
  return (
    <C7NFormItem
      prefixCls="ant-form"
      rowPrefixCls="ant-row"
      colPrefixCls="ant-col"
      helpTransitionName="show-help"
      labelLayout="horizontal"
      {...props}
    />
  );
};

FormItem.displayName = 'FormItem';

type FormItemType = typeof FormItem & { __FORM_ITEM: boolean };

(FormItem as FormItemType).__FORM_ITEM = true;

export default FormItem as FormItemType;

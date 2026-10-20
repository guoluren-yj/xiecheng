import type { FunctionComponent } from 'react';
import React from 'react';
import { FormLayout } from 'choerodon-ui/lib/form/enum';
import type {
  ComponentDecorator,
  FormComponentProps,
  FormCreateOption,
  FormProps,
  GetFieldDecoratorOptions,
  RcBaseFormProps,
  ValidateCallback,
  ValidationRule,
  WrappedFormUtils,
} from 'choerodon-ui/lib/form/Form';
import C7NForm from 'choerodon-ui/lib/form';
import FormItem from './FormItem';

const { createFormField, create } = C7NForm;

export {
  FormLayout,
}

export type {
  ComponentDecorator,
  FormComponentProps,
  RcBaseFormProps,
  FormCreateOption,
  FormProps,
  GetFieldDecoratorOptions,
  ValidateCallback,
  ValidationRule,
  WrappedFormUtils,
};

export {
  createFormField,
  create,
}

const Form: FunctionComponent<FormProps> = function Form(props) {
  return <C7NForm prefixCls="ant-form" {...props} />;
};

Form.displayName = 'Form<hzeroWithC7n>';

type FormType = typeof Form & {
  Item: typeof FormItem;
  createFormField: typeof createFormField;
  create: typeof create;
}

(Form as FormType).Item = FormItem;
(Form as FormType).createFormField = createFormField;
(Form as FormType).create = create;

export default Form as FormType;

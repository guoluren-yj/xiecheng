import React, { memo, isValidElement, createElement, cloneElement, useCallback } from 'react';
import { isString, isObject } from 'lodash';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/interface';
import type { FormProps } from 'choerodon-ui/pro/lib/form/interface';
import { Form, NumberField, Output, TextField } from 'choerodon-ui/pro';

interface EditorFormProps extends FormProps {
  // 个性化表单
  customizeForm?: Function;
  // 个性话表单参数
  customizeOptions?: object;
  // 表达是否为编辑态
  editorFlag?: boolean;
  // 表单字段
  editorColumns: any[];
  useWidthPercent?: boolean;
};

const EditorForm = memo((props: EditorFormProps) => {
  const {
    customizeForm,
    customizeOptions,
    editorFlag = false,
    editorColumns = [],
    ...otherformProps
  } = props;

  const { dataSet } = otherformProps;

  const matchComponent = useCallback((name: string, editor?: any) => {
    if (editor) return editor;
    const fieldType = dataSet?.getField(name)?.get('type');
    switch (fieldType) {
      case FieldType.number: // 大数字用TextField会显示科学计数法
        return NumberField;
      default:
        return TextField;
    }
  }, [dataSet]);

  const editorRender = (item: any) => {
    if (!item) {
      return null;
    } else if (isString(item)) {
      const component = matchComponent(item);
      // 字符串默认为name字段，组件为TextField且禁用
      return createElement(component, { key: item, name: item, disabled: true, showHelp: 'tooltip' });
    } else if (isValidElement(item)) {
      const { name: key } = (item.props || {}) as any;
      // 组件类型默认返回
      return cloneElement(item, { key });
    } else if (isObject(item)) {
      // 对象默认取editor（默认值为TextField）为组件
      const { editor, visible = true, ...otherProps } = item as any;
      const { name: key } = otherProps;
      const showHelpProps = editor?.displayName !== 'TextArea' ? { showHelp: 'tooltip' } : {};
      const component = matchComponent(key, editor);
      return visible ? createElement(editor || component, { key, ...showHelpProps, ...otherProps }) : null;
    }
  };

  const outputRender = (item) => {
    if (!item) {
      return null;
    } else if (isString(item)) {
      // 字符串默认为name字段，组件为Output
      return createElement(Output, { name: item, key: item });
    } else if (isValidElement(item)) {
      const { name: key } = (item.props || {}) as any;
      // 组件类型默认返回
      return cloneElement(item, { key });
    } else if (isObject(item)) {
      // 对象默认取editor（默认值为Output）为组件
      const { visible = true, ...otherProps } = item as any;
      const { name: key } = otherProps;
      delete otherProps.editor;
      return visible ? createElement(Output, { key, showHelp: 'label', ...otherProps }) : null;
    }
  };

  const formElement = (
    editorFlag ? (
      <Form key="edit" labelLayout={LabelLayout.float} {...otherformProps}>
        {editorColumns.map((item) => editorRender(item))}
      </Form>
    ) : (
      <Form key="view" className='c7n-pro-vertical-form-display' labelLayout={LabelLayout.vertical} {...otherformProps}>
        {editorColumns.map((item) => item.changeFlag ? editorRender(item) : outputRender(item))}
      </Form>
    )
  );

  return customizeForm ? customizeForm(customizeOptions, formElement) : formElement;
});

export default EditorForm;

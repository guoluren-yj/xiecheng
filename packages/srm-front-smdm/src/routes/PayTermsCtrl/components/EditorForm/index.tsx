/*
 * @Description: 编辑态表单
 * @Date: 2022-09-21 23:20:21
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { memo, isValidElement, createElement, cloneElement } from 'react';
import { Form, Output, TextField } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/interface';
import type { FormProps } from 'choerodon-ui/pro/lib/form/interface';
import { isString, isObject } from 'lodash';


interface EditorFormProps extends FormProps {
  // 个性化表单
  customizeForm?: Function;
  // 个性话表单参数
  customizeOptions?: object;
  // 表达是否为编辑态
  editorFlag?: boolean;
  // 是否禁用
  disabledFlag?: boolean;
  // 表单字段
  editorColumns: any[];
};

const EditorForm = memo((props: EditorFormProps) => {
  const {
    customizeForm,
    customizeOptions,
    editorFlag = false,
    disabledFlag = false,
    editorColumns = [],
    ...otherformProps
  } = props;

  const editorRender = (item: any) => {
    if (!item) {
      return null;
    } else if (isString(item)) {
      // 字符串默认为name字段，组件为TextField且禁用
      return createElement(TextField, { name: item, disabled: true });
    } else if (isValidElement(item)) {
      // 组件类型默认返回
      return cloneElement(item);
    } else if (isObject(item)) {
      // 对象默认取editor（默认值为TextField）为组件
      const { editor, visible = true, ...otherProps } = item as any;
      return visible ? createElement(editor || TextField, { showHelp: 'tooltip', disabled: disabledFlag, ...otherProps }) : null;
    }
  };

  const outputRender = (item) => {
    if (!item) {
      return null;
    } else if (isString(item)) {
      // 字符串默认为name字段，组件为Output
      return createElement(Output, { name: item });
    } else if (isValidElement(item)) {
      // 组件类型默认返回
      return cloneElement(item);
    } else if (isObject(item)) {
      // 对象默认取editor（默认值为Output）为组件
      const { visible = true, ...otherProps } = item as any;
      return visible ? createElement(Output, { showHelp: 'label', ...otherProps }) : null;
    }
  };

  const formElement = (
    editorFlag ? (
      <Form labelLayout={LabelLayout.float} {...otherformProps}>
        {editorColumns.map((item) => editorRender(item))}
      </Form>
    ) : (
      <Form labelLayout={LabelLayout.vertical} {...otherformProps}>
        {editorColumns.map((item) => outputRender(item))}
      </Form>
    )
  );

  return customizeForm ? customizeForm(customizeOptions, formElement) : formElement;
});

export default EditorForm;
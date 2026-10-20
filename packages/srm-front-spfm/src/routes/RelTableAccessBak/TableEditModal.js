/**
 * TableEditModal.js
 * index.js
 * @date: 2020-07-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import {
  Form,
  TextField,
  NumberField,
  CodeArea,
  Lov,
  Select,
  CheckBox,
  TextArea,
  DatePicker,
  DateTimePicker,
} from 'choerodon-ui/pro';
// 引入格式化器
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import JSFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSFormatter';
// 引入 json lint
import 'choerodon-ui/pro/lib/code-area/lint/json';
// import 'choerodon-ui/pro/lib/code-area/lint/javascript';
import { JSHINT } from 'jshint';
import 'codemirror/addon/lint/javascript-lint';
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/material.css';

window.JSHINT = JSHINT;

const jsonOptions = { mode: { name: 'javascript', json: true }, theme: 'material' }; // 代码框的 json 的配置信息
const jsOptions = { name: 'javascript', theme: 'material' }; // 代码框的 js 的配置信息

function TableEditModal(props = {}) {
  const { dataSet, formItems = [] } = props;
  const style = { height: 260 };

  /**
   * 渲染 formItem 每个组件
   * @param {Object} item ds的单个对象数据
   */
  const renderFormItem = (item = {}) => {
    switch (item._component) {
      case 'lov':
        return <Lov name={item.name} />;
      case 'number':
        return <NumberField name={item.name} />;
      case 'checkBox':
        return <CheckBox name={item.name} />;
      case 'textArea':
        return <TextArea name={item.name} />;
      case 'codeAreaJavaScript':
        return <CodeArea options={jsOptions} style={style} name={item.name} format={JSFormatter} />;
      case 'codeAreaJson':
        return (
          <CodeArea options={jsonOptions} style={style} name={item.name} format={JSONFormatter} />
        );
      case 'lookup':
        return <Select name={item.name} />;
      case 'datePicker':
        return <DatePicker name={item.name} />;
      case 'dateTimePicker':
        return <DateTimePicker name={item.name} />;
      case undefined:
        return null;
      default:
        return <TextField name={item.name} />;
    }
  };

  return <Form dataSet={dataSet}>{formItems.map((item) => renderFormItem(item))}</Form>;
}

export default TableEditModal;

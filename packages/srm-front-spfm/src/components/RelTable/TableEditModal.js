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
  Attachment,
  RichText,
} from 'choerodon-ui/pro';
import { Tooltip, Icon } from 'choerodon-ui';
import intl from 'utils/intl';
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
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/hint/sql-hint.js';
import 'codemirror/theme/material.css';
// 折叠代码
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/comment-fold.js';

import { PRIVATE_BUCKET } from '_utils/config';
import styles from './index.less';

window.JSHINT = JSHINT;

const jsonOptions = {
  mode: { name: 'javascript', json: true },
  theme: 'material',
  lineWrapping: true,
  foldGutter: true,
  gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
}; // 代码框的 json 的配置信息
const jsOptions = { name: 'javascript', theme: 'material' }; // 代码框的 js 的配置信息
const sqlOptions = { mode: { name: 'text/x-mysql' }, theme: 'material' }; // 代码框的 sql 配置信息

function TableEditModal(props = {}) {
  const { dataSet, formItems = [] } = props;
  const style = { height: 260 };

  const getJSONHeader = (name) => (
    <div
      style={{
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          float: 'right',
        }}
      >
        <Tooltip title={intl.get('spfm.relTableAccess.view.title.format.json').d('JSON代码格式化')}>
          <Icon
            type="code"
            onClick={() => {
              if (dataSet.current) {
                const value = dataSet.current.get(name);
                dataSet.current.set(name, JSONFormatter.getFormatted(value));
              }
            }}
          />
        </Tooltip>
      </div>
    </div>
  );

  /**
   * 渲染 formItem 每个组件
   * @param {Object} item ds的单个对象数据
   */
  const renderFormItem = (item = {}, ds = {}) => {
    const componentProps = {
      hidden: !!item.__isHidden,
    };
    switch (item._component) {
      case 'lov':
        return <Lov name={item.name} {...componentProps} />;
      case 'number':
        return <NumberField name={item.name} {...componentProps} />;
      case 'checkBox':
        return <CheckBox name={item.name} {...componentProps} />;
      case 'textArea':
        return <TextArea name={item.name} {...componentProps} />;
      case 'codeAreaJavaScript':
        return (
          <CodeArea
            options={jsOptions}
            style={style}
            name={item.name}
            format={JSFormatter}
            {...componentProps}
          />
        );
      case 'codeAreaJson':
        return (
          <CodeArea
            options={jsonOptions}
            style={style}
            name={item.name}
            format={JSONFormatter}
            {...componentProps}
            title={getJSONHeader(item.name)}
            className={styles['codeMirror-json-title']}
          />
        );
      case 'codeAreaSql':
        return <CodeArea options={sqlOptions} style={style} name={item.name} {...componentProps} />;
      case 'lookup':
        return <Select name={item.name} {...componentProps} />;
      case 'datePicker':
        return <DatePicker name={item.name} {...componentProps} />;
      case 'dateTimePicker':
        return <DateTimePicker name={item.name} {...componentProps} />;
      case 'upload':
      case 'multiUpload':
        return (
          <Attachment
            name={item.name}
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="Attachment-test"
            {...componentProps}
          />
        );
      case 'marmotScript': {
        // 新建时，不进入按钮也给默认值
        if (ds.current && !ds.current.get(item.name)) {
          ds.current.set(
            item.name,
            '/v8AZgB1AG4AYwB0AGkAbwBuACAAcAByAG8AYwBlAHMAcwAoACAAaQBuAHAAdQB0ACAAKQB7AAoAIAAgACAAcgBlAHQAdQByAG4AIAB7ACAAIgByAGUAcwB1AGwAdAAiADoAIgBoAGUAbABsAG8AIAB3AG8AcgBsAGQAIQAiAH0ACgB9'
          );
        }
        break;
      }
      case 'richText':
        return <RichText name={item.name} {...componentProps} style={{ height: 260 }} />;
      case undefined:
        return null;
      default:
        return <TextField name={item.name} {...componentProps} />;
    }
  };

  return (
    <Form dataSet={dataSet} labelLayout="float">
      {formItems.map((item) => renderFormItem(item, dataSet))}
    </Form>
  );
}

export default TableEditModal;

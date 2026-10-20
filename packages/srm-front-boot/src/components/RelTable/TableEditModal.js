/**
 * TableEditModal.js
 * index.js
 * @date: 2020-07-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState, useEffect } from 'react';
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
} from 'choerodon-ui/pro';
import crypto from 'crypto-js';
import { isEmpty } from 'lodash';
import MarmotScriptButton from '@/components/MarmotScript/MarmotScriptButton';
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

import { PRIVATE_BUCKET } from '@/utils/config';
import { getResponse } from 'utils/utils';
import { getComplementaryWordsService } from './relTableService';

window.JSHINT = JSHINT;

const jsonOptions = { mode: { name: 'javascript', json: true }, theme: 'material' }; // 代码框的 json 的配置信息
const jsOptions = { name: 'javascript', theme: 'material' }; // 代码框的 js 的配置信息
const sqlOptions = { mode: { name: 'text/x-mysql' }, theme: 'material' }; // 代码框的 sql 配置信息

function TableEditModal(props = {}) {
  const { dataSet, formItems = [], tableCode, relTableSelectVersion = {} } = props;
  const style = { height: 260 };
  const [complementaryWords, handleComplementaryWords] = useState([]);

  useEffect(() => {
    if (formItems.find((res) => res._component === 'marmotScript')) {
      getComplementaryWordsService().then((res) => {
        if (getResponse(res)) {
          // 自定义的代码提示
          if (!isEmpty(res)) {
            handleComplementaryWords(crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(res)));
          }
        }
      });
    }
  }, []);
  /**
   * 渲染 formItem 每个组件
   * @param {Object} item ds的单个对象数据
   */
  const renderFormItem = (item = {}, ds = {}) => {
    const componentProps = {
      hidden: !!item.__isHidden
    }

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
        return <CodeArea options={jsOptions} style={style} name={item.name} format={JSFormatter} {...componentProps} />;
      case 'codeAreaJson':
        return (
          <CodeArea options={jsonOptions} style={style} name={item.name} format={JSONFormatter} {...componentProps} />
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
        return (
          <Attachment
            name={item.name}
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="Attachment-test"
            {...componentProps}
          />
        );
      case 'marmotScript': {
        // eslint-disable-next-line
        const saveScriptValue = ds?.current?.get('id')
          ? `${tableCode}|${ds.current.get('id')}`
          : undefined;
        // 新建时，不进入按钮也给默认值
        if (!ds?.current?.get(item.name) && ds.current) {
          ds.current.set(
            item.name,
            '/v8AZgB1AG4AYwB0AGkAbwBuACAAcAByAG8AYwBlAHMAcwAoACAAaQBuAHAAdQB0ACAAKQB7AAoAIAAgACAAcgBlAHQAdQByAG4AIAB7ACAAIgByAGUAcwB1AGwAdAAiADoAIgBoAGUAbABsAG8AIAB3AG8AcgBsAGQAIQAiAH0ACgB9'
          );
        }
        const inputContent = ds?.current?.get(`${item.name}Input`) || undefined;
        const debugTenantNum = ds?.current?.get('tenantNum') || 'SRM';
        return (
          <MarmotScriptButton
            style={{
              display: 'block',
              border: '1px solid #CCCCCC',
              width: '100px',
              height: '0.32rem',
              fontSize: '14px',
              lineHeight: '0.32rem',
              textAlign: 'center',
              borderRadius: '0.02rem',
              display: item.__isHidden ? 'none' : 'block',
            }}
            name={item.name}
            record={ds?.current}
            complementaryWords={complementaryWords}
            isAfterSaveCloseModel
            scriptCacheKey="relTable|MarmotScript"
            showSelectVersion={!isEmpty(relTableSelectVersion)}
            relTableSelectVersion={
              !isEmpty(relTableSelectVersion) ? { ...relTableSelectVersion, textObj: item } : {}
            }
            saveScriptKey={saveScriptValue}
            marmotScriptInput={inputContent}
            testParam={{
              saveScriptKey: saveScriptValue,
              debugTenantNum,
            }}
            beforeOpenModal={(coverPropsFnc) => {
              coverPropsFnc({
                record: ds.current,
              });
            }}
            onSave={(...arg) => {
              ds.current.set(`${item.name}Input`, arg[2].inputContent);
            }}
          />
        );
      }
      case undefined:
        return null;
      default:
        return <TextField name={item.name} {...componentProps} />;
    }
  };

  return (
    <div className="relTable-component-form-wrapper">
      <Form dataSet={dataSet} labelLayout="float">
        {formItems.map((item) => renderFormItem(item, dataSet))}
      </Form>
    </div>
  );
}

export default TableEditModal;

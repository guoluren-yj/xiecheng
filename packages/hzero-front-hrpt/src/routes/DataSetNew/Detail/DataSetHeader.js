import React, { useMemo } from 'react';
import {
  Form,
  TextField,
  Lov,
  Switch,
  Select,
  CodeArea,
  IntlField,
  NumberField,
} from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';

// 引入 json lint
import 'choerodon-ui/pro/lib/code-area/lint/json';
import 'codemirror/addon/display/autorefresh';
// import 'choerodon-ui/pro/lib/code-area/lint/javascript';
import 'codemirror/addon/lint/javascript-lint';
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/clike/clike';
import 'codemirror/theme/material.css';
import 'codemirror/theme/mbo.css'; // 代码框背景颜色
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';
// 所在行高亮
import 'codemirror/addon/selection/active-line';
// 折叠代码
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/comment-fold.js';
// 代码补全
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/sql-hint.js';
import 'codemirror/addon/edit/matchbrackets.js'; // 括号匹配
import 'codemirror/addon/edit/closebrackets.js'; // 括号补全
// 全屏 支持浏览器全屏搜索
import 'codemirror/addon/display/fullscreen.css';
import 'codemirror/addon/display/fullscreen.js';
// 类型推断
import 'codemirror/addon/tern/tern.js';
import 'codemirror/addon/tern/tern.css';
import 'codemirror/addon/tern/worker.js';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import styles from './index.less';

const DataSetHeader = observer(({ formDs }) => {
  const codeAreaOptions = useMemo(() => {
    return {
      mode: 'text/x-sql',
      lineNumbers: true,
      lineWrapping: true,
      styleActiveLine: true,
      matchBrackets: true,
      autoRefresh: true,
      extraKeys: { Ctrl: 'autocomplete' }, // ctrl唤起智能提示
      foldGutter: true,
      gutters: [
        'CodeMirror-lint-markers',
        'CodeMirror-linenumbers',
        'CodeMirror-foldgutter',
        'CodeMirror-focused',
      ], // 顺序不同 效果也不同
      autoCloseBrackets: true, // 括号补全
      theme: 'mbo',
    };
  }, []);

  return (
    <>
      <Form columns={3} labelLayout="float" dataSet={formDs} className={styles.form}>
        <TextField name="datasetCode" restrict="0-9A-Za-z-._" />
        <IntlField name="datasetName" />
        <IntlField name="remark" />
        <Lov name="tenantId" tableProps={{ selectionMode: 'rowbox' }} />
        <Select name="datasetType" />
        <Switch name="enabledFlag" />
        {!formDs.current ||
          (formDs.current.get('datasetType') === 'URL' && (
            <TextField
              colSpan={2}
              name="sqlText"
              label={intl.get('hrpt.reportDataSet.view.title.url').d('url')}
            />
          ))}
        {!formDs.current || (formDs.current.get('datasetType') === 'SCRIPT_SQL' && (<NumberField name="limitCount" />))}
        <Lov name='datasource' hidden={!formDs.current || formDs.current.get('datasetType') === 'URL'} />
      </Form>
      {formDs.current && formDs.current.get('datasetType') !== 'URL' && (
        <div className={styles['header-code-area']}>
          <Form dataSet={formDs} labelLayout="vertical" layout="none">
            <Row>
              <Col span={24}>
                <Form.Item
                  name="sqlText"
                  label={intl.get('hrpt.reportDataSet.model.reportDataSet.sqlText').d('SQL语句')}
                >
                  <CodeArea name="sqlText" options={codeAreaOptions} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      )}
    </>
  );
});

export default DataSetHeader;

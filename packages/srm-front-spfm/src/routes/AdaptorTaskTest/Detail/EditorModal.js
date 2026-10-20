/**
 * jsEditorModal.js
 * 适配器js编辑器
 * @date: 2020-08-13
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect } from 'react';
import { CodeArea, Button, Table, Row, Modal } from 'choerodon-ui/pro';
import { Card, Tooltip, Collapse } from 'choerodon-ui';
import crypto from 'crypto-js';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { queryScriptConfig, testScript } from '@/services/adaptorTaskService';

// 引入格式化器
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import { JSHINT } from 'jshint';
import jsonlint from 'jsonlint-mod';
import JSFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSFormatter';
import marmotImg from '../../../assets/marmot.png';
import VersionSpan from './VersionSpan';
import styles from './EditorModal.less';
// 引入 json lint
import 'choerodon-ui/pro/lib/code-area/lint/json';
import 'codemirror/addon/display/autorefresh';
// import 'choerodon-ui/pro/lib/code-area/lint/javascript';
import 'codemirror/addon/lint/javascript-lint';
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/material.css';

import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';

window.JSHINT = JSHINT;
window.jsonlint = jsonlint;
const jsonOptions = {
  mode: { name: 'javascript', json: true },
  lineWrapping: true,
  autoRefresh: true,
}; // 代码框的 json 的配置信息
const jsOptions = {
  name: 'javascript',
  lineWrapping: true,
  autoRefresh: true,
  lint: { esversion: 10 },
}; // 代码框的 js 的配置信息
const { Panel } = Collapse;
const modalKey = Modal.key();

function EditorModal(props = {}) {
  const {
    inputEntityCode,
    outputEntityCode,
    scriptVersion,
    bindRoutePrefix,
    debugTenantNum,
  } = props.queryParam;
  const { inputEntityDs, outputEntityDs, inputJsonDs, scriptOutputDs, helpDs } = props;
  const { scriptCodeDs } = props;

  const columns = [
    {
      name: 'name',
      width: 300,
    },
    {
      name: 'description',
    },
  ];

  const onTestScript = () => {
    const { param } = inputJsonDs.toData()[0];
    const { script } = scriptCodeDs.toData()[0];
    try {
      const param2Json = JSON.parse(param);
      testScript({
        inputEntityCode,
        outputEntityCode,
        scriptVersion,
        debugTenantNum,
        bindRoutePrefix,
        body: {
          script: crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(script)),
          param: param2Json,
        },
      }).then((res) => {
        if (getResponse(res)) {
          scriptOutputDs.current.set('output', res.result);
        }
      });
    } catch (error) {
      notification.error({
        message: intl
          .get('spfm.adaptorTaskDetail.view.error.debugger')
          .d('调试数据有误，请修改后再次调试'),
      });
    }
  };

  const showHelpMsg = () => {
    const { msg = '' } = helpDs.current.toData();
    Modal.open({
      key: modalKey,
      title: intl.get('spfm.adaptorTaskDetail.view.modal.title').d('帮助信息'),
      children: <div style={{ whiteSpace: 'pre-line' }}>{msg}</div>,
      style: { width: 700 },
      closable: true,
      footer: null,
    });
  };

  useEffect(() => {
    queryScriptConfig({
      inputEntityCode,
      outputEntityCode,
    }).then((res) => {
      if (getResponse(res)) {
        inputEntityDs.loadData(res.inputDefinitionList);
        outputEntityDs.loadData(res.outputDefinitionList);
        inputJsonDs.create({ param: res.mockInput });
        helpDs.create({ msg: res.readme });
      }
    });
  }, []);

  return (
    <div className={styles.adaptorEditor}>
      <div className="adaptor-editor-content">
        <div className="editor-left">
          <Card
            className="editor-left-scriptContent"
            // title={(
            //   <span className='editor-left-scriptContent-version'>
            //     {/* {intl.get('spfm.adaptorTaskDetail.view.title.scriptContent').d('脚本代码')} */}
            //     {scriptVersion && <VersionSpan description='MarmotScript' value={scriptVersion} bgColor='#f28040' /> }
            //   </span>
            // )}
          >
            {scriptVersion && (
              <VersionSpan description="MarmotScript" value={scriptVersion} bgColor="#f28040" />
            )}
            <CodeArea
              dataSet={scriptCodeDs}
              name="script"
              options={jsOptions}
              format={JSFormatter}
              style={{ height: 800 }}
            />
            <img src={marmotImg} className="edit-left-scriptContent-codeArea-img" alt="marmot" />
          </Card>
        </div>
        <div className="edit-action-button">
          <Row>
            <Tooltip title={intl.get('spfm.adaptorTaskDetail.view.modal.title').d('帮助信息')}>
              <Button icon="help" funcType="flat" shape="circle" onClick={() => showHelpMsg()} />
            </Tooltip>
          </Row>
          <Row>
            <Tooltip
              title={intl.get('spfm.adaptorTaskDetail.view.action.tooltip').d('点击测试脚本')}
            >
              <Button onClick={onTestScript} icon="bug_report" funcType="flat" shape="circle" />
            </Tooltip>
          </Row>
        </div>
        <div className="editor-right">
          <Collapse accordion>
            <Panel
              header={intl.get('spfm.adaptorTaskDetail.view.title.inputParam').d('输入结构')}
              key="1"
            >
              <Table
                className="editor-right-param-table"
                columns={columns}
                dataSet={inputEntityDs}
              />
            </Panel>
          </Collapse>
          <Collapse accordion>
            <Panel
              header={intl.get('spfm.adaptorTaskDetail.view.title.outputParam').d('输出结构')}
              key="1"
            >
              <Table
                className="editor-right-param-table"
                columns={columns}
                dataSet={outputEntityDs}
              />
            </Panel>
          </Collapse>
          <Card
            className="editor-right-inputJson"
            title={intl.get('spfm.adaptorTaskDetail.view.title.inputJson').d('测试json字段名')}
          >
            <CodeArea
              name="param"
              dataSet={inputJsonDs}
              options={jsonOptions}
              format={JSONFormatter}
              style={{ height: 245 }}
            />
          </Card>
          <Card
            className="editor-right-outputJson"
            title={intl.get('spfm.adaptorTaskDetail.view.title.outputJson').d('输出结果')}
          >
            <CodeArea
              dataSet={scriptOutputDs}
              name="output"
              format={JSONFormatter}
              style={{ height: 245 }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EditorModal;

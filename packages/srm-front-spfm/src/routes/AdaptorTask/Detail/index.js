/**
 * index.js
 * 适配器列表详情
 * @date: 2020-08-13
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { useEffect, useState } from 'react';
import { Table, DataSet, Button, Form, Lov, TextField, Modal, Select } from 'choerodon-ui/pro';
import crypto from 'crypto-js';
import qs from 'querystring';
import { omit, isNil } from 'lodash';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import EditorModal from './EditorModal';
import { getAdaptorTaskHeadDs, getAdaptorTaskLineDs } from '../store/taskDetailDs';
import { queryAdaptorTask, saveAdaptorTask, fetchOutput } from '@/services/adaptorTaskService';

const editorModalKey = Modal.key();

function TaskDetail(props = {}) {
  const { headerId: urlHeaderId } = qs.parse(props.history.location.search.substr(1));
  const { taskHeadDs, taskLineDs } = props.valueDs;
  const [editFlag, handleEditFlag] = useState(true);
  const [headerId, handleHeaderId] = useState(urlHeaderId || undefined);
  const [output, handleOutput] = useState({});

  const fields = [
    {
      name: 'name',
      type: 'string',
      label: intl.get('spfm.adaptorTaskDetail.model.param.name').d('字段名'),
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get('spfm.adaptorTaskDetail.model.param.description').d('描述'),
    },
  ];

  const inputEntityDs = new DataSet({
    selection: false,
    paging: false,
    fields,
  });

  const outputEntityDs = new DataSet({
    selection: false,
    paging: false,
    fields,
  });

  const inputJsonDs = new DataSet({
    fields: [
      {
        name: 'param',
        type: 'string',
      },
    ],
  });

  const scriptOutputDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'output',
        type: 'string',
      },
    ],
  });

  const helpDs = new DataSet({
    fields: [
      {
        name: 'msg',
        type: 'string',
      },
    ],
  });

  const queryHeadLineInfo = (id) => {
    queryAdaptorTask({
      headerId: id,
    }).then((res) => {
      if (getResponse(res)) {
        const headerData = headerId ? res : omit(res, ['applyTenantName', 'applyTenantNum']);
        const lineData = res.adaptorTaskLines;
        taskHeadDs.loadData([headerData]);
        taskLineDs
          .getField('resultInvokeLov')
          .set('lovPara', { runningService: headerData.runningService });
        if (headerId) {
          handleEditFlag(!res.enabled);
          taskLineDs.loadData(lineData);
        } else {
          lineData.forEach((li) => {
            taskLineDs.create(li);
          });
        }
        fetchOutput({ taskCode: res.taskCode }).then((response) => {
          if (getResponse(response)) {
            handleOutput({
              entityCode: response.outputCode,
              entityName: response.outputCodeMeaning,
            });
          }
        });
      }
    });
  };

  const scriptCodeDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'script',
        type: 'string',
        defaultValue: crypto.enc.Utf16.stringify(
          crypto.enc.Base64.parse(
            '/v8AZgB1AG4AYwB0AGkAbwBuACAAcAByAG8AYwBlAHMAcwAoACAAaQBuAHAAdQB0ACAAKQB7AAoAIAAgACAAcgBlAHQAdQByAG4AIAB7ACAAIgByAGUAcwB1AGwAdAAiADoAIgBoAGUAbABsAG8AIAB3AG8AcgBsAGQAIQAiAH0ACgB9AAo='
          )
        ),
      },
    ],
  });

  useEffect(() => {
    if (headerId !== undefined) {
      queryHeadLineInfo(headerId);
    } else {
      taskHeadDs.create();
    }
  }, [headerId]);

  const setRunningService = (record = {}) => {
    taskHeadDs.current.set('runningService', record && record.service ? record.service : undefined);
    taskHeadDs.current.set('inputEntity', {
      entityCode: isNil(record) ? undefined : record.inputCode,
      entityName: isNil(record) ? undefined : record.inputCodeMeaning,
    });
    taskLineDs
      .getField('resultInvokeLov')
      .set('lovPara', { runningService: record && record.service ? record.service : undefined });
  };

  const saveAction = () => {
    taskHeadDs.validate().then((headerRes) => {
      taskLineDs.validate().then((lineRes) => {
        if (headerRes && lineRes) {
          const header = omit(taskHeadDs.current.toJSONData(), [
            'applyTenant',
            'inputEntity',
            'task',
            `${headerId === undefined ? 'id' : ''}`,
          ]);
          const lines = taskLineDs.toJSONData();
          const saveData = {
            ...header,
            adaptorTaskLines: lines.map((line) =>
              omit(line, [
                'outputEntity',
                'resultInvokeLov',
                `${headerId === undefined ? 'id' : ''}`,
              ])
            ),
          };
          saveAdaptorTask(saveData).then((res) => {
            if (getResponse(res)) {
              notification.success();
              if (headerId !== res.id) {
                handleHeaderId(res.id);
              } else {
                queryHeadLineInfo(res.id);
              }
            }
          });
        }
      });
    });
  };

  const setScriptData = (record, resolve) => {
    const { script } = scriptCodeDs.toData()[0];
    if (editFlag) {
      record.set('scriptContent', crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(script)));
    }
    resolve();
  };

  const handleEditor = (record = {}) => {
    const { outputEntityCode, scriptContent, bindRoutePrefix, debugTenantNum } = record.toData();
    const { inputEntityCode, scriptVersion } = taskHeadDs.toData()[0];
    if (scriptContent) {
      scriptCodeDs.current.set(
        'script',
        crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(scriptContent))
      );
    }
    const otherModalOptions = editFlag ? {} : { footer: null };
    if (outputEntityCode) {
      Modal.open({
        key: editorModalKey,
        title: intl.get('spfm.adaptorTaskDetail.modal.header.title').d('脚本编辑器'),
        children: (
          <EditorModal
            queryParam={{
              inputEntityCode,
              outputEntityCode,
              scriptVersion,
              bindRoutePrefix,
              debugTenantNum,
            }}
            scriptCodeDs={scriptCodeDs}
            inputEntityDs={inputEntityDs}
            outputEntityDs={outputEntityDs}
            inputJsonDs={inputJsonDs}
            scriptOutputDs={scriptOutputDs}
            helpDs={helpDs}
          />
        ),
        closable: true,
        destroyOnClose: true,
        fullScreen: true,
        onOk: () => new Promise((resolve) => setScriptData(record, resolve)),
        onClose: () => {
          // 清除所有ds
          scriptCodeDs.reset();
          inputEntityDs.reset();
          outputEntityDs.reset();
          inputJsonDs.reset();
          scriptOutputDs.reset();
          helpDs.reset();
        },
        ...otherModalOptions,
      });
    } else {
      notification.warning({
        message: intl.get('spfm.adaptorTaskDetail.view.message.waring').d('请选择输入结构！'),
      });
    }
  };

  const beforeBack = () => {
    taskHeadDs.reset();
    taskLineDs.loadData([]);
  };

  const handleCopyAdaptorTask = ({ value }) => {
    queryHeadLineInfo(value.id);
  };

  const copyAdaptorTaskDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'copyAdaptorTask',
        type: 'object',
        lovCode: 'SADA.ADAPTOR_TASK',
      },
    ],
    events: {
      update: handleCopyAdaptorTask,
    },
  });

  const columns = [
    {
      name: 'priority',
      width: 100,
      editor: editFlag,
    },
    {
      name: 'description',
      editor: editFlag,
    },
    {
      name: 'script',
      type: 'string',
      width: 120,
      renderer: ({ record }) => (
        <span className="action-link">
          <a
            onClick={() => {
              handleEditor(record);
            }}
          >
            {intl.get('spfm.adaptorTaskDetail.view.message.script').d('脚本代码')}
          </a>
        </span>
      ),
    },
    {
      name: 'outputEntity',
      width: 200,
      // editor: editFlag,
    },
    {
      name: 'resultInvokeLov',
      width: 200,
      editor: () => {
        const { scriptVersion } = taskHeadDs.current.toData();
        return scriptVersion === '3' ? false : editFlag;
      },
    },
  ];

  const addLine = () => {
    if (isNil(headerId)) {
      notification.info({
        message: intl.get('spfm.adaptorTaskDetail.view.line.add').d('请先保存头数据'),
      });
    } else {
      taskLineDs.create({
        outputEntity: output,
      });
    }
  };

  const buttons = [
    <Button onClick={() => addLine()} icon="add">
      {intl.get('hzero.common.button.add').d('添加')}
    </Button>,
    'remove',
  ];

  return (
    <React.Fragment>
      <Header
        title={intl.get('spfm.adaptorTaskDetail.view.header.title').d('适配器详情')}
        backPath="/spfm/adaptor-task/list"
        onBack={() => {
          beforeBack();
        }}
      >
        {editFlag && (
          <Button color="primary" onClick={() => saveAction()}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        )}
        {headerId === undefined && (
          <Lov
            dataSet={copyAdaptorTaskDs}
            name="copyAdaptorTask"
            mode="button"
            clearButton={false}
            placeholder={intl
              .get('spfm.adaptorTaskDetail.model.placeholder.replicationAdapter')
              .d('复制适配器')}
          />
        )}
      </Header>
      <Content>
        <Form columns={3} dataSet={taskHeadDs}>
          <Lov name="applyTenant" disabled={!isNil(headerId)} />
          <Lov
            name="task"
            disabled={!isNil(headerId)}
            onChange={(record) => {
              setRunningService(record);
            }}
          />
          <TextField name="description" disabled={!editFlag} />
          <Lov name="inputEntity" disabled />
          <TextField name="runningService" disabled />
          <Select name="scriptVersion" disabled={!isNil(headerId)} />
        </Form>
        <Table
          dataSet={taskLineDs}
          columns={columns}
          buttons={editFlag ? buttons : []}
          selectionMode={editFlag ? 'rowbox' : 'none'}
        />
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: [
    'spfm.adaptorTask',
    'spfm.adaptorTaskDetail',
    'hzero.common',
    'spfm.configServer',
    'entity.tenant',
  ],
})(
  withProps(
    () => {
      const taskHeadDs = new DataSet(getAdaptorTaskHeadDs());
      const taskLineDs = new DataSet(getAdaptorTaskLineDs());
      const valueDs = {
        taskHeadDs,
        taskLineDs,
      };
      return { valueDs };
    },
    { cacheState: true }
  )(TaskDetail)
);

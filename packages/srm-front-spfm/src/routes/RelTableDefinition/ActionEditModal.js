/**
 * 配置表定义 - 定义动作
 * ActionEditModal.js
 * @date: 2021-12-6
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useMemo } from 'react';
import { Table, DataSet, Button, Modal } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { SRM_ADAPTOR } from '_utils/config';

import MarmotScriptButton from '@/components/MarmotScript/MarmotScriptButton';
import ActionEditForm from './ActionEditForm';
import {
  updateRelTableDefinitionActionTable,
  saveRelTableDefinitionActionTable,
  deleteRelTableDefinitionActionTable,
} from '@/services/relTableDefinitionService';

const modalKey = Modal.key();

function ActionEditModal(props) {
  const { definitionId, tenantNum } = props;

  const actionTableDs = useMemo(() => {
    return new DataSet({
      fields: [
        {
          name: 'type',
          label: intl.get('spfm.relTableDefinition.model.relTableDefinitionAction.type').d('类型'),
          type: 'string',
          lookupCode: 'SPFM.REL_TABLE_ACTION.TYPE',
          required: true,
        },
        {
          name: 'position',
          label: intl
            .get('spfm.relTableDefinition.model.relTableDefinitionAction.position')
            .d('位置'),
          type: 'string',
          computedProps: {
            lookupCode: ({ record }) =>
              record.get('type') === 'TRIGGER'
                ? 'SPFM.REL_TABLE_ACTION.TRIGGER.POSITION'
                : 'SPFM.REL_TABLE_ACTION.BUTTON.POSITION',
            label: ({ record }) => (record.get('type') === 'TRIGGER' ? '触发位置' : '按钮位置'),
          },
          required: true,
        },
        {
          name: 'script',
          label: intl
            .get('spfm.relTableDefinition.model.relTableDefinitionAction.script')
            .d('脚本'),
          type: 'string',
        },
        {
          name: 'event',
          label: intl.get('spfm.relTableDefinition.model.relTableDefinitionAction.event').d('事件'),
          type: 'string',
          lookupCode: 'SPFM.REL_TABLE_ACTION.BUTTON.EVENT',
          computedProps: {
            required: ({ record }) => record.get('type') === 'LINE_BUTTON',
          },
        },
        {
          name: 'name',
          label: intl
            .get('spfm.relTableDefinition.model.relTableDefinitionAction.name')
            .d('按钮名称'),
          type: 'string',
          computedProps: {
            required: ({ record }) => record.get('type') === 'LINE_BUTTON',
          },
        },
        {
          name: 'description',
          label: intl
            .get('spfm.relTableDefinition.model.relTableDefinitionAction.description')
            .d('描述'),
          type: 'string',
          required: true,
        },
        {
          name: 'action',
          label: intl.get('hzero.common.table.column.option').d('操作'),
          type: 'string',
        },
      ],
      selection: false,
      paging: false,
      autoQuery: true,
      events: {
        update: ({ record, name }) => {
          if (name === 'type') {
            record.set('position', '');
            record.set('event', '');
            record.set('name', '');
            record.set('description', '');
            record.getField('script').reset();
          }
        },
      },
      transport: {
        read({ data }) {
          return {
            url: `${SRM_ADAPTOR}/v1/rel-table-actions`,
            method: 'GET',
            data: {
              definitionId,
              ...data,
            },
          };
        },
        update: ({ data }) => {
          return {
            url: `${SRM_ADAPTOR}/v1/rel-table-actions`,
            method: 'PUT',
            data: data[0],
          };
        },
      },
    });
  }, [definitionId]);

  const columns = [
    {
      name: 'type',
      width: 100,
    },
    {
      name: 'position',
      width: 100,
    },
    {
      name: 'script',
      width: 100,
      renderer: ({ record }) => {
        const debugTenantNum = tenantNum;
        const titleKeyCode = record.get('type') || '';
        return (
          <MarmotScriptButton
            name="script"
            scriptCacheKey="relTableDefinitionAction|MarmotScript"
            showSelectVersion="relTableAction"
            titleKeyCode={titleKeyCode}
            testParam={{
              debugTenantNum,
            }}
            record={record}
            onSave={(resolve, ...arg) => {
              actionTableDs.submit().finally(() => {
                resolve(false);
                if (arg[3]) {
                  arg[3](false);
                }
              });
            }}
            onClose={() => {
              actionTableDs.query();
            }}
          />
        );
      },
    },
    {
      name: 'name',
      width: 150,
    },
    {
      name: 'description',
      width: 200,
    },
    {
      name: 'action',
      width: 100,
      renderer: ({ record }) => (
        <span className="action-link">
          <a
            onClick={() => {
              editAction(record);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
          <a
            onClick={() => {
              deleteAction(record);
            }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
        </span>
      ),
    },
  ];

  const deleteAction = (record) => {
    Modal.confirm({
      title: intl.get('spfm.configServer.view.message.ifClean').d('确认删除？'),
      onOk: () => {
        const requestData = record.toJSONData();
        deleteRelTableDefinitionActionTable(requestData).then((res) => {
          if (getResponse(res)) {
            notification.success();
            actionTableDs.query();
          }
        });
      },
    });
  };

  const saveAction = ({ record, resolve }) => {
    const requestData = record.toJSONData();
    const requestAction = requestData.id
      ? updateRelTableDefinitionActionTable
      : saveRelTableDefinitionActionTable;
    actionTableDs.validate().then((validateFlag) => {
      if (validateFlag) {
        requestAction({ definitionId, ...requestData }).then((res) => {
          if (getResponse(res)) {
            notification.success();
            actionTableDs.query();
            resolve();
          } else {
            actionTableDs.reset();
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
  };

  const editAction = (record) => {
    const debugTenantNum = tenantNum;
    Modal.open({
      key: modalKey,
      closable: true,
      movable: false,
      drawer: true,
      destroyOnClose: true,
      style: { width: 600 },
      title: intl.get('spfm.relTableDefinition.view.modal.title.action').d('维护触发/动作'),
      children: <ActionEditForm ds={record} debugTenantNum={debugTenantNum} />,
      onOk: () => new Promise((resolve) => saveAction({ record, resolve })),
      onCancel: () => {
        actionTableDs.reset();
      },
    });
  };

  const createAction = () => {
    actionTableDs.create();
    const record = actionTableDs.current;
    record.set(
      'script',
      '/v8AZgB1AG4AYwB0AGkAbwBuACAAcAByAG8AYwBlAHMAcwAoACAAaQBuAHAAdQB0ACAAKQB7AAoAIAAgACAAcgBlAHQAdQByAG4AIAB7ACAAIgByAGUAcwB1AGwAdAAiADoAIgBoAGUAbABsAG8AIAB3AG8AcgBsAGQAIQAiAH0ACgB9'
    );
    editAction(record);
  };

  const buttons = [
    <Button icon="playlist_add" onClick={() => createAction()} key="add">
      {intl.get('hzero.common.button.create').d('新建')}
    </Button>,
  ];

  return <Table dataSet={actionTableDs} columns={columns} buttons={buttons} />;
}

export default ActionEditModal;

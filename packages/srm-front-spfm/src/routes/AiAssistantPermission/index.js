import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  DataSet,
  Button,
  Form,
  TextField,
  Lov,
  CheckBox,
  Modal,
  Table,
  Spin,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { SRM_PLATFORM } from '_utils/config';
import { isTenantRoleLevel, getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { saveAiAssistant } from '@/services/aiAssistantPermissionService';
import QueryBarMore from '../../components/QueryBarMore';

const renderQueryBar = prop => {
  return <QueryBarMore {...prop} />;
};

// ============================
//  新建/编辑 Modal 表单内容
// ============================

function AiAssistantPermissionForm({ modal, record, onRefresh }) {
  const [loading] = useState(false);

  /**
   * 提交保存
   */
  const handleSubmit = useCallback(async () => {
    const isValid = await record.validate();
    if (!isValid) return;
    if (!record.dirty) {
      modal.close();
      return;
    }
    const jsonData = record.toJSONData();
    const { roleList, aiAssistantInfo, ...others } = jsonData;
    const params = {
      ...others,
    };
    if (roleList) {
      params.roleIdList = roleList.map(m => m.id);
    }
    if (aiAssistantInfo) {
      params.aiAssistantInfo = JSON.stringify(aiAssistantInfo);
    }
    const result = await saveAiAssistant(params);
    if (getResponse(result)) {
      onRefresh();
      notification.success();
      modal.close();
    }
  }, [record, modal]);

  /**
   * 更新 Modal footer
   */
  useEffect(() => {
    modal.update({
      footer: () => (
        <div>
          <Button
            onClick={() => {
              modal.close();
            }}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button color="primary" onClick={handleSubmit}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
      ),
    });
  }, [modal, handleSubmit]);

  return (
    <Spin spinning={loading}>
      <Form record={record} columns={1} labelLayout="float">
        <Lov name="aiAssistantInfo" />
        <TextField name="aiAssistantCode" />
        <Lov name="roleList" />
        <CheckBox name="aiAssistantShowFlag" />
      </Form>
    </Spin>
  );
}

// ============================
//  主页面
// ============================

function AiAssistantPermission() {
  const isTenantRole = isTenantRoleLevel();
  /**
   * 列表 DataSet
   */
  const tableDs = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        selection: false,
        primaryKey: 'id',
        fields: [
          {
            name: 'aiAssistantCode',
            type: 'string',
            label: intl.get('spfm.aiAssistantPermission.model.aiAssistantCode').d('AI助手编码'),
            required: true,
            disabled: true,
            bind: 'aiAssistantInfo.skillCode',
          },
          {
            name: 'aiAssistantName',
            type: 'string',
            label: intl.get('spfm.aiAssistantPermission.model.aiAssistantName').d('AI助手名称'),
            bind: 'aiAssistantInfo.skillName',
          },
          {
            name: 'aiAssistantInfo',
            type: 'object',
            label: intl.get('spfm.aiAssistantPermission.model.aiAssistant').d('AI助手'),
            required: true,
            lovCode: 'SPFM.AI_ASSISTANT_SKILL',
            textField: 'skillName',
            valueField: 'skillCode',
            optionsProps: {
              paging: false,
            },
            transformResponse: (value, record) => {
              const { aiAssistantCode, aiAssistantName } = record;
              if (value) {
                try {
                  return {
                    ...JSON.parse(value),
                    skillName: aiAssistantName,
                  };
                } catch {
                  return { skillCode: aiAssistantCode, skillName: aiAssistantName };
                }
              }
              return { skillCode: aiAssistantCode, skillName: aiAssistantName };
            },
          },
          {
            name: 'aiAssistantShowFlag',
            type: 'boolean',
            label: intl.get('spfm.aiAssistantPermission.model.showInAiAssistant').d('AI助手中显示'),
            trueValue: 1,
            falseValue: 0,
            defaultValue: 1,
          },
          {
            name: 'roleList',
            type: 'object',
            label: intl.get('spfm.aiAssistantPermission.model.assignRole').d('分配角色'),
            required: true,
            multiple: true,
            textField: 'name',
            valueField: 'id',
            lovCode: 'HIAM.TENANT.ROLE',
          },
        ],
        queryFields: [
          {
            name: 'aiAssistantCode',
            type: 'string',
            label: intl.get('spfm.aiAssistantPermission.model.aiAssistantCode').d('AI助手编码'),
          },
          {
            name: 'aiAssistantName',
            type: 'string',
            label: intl.get('spfm.aiAssistantPermission.model.aiAssistantName').d('AI助手名称'),
          },
          {
            name: 'role',
            type: 'object',
            ignore: 'always',
            label: intl.get('spfm.aiAssistantPermission.model.role').d('角色'),
            textField: 'name',
            valueField: 'id',
            lovCode: 'HIAM.TENANT.ROLE',
          },
          {
            name: 'roleId',
            type: 'string',
            hidden: true,
            bind: 'role.id',
          },
        ],
        transport: {
          read: ({ params }) => ({
            url: isTenantRole
              ? `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/ai-assistant-permissions/list`
              : `${SRM_PLATFORM}/v1/ai-assistant-permissions/list`,
            method: 'GET',
            params,
          }),
          destroy: ({ data }) => {
            const { id } = data[0];
            return {
              url: isTenantRole
                ? `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/ai-assistant-permissions/${id}`
                : `${SRM_PLATFORM}/v1/ai-assistant-permissions/${id}`,
              method: 'DELETE',
            };
          },
        },
      }),
    []
  );

  /**
   * 打开新建/编辑 Modal
   */
  const handleOpenModal = useCallback(
    record => {
      const isCreate = !record;
      const title = isCreate
        ? intl.get('spfm.aiAssistantPermission.title.create').d('新建AI助手权限')
        : intl.get('spfm.aiAssistantPermission.title.edit').d('编辑AI助手权限');
      const formRecord = isCreate ? tableDs.create({}) : record;
      let refresh = false;

      Modal.open({
        key: Modal.key(),
        title,
        style: { width: 380 },
        border: true,
        drawer: true,
        destroyOnClose: true,
        closable: true,
        onClose() {
          tableDs.reset();
          if (refresh) {
            tableDs.query();
          }
        },
        children: (
          <AiAssistantPermissionForm
            record={formRecord}
            onRefresh={() => {
              refresh = true;
            }}
          />
        ),
      });
    },
    [tableDs]
  );

  /**
   * 删除确认
   */
  const handleDelete = useCallback(
    record => {
      return tableDs.delete(record);
    },
    [tableDs]
  );

  /**
   * 表格列定义
   */
  const columns = useMemo(
    () => [
      {
        name: 'aiAssistantCode',
        minWidth: 160,
      },
      {
        name: 'aiAssistantInfo',
        minWidth: 200,
      },
      {
        name: 'roleList',
        minWidth: 300,
      },
      {
        name: 'aiAssistantShowFlag',
        width: 140,
      },
      {
        name: 'operator',
        width: 160,
        header: intl.get('hzero.common.action').d('操作'),
        renderer: ({ record }) => (
          <span className="action-link">
            <Button funcType="link" color="primary" onClick={() => handleOpenModal(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>
            <Button funcType="link" color="primary" onClick={() => handleDelete(record)}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          </span>
        ),
        lock: 'right',
      },
    ],
    [handleOpenModal, handleDelete]
  );

  return (
    <>
      <Header
        title={intl
          .get('spfm.aiAssistantPermission.view.title.aiAssistantPermission')
          .d('AI助手权限管理')}
      >
        <Button color="primary" icon="add" onClick={() => handleOpenModal()}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content>
        <Table
          dataSet={tableDs}
          columns={columns}
          border
          queryBar={renderQueryBar}
          filter={record => record.status !== 'add'}
        />
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['hzero.common', 'spfm.aiAssistantPermission'],
})(observer(AiAssistantPermission));

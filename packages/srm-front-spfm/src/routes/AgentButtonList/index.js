/**
 * AgentButtonList - Agent 按钮列表管理
 * 参考数字员工管理，以表格形式展示 Agent 按钮，支持新建/编辑/删除
 * @date: 2026-05-22
 * @version: 0.0.1
 */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  DataSet,
  Button,
  Form,
  TextField,
  IntlField,
  Modal,
  Icon,
  Table,
  Spin,
  IconPicker,
} from 'choerodon-ui/pro';
import { Tag } from 'hzero-ui';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { CODE_LOWER } from 'utils/regExp';
import notification from 'utils/notification';
import { SRM_PLATFORM } from '_utils/config';
import { isTenantRoleLevel, getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { saveAgentButton } from '@/services/agentButtonListService';
import QueryBarMore from '../../components/QueryBarMore';
import styles from './index.less';

const renderQueryBar = prop => {
  return <QueryBarMore {...prop} />;
};

// ============================
//  新建/编辑 Modal 表单内容
// ============================

function AgentButtonForm({ modal, record, onRefresh }) {
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
    const result = await saveAgentButton(jsonData);
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
        <TextField name="buttonCode" />
        <IntlField name="buttonName" />
        <IconPicker name="buttonIcon" />
        <TextField name="buttonRoute" />
      </Form>
    </Spin>
  );
}

// ============================
//  主页面
// ============================

function AgentButtonList() {
  const isTenantRole = isTenantRoleLevel();
  /**
   * 列表 DataSet
   */
  const tableDs = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        selection: false,
        primaryKey: 'agentButtonId',
        fields: [
          {
            name: 'buttonCode',
            type: 'string',
            label: intl.get('spfm.agentButtonList.model.buttonCode').d('按钮编码'),
            required: true,
            pattern: CODE_LOWER,
            defaultValidationMessages: {
              patternMismatch: intl
                .get('hzero.common.validation.codeLower')
                .d('全小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
            },
            computedProps: {
              disabled: ({ record }) => !!record.get('agentButtonId'),
            },
          },
          {
            name: 'buttonName',
            type: 'intl',
            label: intl.get('spfm.agentButtonList.model.buttonName').d('按钮名称'),
            required: true,
          },
          {
            name: 'buttonIcon',
            type: 'string',
            label: intl.get('spfm.agentButtonList.model.buttonIcon').d('按钮图标'),
            required: true,
          },
          {
            name: 'buttonRoute',
            type: 'string',
            label: intl.get('spfm.agentButtonList.model.buttonRoute').d('按钮路由'),
            required: true,
          },
          {
            name: 'tenantId',
            label: intl.get('hzero.common.source').d('来源'),
          },
        ],
        queryFields: [
          {
            name: 'buttonCode',
            type: 'string',
            label: intl.get('spfm.agentButtonList.model.buttonCode').d('按钮编码'),
          },
          {
            name: 'buttonName',
            type: 'string',
            label: intl.get('spfm.agentButtonList.model.buttonName').d('按钮名称'),
          },
        ],
        transport: {
          read: ({ params }) => ({
            url: isTenantRole
              ? `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/agent-button-infos/list`
              : `${SRM_PLATFORM}/v1/agent-button-infos/list`,
            method: 'GET',
            params,
          }),
          destroy: ({ data }) => {
            const { agentButtonId } = data[0];
            return {
              url: isTenantRole
                ? `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/agent-button-infos/${agentButtonId}`
                : `${SRM_PLATFORM}/v1/agent-button-infos/${agentButtonId}`,
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
        ? intl.get('spfm.agentButtonList.title.create').d('新建Agent按钮')
        : intl.get('spfm.agentButtonList.title.edit').d('编辑Agent按钮');
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
          <AgentButtonForm
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
        name: 'buttonCode',
        minWidth: 160,
      },
      {
        name: 'buttonName',
        minWidth: 200,
      },
      {
        name: 'buttonIcon',
        width: 100,
        align: 'center',
        renderer: ({ value }) =>
          value ? (
            <span className={styles['icon-cell']}>
              <Icon type={value} className={styles['icon-cell-inner']} />
            </span>
          ) : null,
      },
      {
        name: 'buttonRoute',
        minWidth: 300,
      },
      {
        name: 'tenantId',
        width: 100,
        hidden: !isTenantRole,
        renderer: ({ value }) => {
          return value !== 0 ? (
            <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
          ) : (
            <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
          );
        },
      },
      {
        name: 'operator',
        width: 160,
        header: intl.get('hzero.common.action').d('操作'),
        renderer: ({ record }) =>
          isTenantRole && record.get('tenantId') === 0 ? (
            '-'
          ) : (
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
      <Header title={intl.get('spfm.agentButtonList.view.agentButtonList').d('Agent按钮列表')}>
        <Button color="primary" icon="add" onClick={() => handleOpenModal()}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content className={styles.content}>
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
  code: ['hzero.common', 'spfm.agentButtonList'],
})(observer(AgentButtonList));

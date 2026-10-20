import React from 'react';
import { Button, Input, Form, Modal, Checkbox } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { yesOrNoRender } from 'utils/renderer';

import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { connect } from 'dva';

const FormItem = Form.Item;
@connect(({ loading }) => ({
  setDefaultPurAgentLoading: loading.effects['assignAgent/setDefaultPurAgent'],
}))
export default class UserModal extends React.Component {
  state = {
    selectedRowKeys: [],
    selectRows: [],
    organizationId: getCurrentOrganizationId(),
  };

  @Bind()
  handleSelectTable(keys, rows) {
    this.setState({ selectedRowKeys: keys, selectRows: rows });
  }

  @Bind()
  handleCreate() {
    const { onCreate = (e) => e, selectAgeRecord = {} } = this.props;
    const { purchaseOrgId } = selectAgeRecord;
    onCreate({
      _status: 'create',
      purchaseAgentCode: '',
      purchaseAgentName: '',
      purchaseOrgId,
      purchaseAgentId: uuid(),
    });
  }

  @Bind()
  handleDelete() {
    const { onDelete = (e) => e } = this.props;
    const { selectRows, selectedRowKeys } = this.state;
    onDelete(selectRows, selectedRowKeys);
    this.setState({ selectedRowKeys: [] });
  }

  @Bind()
  handlePagination(pagination) {
    const { onChange = (e) => e } = this.props;
    onChange({ page: pagination });
  }

  @Bind()
  handleCancel() {
    const { onCancel = (e) => e } = this.props;
    this.setState({ selectRows: [], selectedRowKeys: [] });
    onCancel();
  }

  @Bind()
  actionRender(text, record) {
    if (record._status === 'create') {
      return '';
    }
    const editable = this.isEditing(record);
    return (
      <div>
        {editable ? (
          <span>
            <a onClick={() => this.save(record)} style={{ marginRight: 8 }}>
              {intl.get(`hzero.common.button.save`).d('保存')}
            </a>
            <a onClick={() => this.cancel(record.orgAgentId)}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </a>
          </span>
        ) : (
          <a onClick={() => this.edit(record.orgAgentId, record.defaultFlag)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        )}
      </div>
    );
  }

  isEditing = (record) => {
    return record.orgAgentId === this.state.editingKey;
  };

  edit(orgAgentId, defaultFlag) {
    this.setState({ editingKey: orgAgentId, defaultFlag });
  }

  save(record) {
    // 调接口保存
    const { dispatch } = this.props;
    const { defaultFlag } = this.state;
    dispatch({
      type: 'assignAgent/setDefaultPurAgent',
      payload: { ...record, defaultFlag: defaultFlag ? 1 : 0 },
    }).then((res) => {
      if (res) {
        this.setState({ defaultFlag: '', editingKey: '' });
        // 重新拉取数据
        const { onChange = (e) => e } = this.props;
        onChange();
      }
    });
  }

  cancel = () => {
    this.setState({ editingKey: '', defaultFlag: '' });
  };

  onDefaultFlagChange = (e) => {
    this.setState({ defaultFlag: e.target.checked });
  };

  render() {
    const {
      purOrgPagination = {},
      initLoading = false,
      saveLoading = false,
      setDefaultPurAgentLoading = false,
      dataSource = [],
      modalVisible = false,
      onCancel = (e) => e,
      onOk = (e) => e,
      customizeTable,
    } = this.props;
    const { selectedRowKeys, organizationId } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectTable,
    };
    const createList = dataSource.filter((item) => item._status === 'create');
    const columns = [
      {
        title: intl.get('hpfm.purchaseAgent.model.purchaseAgent.purchaseAgentCode').d('采购员编码'),
        width: 120,
        dataIndex: 'purchaseAgentCode',
        render: (value, record) => {
          if (record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('purchaseAgentId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hpfm.purchaseAgent.model.purchaseAgent.purchaseAgentCode')
                          .d('采购员编码'),
                      }),
                    },
                  ],
                  initialValue: record.purchaseAgentId,
                })(
                  <Lov
                    code="SPFM.PURCHASE_AGENT_NOUSER"
                    lovOptions={{
                      displayField: 'purchaseAgentCode',
                      valueField: 'purchaseAgentId',
                    }}
                    queryParams={{ tenantId: organizationId }}
                    textValue={record.purchaseAgentCode}
                    onChange={(text, item) => {
                      record.$form.setFieldsValue({ purchaseAgentName: item.purchaseAgentName });
                      record.$form.getFieldDecorator('purchaseAgentCode', {
                        initialValue: item.purchaseAgentCode,
                      });
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return record.purchaseAgentCode;
          }
        },
      },
      {
        title: intl.get('hpfm.purchaseAgent.model.purchaseAgent.purchaseAgentName').d('采购员名称'),
        width: 120,
        dataIndex: 'purchaseAgentName',
        render: (value, record) => {
          if (record._status === 'create' || record._status === 'update') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('purchaseAgentName', {
                  initialValue: record.purchaseAgentName,
                })(<Input disabled />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('hpfm.purchaseAgent.model.purchaseAgent.defalutFlag').d('是否默认采购员'),
        width: 120,
        dataIndex: 'defaultFlag',
        render: (val, record) =>
          this.isEditing(record) && record._status !== 'create' ? (
            <Checkbox checked={this.state.defaultFlag} onChange={this.onDefaultFlagChange} />
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        dataIndex: 'option',
        render: this.actionRender,
      },
    ];
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        width={620}
        title={intl.get('hpfm.purchaseOrg.model.org.purchaseAgent').d('指定采购员')}
        visible={modalVisible}
        confirmLoading={saveLoading}
        onCancel={this.handleCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>,
          <Button
            loading={saveLoading}
            type="primary"
            key="save"
            disabled={createList.length === 0}
            onClick={onOk}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 12 }}>
          <Button icon="plus" style={{ marginRight: 10 }} onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button onClick={this.handleDelete} icon="delete" disabled={selectedRowKeys.length === 0}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        </div>
        {customizeTable(
          {
            code: 'SPFM_ORG-INFO_PURCHASE_ORG.PURCHASEAGENT',
          },
          <EditTable
            bordered
            rowSelection={rowSelection}
            loading={initLoading || setDefaultPurAgentLoading}
            rowKey="purchaseAgentId"
            columns={columns}
            dataSource={dataSource}
            pagination={purOrgPagination}
            onChange={this.handlePagination}
          />
        )}
      </Modal>
    );
  }
}

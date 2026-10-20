/*
 * PointAndMethodModal - 启用索赔单审批定义审批节点和方式 Modal
 * @date: 2020-4-1
 * @author: JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Modal, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, omit, isFunction } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';

import EditTable from 'components/EditTable';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import styles from './index.less';

const FormItem = Form.Item;
@connect(({ loading, configServer }) => ({
  configServer,
  fetching: loading.effects['configServer/fetchPointAndMethod'],
  saving: loading.effects['configServer/savePointAndMethod'],
  deleting: loading.effects['configServer/deletePointAndMethod'],
  configing: loading.effects['configServer/saveSettings'],
}))
export default class PointAndMethodModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // dataSource: [],
      selectedRowKeys: [],
      tenantId: getCurrentOrganizationId(),
    };
  }

  // componentDidMount() {
  //   this.handleSearch();
  // }

  /**
   * 新建审批规则
   * @param {Number} shieldSupId
   */
  @Bind()
  handleCreate() {
    const { dataSource, onState } = this.props;
    const newLine = {
      approveConfigId: uuid(),
      _status: 'create',
    };
    onState('pointAndMethodData', [newLine, ...dataSource]);
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { tenantId } = this.state;
    const { dataSource, dispatch, onSearch, onClearError } = this.props;
    const editTable = getEditTableData(dataSource, ['approveConfigId', '_status']).map(item => ({
      tenantId,
      ...item,
    }));
    if (isArray(editTable) && !isEmpty(editTable)) {
      dispatch({
        type: 'configServer/savePointAndMethod',
        payload: editTable,
      }).then(res => {
        if (res) {
          notification.success();
          onSearch();
          onClearError();
        }
      });
    }
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  hideModal() {
    const { onState } = this.props;
    if (isFunction(onState)) {
      onState('pointAndMethodVisible', false);
    }
  }

  /**
   * 选中
   * @param {Array} selectedRowKey 选中数据数组
   */
  @Bind()
  handleChangeSelectRowKeys(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { selectedRowKeys } = this.state;
    const { dispatch, dataSource, onSearch } = this.props;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`spfm.configServer.view.message.ifClean`).d('确认删除？'),
      onOk: () => {
        dataSource.forEach(item => {
          if (!selectedRowKeys.includes(item.approveConfigId)) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          dispatch({
            type: 'configServer/deletePointAndMethod',
            payload: deleteList,
          }).then(res => {
            if (res) {
              onSearch();
              const noUpdateLine = newDataSource.every(item => item._status === 'create');
              this.resetConfig(newDataSource, noUpdateLine);
            }
          });
        } else this.resetConfig(newDataSource);
        this.setState({ selectedRowKeys: [] });
      },
    });
  }

  // 删除后勾选框置空
  @Bind()
  resetConfig(data, noUpdateLine) {
    const { onResetCheckBox, onState } = this.props;
    if (isEmpty(data) || noUpdateLine) {
      notification.success({
        message: intl
          .get(`spfm.configServer.view.quality.cancel010702`)
          .d('未定义索赔单审批配置，已自动取消勾选'),
      });
      this.hideModal();
      onResetCheckBox('010702', 0);
    } else {
      notification.success();
      onState('pointAndMethodData', data);
    }
  }

  render() {
    const {
      fetching,
      saving,
      deleting,
      visible = false,
      dataSource = [],
      configServer: { enumMap = {} },
    } = this.props;
    const { selectedRowKeys } = this.state;
    const { claimApprovalPoints = [], claimApprovalMethods = [] } = enumMap;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleChangeSelectRowKeys,
    };
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.configServer.approvalPoint`).d('审批节点'),
        dataIndex: 'approvalPointCode',
        width: 250,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`approvalPointCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.configServer.model.configServer.approvalPoint`)
                        .d('审批节点'),
                    }),
                  },
                ],
                initialValue: record.approvalPointCode,
              })(
                <Select showSearch style={{ width: '100%' }} allowClear>
                  {claimApprovalPoints.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spfm.configServer.model.configServer.approvalMethod`).d('审批方式'),
        dataIndex: 'approvalMethodCode',
        width: 250,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`approvalMethodCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.configServer.model.configServer.approvalMethod`)
                        .d('审批方式'),
                    }),
                  },
                ],
                initialValue: record.approvalMethodCode,
              })(
                <Select showSearch style={{ width: '100%' }} allowClear>
                  {claimApprovalMethods.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
    const editTableProps = {
      loading: fetching || saving || deleting,
      columns,
      dataSource,
      rowSelection,
      pagination: false,
      bordered: true,
      rowKey: 'approveConfigId',
    };
    return (
      <Modal
        title={
          <div>
            {intl
              .get(`spfm.configServer.view.message.modal.claimApprovalConfig`)
              .d('索赔单审批配置')}
          </div>
        }
        visible={visible}
        onCancel={this.hideModal}
        width={600}
        footer={null}
        wrapClassName={styles['purchase-requisition-approval-config']}
      >
        <div className="header" style={{ textAlign: 'right' }}>
          <Button
            onClick={this.handleDelete}
            loading={deleting}
            disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
            style={{ marginRight: '8px' }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button
            onClick={this.handleSave}
            loading={saving}
            disabled={isArray(dataSource) && isEmpty(dataSource)}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button type="primary" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>
        <EditTable {...editTableProps} />
      </Modal>
    );
  }
}

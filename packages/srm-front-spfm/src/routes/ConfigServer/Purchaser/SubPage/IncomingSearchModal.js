/*
 * IncomingSearchModal - 定义「引用质检单创建」查询条件 Modal
 * @date: 2020-5-8
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
  fetching: loading.effects['configServer/fetchIncomingSearch'],
  saving: loading.effects['configServer/saveIncomingSearch'],
  deleting: loading.effects['configServer/deleteIncomingSearch'],
}))
export default class IncomingSearchModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      selectedRowKeys: [],
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchIncomingSearch',
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.map(item => ({ ...item, _status: 'update' })),
        });
      }
    });
  }

  /**
   * 新建审批规则
   * @param {Number} shieldSupId
   */
  @Bind()
  handleCreate() {
    const { dataSource } = this.state;
    const newLine = {
      searchConfigId: uuid(),
      _status: 'create',
    };
    this.setState({
      dataSource: [newLine, ...dataSource],
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { dataSource, tenantId } = this.state;
    const { dispatch } = this.props;
    const editTable = getEditTableData(dataSource, ['searchConfigId', '_status']).map(item => ({
      tenantId,
      ...item,
      decisionResult: isArray(item.decisionResult)
        ? item.decisionResult.join()
        : item.decisionResult,
    }));
    if (isArray(editTable) && !isEmpty(editTable)) {
      dispatch({
        type: 'configServer/saveIncomingSearch',
        payload: editTable,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSearch();
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
      onState('incomingSearchVisible', false);
    }
  }

  /**
   * 改变主键
   * @param {Array} selectedRowKeys 选中数据数组
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
    const { selectedRowKeys, dataSource } = this.state;
    const { dispatch } = this.props;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`spfm.configServer.view.message.ifClean`).d('确认删除？'),
      onOk: () => {
        dataSource.forEach(item => {
          const { decisionResult } = item;
          if (!selectedRowKeys.includes(item.searchConfigId)) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push({
              ...omit(item, ['$form']),
              decisionResult: isArray(decisionResult) ? decisionResult.join() : decisionResult,
            });
          }
        });
        if (!isEmpty(deleteList)) {
          dispatch({
            type: 'configServer/deleteIncomingSearch',
            payload: deleteList,
          }).then(res => {
            if (res) {
              notification.success();
              this.setState({ selectedRowKeys: [], dataSource: newDataSource });
            }
          });
        } else {
          this.setState({ selectedRowKeys: [], dataSource: newDataSource });
        }
      },
    });
  }

  render() {
    const {
      fetching,
      saving,
      deleting,
      visible = false,
      configServer: { enumMap = {} },
    } = this.props;
    const { dataSource = [], selectedRowKeys } = this.state;
    const { assessmentResults = [], decisionResults = [] } = enumMap;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleChangeSelectRowKeys,
    };
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.configServer.orderSeq`).d('序号'),
        dataIndex: 'orderSeq',
        width: 80,
        render: (_, record, index) => index + 1,
      },
      {
        title: intl.get(`spfm.configServer.model.configServer.assessmentResult`).d('评估结果'),
        dataIndex: 'assessmentResult',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`assessmentResult`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.configServer.model.configServer.assessmentResult`)
                        .d('评估结果'),
                    }),
                  },
                ],
                initialValue: record.assessmentResult,
              })(
                <Select showSearch style={{ width: '100%' }} allowClear>
                  {assessmentResults.map(item => (
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
        title: intl.get(`spfm.configServer.model.configServer.decisionResult`).d('决策结果'),
        dataIndex: 'decisionResult',
        width: 250,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`decisionResult`, {
                initialValue: val ? val.split(',') : [],
              })(
                <Select showSearch style={{ width: '100%' }} allowClear mode="multiple">
                  {decisionResults
                    .filter(
                      item => item.parentValue === record.$form.getFieldValue('assessmentResult')
                    )
                    .map(item => (
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
      rowKey: 'searchConfigId',
    };
    return (
      <Modal
        title={
          <div>
            {intl
              .get(`spfm.configServer.view.message.modal.IncomingSearchConfig`)
              .d('定义「引用质检单创建」查询条件')}
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
            style={{ marginRight: '8px' }}
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

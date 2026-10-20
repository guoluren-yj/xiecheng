/**
 * VariableConfigDrawer - 变量配置抽屉
 * @date: 2019-07-30
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Button, Form, InputNumber, Input, Select, Modal, Switch } from 'hzero-ui';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { getEditTableData, addItemToPagination } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';

import styles from './index.less';

const FormItem = Form.Item;

@connect(({ processAppoint, loading }) => ({
  processAppoint,
  queryVariableLoading: loading.effects['processAppoint/queryVariableConfig'],
  saveVariableLoading: loading.effects['processAppoint/saveVariableConfig'],
  deleteVariableLoading: loading.effects['processAppoint/deleteVariableConfig'],
}))
@formatterCollections({ code: ['swfl.processAppoint'] })
export default class VariableConfigDrawer extends Component {
  state = {
    selectedRows: [],
    selectedRowKeys: [],
  };

  componentDidMount() {
    this.handleVariableConfig();
    this.handleType();
  }

  /**
   * 查询字段类型
   */
  @Bind()
  handleType() {
    const { dispatch } = this.props;
    const lovCodes = {
      type: 'SWFL.FIELD_TYPE',
    };
    dispatch({
      type: 'processAppoint/init',
      payload: { lovCodes },
    });
  }

  /**
   * 选中项发生变化时的回调
   */
  @Bind()
  handleSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 变量名称lov改变时的回调
   */
  @Bind()
  handleVariableChange(record, lovRecord) {
    record.$form.setFieldsValue({ description: lovRecord.description });
  }

  /**
   * 查询变量配置列表
   */
  @Bind()
  handleVariableConfig(params = {}) {
    const { dispatch, procAssignConfId } = this.props;
    dispatch({
      type: 'processAppoint/queryVariableConfig',
      payload: {
        ...params,
        procAssignConfId,
      },
    });
  }

  @Bind()
  handlePagination(pagination) {
    this.handleVariableConfig({
      page: pagination,
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleVariableAdd() {
    const {
      dispatch,
      processAppoint: { variableConfigList, variableConfigPagination },
    } = this.props;
    dispatch({
      type: 'processAppoint/updateState',
      payload: {
        variableConfigList: [
          { _status: 'create', variableConfId: uuidv4() },
          ...variableConfigList,
        ],
        variableConfigPagination: addItemToPagination(
          variableConfigList.length,
          variableConfigPagination
        ),
      },
    });
  }

  /**
   * 编辑/取消
   */
  @Bind()
  handleEdit(record, flag) {
    const {
      dispatch,
      processAppoint: { variableConfigList },
    } = this.props;
    const newList = variableConfigList.map((item) => {
      if (item.variableConfId === record.variableConfId) {
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'processAppoint/updateState',
      payload: {
        variableConfigList: newList,
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleVariableSave() {
    const {
      dispatch,
      procAssignConfId,
      processAppoint: { variableConfigList },
    } = this.props;
    const tableValues = getEditTableData(variableConfigList, ['variableConfId', '_status']);

    if (!isEmpty(tableValues)) {
      dispatch({
        type: 'processAppoint/saveVariableConfig',
        payload: {
          procAssignConfId,
          procAssignVarConfs: tableValues,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleVariableConfig();
        }
      });
    }
  }

  /**
   * 删除已有数据(调接口删除)
   */
  @Bind()
  handleRowsDelete(existRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'processAppoint/deleteVariableConfig',
      payload: existRows,
    }).then((res) => {
      if (res) {
        this.setState({
          selectedRowKeys: [],
        });
        notification.success();
        this.handleVariableConfig();
      }
    });
  }

  /**
   * 删除新建数据(前端数据更新)
   */
  @Bind()
  handleUpdateState(newList) {
    const { dispatch } = this.props;
    dispatch({
      type: 'processAppoint/updateState',
      payload: {
        variableConfigList: newList,
      },
    });
    this.setState({
      selectedRowKeys: [],
    });
    notification.success();
  }

  /**
   * 确认删除框
   */
  @Bind()
  handleDeleteConfirm(onOk) {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleVariableDelete() {
    const {
      dispatch,
      processAppoint: { variableConfigList },
    } = this.props;
    const { selectedRows } = this.state;
    // 获取selectedRows中的新建行
    const newRows = selectedRows.filter((item) => item._status === 'create');
    // 获取新建行的variableConfId
    const newRowsKeys = newRows.map((item) => item.variableConfId);
    // 获取selectedRows中的现有行
    const existRows = selectedRows.filter((item) => item._status !== 'create');
    // 在variableConfigList中排除selectedRows中的新建行
    const newList = variableConfigList.filter((item) => !newRowsKeys.includes(item.variableConfId));

    if (isEmpty(newRows)) {
      this.handleDeleteConfirm(() => this.handleRowsDelete(existRows));
    } else if (isEmpty(existRows)) {
      this.handleDeleteConfirm(() => this.handleUpdateState(newList));
    } else {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
        onOk: () => {
          dispatch({
            type: 'processAppoint/deleteVariableConfig',
            payload: existRows,
          }).then((res) => {
            if (res) {
              this.handleUpdateState(newList);
              this.handleVariableConfig();
            }
          });
        },
      });
    }
  }

  render() {
    const {
      visible,
      onClose,
      queryVariableLoading,
      saveVariableLoading,
      deleteVariableLoading,
      procAssignConfId,
      processAppoint: {
        variableConfigList,
        variableConfigPagination,
        code: { type = [] },
      },
    } = this.props;
    const { selectedRowKeys } = this.state;
    const columns = [
      {
        title: intl.get(`swfl.processAppoint.model.variableConfig.variableNumber`).d('序号'),
        dataIndex: 'orderSeq',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('orderSeq', {
                initialValue: record.orderSeq,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`swfl.processAppoint.model.variableConfig.variableNumber`)
                        .d('序号'),
                    }),
                  },
                ],
              })(<InputNumber min={0} style={{ width: '100%' }} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('swfl.processAppoint.model.variableConfig.variableName').d('变量名称'),
        dataIndex: 'variableName',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('variableId', {
                initialValue: record.variableId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('swfl.processAppoint.model.variableConfig.variableName')
                        .d('变量名称'),
                    }),
                  },
                ],
              })(
                <Lov
                  disabled={['update'].includes(record._status)}
                  code="SWFL.PROCESS_ASSIGN_VARIABLE"
                  textValue={record.variableName}
                  queryParams={{ procAssignConfId }}
                  onChange={(_, lovRecord) => this.handleVariableChange(record, lovRecord)}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('swfl.processAppoint.model.variableConfig.variableDescribe').d('变量描述'),
        dataIndex: 'description',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('description', {
                initialValue: record.description,
              })(<Input disabled dbc2sbc={false} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('swfl.processAppoint.model.variableConfig.variableType').d('字段类型'),
        dataIndex: 'variableFieldTypeMeaning',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('variableFieldType', {
                initialValue: record.variableFieldType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('swfl.processAppoint.model.variableConfig.variableType')
                        .d('字段类型'),
                    }),
                  },
                ],
              })(
                <Select
                  style={{ width: '100%' }}
                  onChange={() => record.$form.setFieldsValue({ variableValueSource: null })}
                >
                  {type.map((item) => (
                    <Select.Option key={item.orderSeq} value={item.value}>
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
        title: intl.get('swfl.processAppoint.model.variableConfig.variableSource').d('数据来源'),
        dataIndex: 'variableValueSourceName',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('variableValueSource', {
                initialValue: record.variableValueSource,
                rules: [
                  {
                    required: ['LOV', 'SELECT'].includes(
                      record.$form.getFieldValue('variableFieldType')
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('swfl.processAppoint.model.variableConfig.variableSource')
                        .d('数据来源'),
                    }),
                  },
                ],
              })(
                <Lov
                  textValue={record.variableValueSourceName}
                  disabled={
                    !['LOV', 'SELECT'].includes(record.$form.getFieldValue('variableFieldType'))
                  }
                  code={
                    record.$form.getFieldValue('variableFieldType') === 'LOV'
                      ? 'SPFM.LOV.LOV_VIEW_CODE.ORG'
                      : 'HPFM.LOV.LOV_DETAIL_CODE.ORG'
                  }
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('swfl.processAppoint.model.variableConfig.variableWidth').d('宽度'),
        dataIndex: 'variableColumnWidth',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('variableColumnWidth', {
                initialValue: record.variableColumnWidth || 150,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('swfl.processAppoint.model.variableConfig.variableWidth')
                        .d('宽度'),
                    }),
                  },
                ],
              })(<InputNumber min={0} style={{ width: '100%' }} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hwfp.common.model.categories.isQueryFlag').d('是否作为查询条件'),
        dataIndex: 'searchFlag',
        width: 150,
        render: (val, record) => {
          if (!['create', 'update'].includes(record._status)) {
            return yesOrNoRender(val);
          }
          return (
            <FormItem>
              {record.$form.getFieldDecorator('searchFlag', {
                initialValue: val,
              })(<Switch checkedValue={1} unCheckedValue={0} />)}
            </FormItem>
          );
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        render: (_, record) => {
          return (
            <Fragment>
              {record._status === 'update' && (
                <a onClick={() => this.handleEdit(record, false)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              )}
              {!(record._status === 'update') && !(record._status === 'create') && (
                <a onClick={() => this.handleEdit(record, true)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
            </Fragment>
          );
        },
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectChange,
    };
    return (
      <Modal
        title={intl.get(`swfl.processAppoint.model.button.variableConfig`).d('变量配置')}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        width={700}
        visible={visible}
        confirmLoading={saveVariableLoading}
        onClose={onClose}
        onOk={this.handleVariableSave}
        okText={intl.get('hzero.common.button.ok').d('确定')}
        onCancel={onClose}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Button
            style={{ marginRight: 8 }}
            disabled={isEmpty(selectedRowKeys)}
            onClick={this.handleVariableDelete}
            loading={deleteVariableLoading}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button type="primary" onClick={this.handleVariableAdd}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>

        <EditTable
          bordered
          columns={columns}
          pagination={variableConfigPagination}
          onChange={this.handlePagination}
          rowKey="variableConfId"
          rowSelection={rowSelection}
          loading={queryVariableLoading}
          dataSource={variableConfigList}
          className={styles['variable-config']}
        />
      </Modal>
    );
  }
}

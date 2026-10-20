/**
 * RuleConfigDrawer - 规则配置抽屉
 * @date: 2019-07-30
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { connect } from 'dva';
import { isEmpty, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Modal, Button, Form, Input, Popover, Select, Row, Col, InputNumber } from 'hzero-ui';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { getEditTableData, getCurrentOrganizationId, addItemToPagination } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './index.less';

const FormItem = Form.Item;
const tenantId = getCurrentOrganizationId();
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@connect(({ processAppoint, loading }) => ({
  processAppoint,
  queryRuleLoading: loading.effects['processAppoint/queryRuleConfig'],
  saveRuleLoading: loading.effects['processAppoint/saveRuleConfig'],
  deleteRuleLoading: loading.effects['processAppoint/deleteRuleConfig'],
}))
@formatterCollections({ code: ['swfl.processAppoint'] })
export default class RuleConfigDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      expandForm: false,
    };
  }

  lovRef = {};

  componentWillMount() {
    this.handleVariableConfig();
  }

  componentDidMount() {
    this.handleRuleConfig();
  }

  /**
   * 选中项发生变化时的回调
   */
  @Bind()
  handleSelectedChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 查询变量配置列表
   */
  @Bind()
  handleVariableConfig() {
    const { dispatch, procAssignConfId } = this.props;
    dispatch({
      type: 'processAppoint/queryVariableConfig',
      payload: {
        procAssignConfId,
      },
    }).then((res) => {
      if (res && res.content) {
        const lovCodes = {};
        res.content.forEach((item) => {
          if (item.variableFieldType === 'SELECT') {
            lovCodes[item.variableName] = item.variableValueSource;
          }
        });

        dispatch({
          type: 'processAppoint/init',
          payload: { lovCodes },
        });
      }
    });
  }

  /**
   * 查询规则配置
   */
  @Bind()
  handleRuleConfig(params = {}) {
    const {
      dispatch,
      procAssignConfId,
      form: { getFieldsValue },
    } = this.props;
    const { processDefinitionId, defaultSubmitEmployee, ...data } = getFieldsValue();
    dispatch({
      type: 'processAppoint/queryRuleConfig',
      payload: {
        params: {
          ...params,
          processDefinitionId,
          defaultSubmitEmployee,
          procAssignConfId,
        },
        data,
      },
    });
  }

  @Bind()
  handlePagination(pagination) {
    this.handleRuleConfig({
      page: pagination,
    });
  }

  /**
   * 新建
   */
  @Bind
  handleRuleAdd() {
    const {
      dispatch,
      processAppoint: { ruleConfigList, ruleConfigPagination },
    } = this.props;
    dispatch({
      type: 'processAppoint/updateState',
      payload: {
        ruleConfigList: [{ _status: 'create', procAssignRuleConfId: uuidv4() }, ...ruleConfigList],
        ruleConfigPagination: addItemToPagination(ruleConfigList.length, ruleConfigPagination),
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleRuleSave() {
    const {
      dispatch,
      procAssignConfId,
      processAppoint: { ruleConfigList },
    } = this.props;
    const tableValues = getEditTableData(ruleConfigList, ['procAssignRuleConfId', '_status']);
    if (!isEmpty(tableValues)) {
      const newList = tableValues.map((item) => {
        const newItem = {};
        Object.keys(item).forEach((i) => {
          const newKey = i.replace('%3A', '.');
          newItem[newKey] = item[i];
        });
        const {
          procDefId,
          remark,
          name,
          defaultSubmitEmployee,
          procAssignRuleConfId,
          objectVersionNumber,
          _status,
          ...others
        } = newItem;
        // 流程指定默认流程发起人清除
        if (defaultSubmitEmployee === undefined) {
          others.defaultSubmitEmployeeName = undefined;
        }
        return {
          procDefId,
          remark,
          defaultSubmitEmployee,
          procAssignRuleConfId,
          objectVersionNumber,
          ruleHeader: others,
        };
      });
      dispatch({
        type: 'processAppoint/saveRuleConfig',
        payload: {
          procAssignConfId,
          procAssignRuleList: newList,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleRuleConfig();
        }
      });
    }
  }

  /**
   * 编辑/取消
   */
  @Bind()
  handleEdit(record, flag) {
    const {
      dispatch,
      processAppoint: { ruleConfigList },
    } = this.props;
    const newList = ruleConfigList.map((item) => {
      if (item.procAssignRuleConfId === record.procAssignRuleConfId) {
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'processAppoint/updateState',
      payload: {
        ruleConfigList: newList,
      },
    });
  }

  /**
   * 删除已有数据(调接口删除)
   */
  @Bind()
  handleRowsDelete(existRows = []) {
    const { dispatch } = this.props;
    dispatch({
      type: 'processAppoint/deleteRuleConfig',
      payload: existRows,
    }).then((res) => {
      if (res) {
        this.setState({
          selectedRowKeys: [],
        });
        notification.success();
        this.handleRuleConfig();
      }
    });
  }

  /**
   * 删除新建数据(前端数据更新)
   */
  @Bind()
  handleUpdateState(newList = []) {
    const { dispatch } = this.props;
    dispatch({
      type: 'processAppoint/updateState',
      payload: {
        ruleConfigList: newList,
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
  handleRuleDelete() {
    const {
      dispatch,
      processAppoint: { ruleConfigList },
    } = this.props;
    const { selectedRows } = this.state;
    // 获取selectedRows中的新建行
    const newRows = selectedRows.filter((item) => item._status === 'create');
    // 获取新建行的procAssignRuleConfId
    const newRowsKeys = newRows.map((item) => item.procAssignRuleConfId);
    // 获取selectedRows中的现有行
    const existRows = selectedRows.filter((item) => item._status !== 'create');
    // 在ruleConfigList中排除selectedRows中的新建行
    const newList = ruleConfigList.filter(
      (item) => !newRowsKeys.includes(item.procAssignRuleConfId)
    );

    if (isEmpty(newRows)) {
      this.handleDeleteConfirm(() => this.handleRowsDelete(existRows));
    } else if (isEmpty(existRows)) {
      this.handleDeleteConfirm(() => this.handleUpdateState(newList));
    } else {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
        onOk: () => {
          dispatch({
            type: 'processAppoint/deleteRuleConfig',
            payload: existRows,
          }).then((res) => {
            if (res) {
              this.handleUpdateState(newList);
              this.handleRuleConfig();
            }
          });
        },
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  @Bind()
  renderFieldComponent(field) {
    const {
      processAppoint: { code },
    } = this.props;
    const {
      variableName,
      variableFieldType,
      variableFieldTypeMeaning,
      variableValueSource,
    } = field;
    let componentType = 'TEXT';
    if (variableFieldType.includes('NUMBER') || variableFieldTypeMeaning.includes('NUMBER')) {
      componentType = 'NUMBER';
    } else if (variableFieldType.includes('LOV') || variableFieldTypeMeaning.includes('LOV')) {
      componentType = 'LOV';
    } else if (
      variableFieldType.includes('SELECT') ||
      variableFieldTypeMeaning.includes('SELECT')
    ) {
      componentType = 'SELECT';
    }
    switch (componentType) {
      case 'LOV':
        return <Lov code={variableValueSource} allowClear />;
      case 'SELECT':
        return (
          <Select allowClear>
            {code[variableName] &&
              code[variableName].map((n) => (
                <Select.Option key={n.orderSeq} value={n.value}>
                  {n.meaning}
                </Select.Option>
              ))}
          </Select>
        );
      case 'NUMBER':
        return <InputNumber allowClear />;
      case 'TEXT':
      default:
        return <Input allowClear />;
    }
  }

  @Bind()
  renderForm() {
    const {
      procAssignConfId,
      form: { getFieldDecorator },
      processAppoint: { variableConfigList },
    } = this.props;
    const { expandForm } = this.state;
    const queryFields =
      variableConfigList && variableConfigList.length > 0
        ? variableConfigList
            .filter((v) => v.searchFlag === 1)
            .sort((a, b) => a.orderSeq - b.orderSeq)
        : [];
    const hasQueryFields = queryFields.length > 0;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row>
          <Col span={16}>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('swfl.processAppoint.model.ruleConfig.process').d('流程')}
                >
                  {getFieldDecorator('processDefinitionId')(
                    <Lov
                      code="SWFL.PROCESS_DEFINITION"
                      queryParams={{ procAssignId: procAssignConfId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('swfl.processAppoint.model.ruleConfig.defaultSubmitUserId')
                    .d('默认流程发起人')}
                >
                  {getFieldDecorator('defaultSubmitEmployee')(
                    <Lov
                      code="HWFP.EMPLOYEE"
                      queryParams={{ tenantId, enabledFlag: 1 }}
                      lovOptions={{ displayField: 'name' }}
                    />
                  )}
                </FormItem>
              </Col>
              {expandForm &&
                queryFields.map((field) => (
                  <Col span={12}>
                    <FormItem {...formItemLayout} label={field.description}>
                      {getFieldDecorator(field.variableConfId)(this.renderFieldComponent(field))}
                    </FormItem>
                  </Col>
                ))}
            </Row>
          </Col>
          <Col span={8} className="search-btn-more">
            <FormItem>
              {hasQueryFields && (
                <Button onClick={this.toggleForm}>
                  {expandForm
                    ? intl.get('hzero.common.button.collected').d('收起查询')
                    : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                </Button>
              )}
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={() => this.handleRuleConfig()}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      visible,
      onClose,
      procAssignConfId,
      queryRuleLoading,
      saveRuleLoading,
      deleteRuleLoading,
      processAppoint: { variableConfigList, ruleConfigList, ruleConfigPagination, code },
    } = this.props;
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectedChange,
    };
    const existColumns = [
      {
        title: intl.get('swfl.processAppoint.model.ruleConfig.process').d('流程'),
        dataIndex: 'name',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('procDefId', {
                initialValue: record.procDefId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('swfl.processAppoint.model.ruleConfig.process').d('流程'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SWFL.PROCESS_DEFINITION"
                  queryParams={{ procAssignId: procAssignConfId }}
                  textValue={record.name}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl
          .get('swfl.processAppoint.model.ruleConfig.defaultSubmitUserId')
          .d('默认流程发起人'),
        dataIndex: 'defaultSubmitEmployeeName',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('defaultSubmitEmployee', {
                initialValue: record.defaultSubmitEmployee,
                rules: [
                  {
                    // required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('swfl.processAppoint.model.ruleConfig.defaultSubmitUserId')
                        .d('默认流程发起人'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="HWFP.EMPLOYEE"
                  queryParams={{ tenantId, enabledFlag: 1 }}
                  textValue={record.defaultSubmitEmployeeName}
                  lovOptions={{ displayField: 'name' }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('swfl.processAppoint.model.ruleConfig.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('remark', {
                initialValue: record.remark,
                rules: [
                  {
                    max: 100,
                    message: intl.get('hzero.common.validation.max', { max: 100 }),
                  },
                ],
              })(<Input defaultValue={record.remark} />)}
            </FormItem>
          ) : (
            <Popover content={val}>{val}</Popover>
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 70,
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
    const newColumns = variableConfigList.map((item) => ({
      title: item.description,
      dataIndex: item.variableName,
      width: 180,
      render: (val, record) =>
        ['create', 'update'].includes(record._status) ? (
          ['LOV', 'SELECT'].includes(item.variableFieldType) ? (
            item.variableFieldType === 'LOV' ? (
              <FormItem>
                {record.$form.getFieldDecorator(`${item.variableName}_describe`, {
                  initialValue: record[`${item.variableName}Desc`],
                })}
                {record.$form.getFieldDecorator(`${item.variableName?.replace(/\./g, '%3A')}`, {
                  initialValue: val,
                })(
                  <Lov
                    ref={(node) => {
                      this.lovRef[`${item.variableConfId}${record.procAssignRuleConfId}`] = node;
                    }}
                    textValue={record[`${item.variableName}Desc`]}
                    code={item.variableValueSource}
                    onChange={() => {
                      record.$form.setFieldsValue({
                        [`${item.variableName}_describe`]: this.lovRef[
                          `${item.variableConfId}${record.procAssignRuleConfId}`
                        ].state.text,
                      });
                    }}
                  />
                )}
              </FormItem>
            ) : (
              <FormItem>
                {record.$form.getFieldDecorator(`${item.variableName}_describe`, {
                  initialValue: record[`${item.variableName}Desc`],
                })}
                {record.$form.getFieldDecorator(`${item.variableName?.replace(/\./g, '%3A')}`, {
                  initialValue: val,
                })(
                  <Select
                    allowClear
                    style={{ width: '100%' }}
                    onChange={(_, Option) => {
                      record.$form.setFieldsValue({
                        [`${item.variableName}_describe`]: Option ? Option.props.children : null,
                      });
                    }}
                  >
                    {code[item.variableName] &&
                      code[item.variableName].map((n) => (
                        <Select.Option key={n.orderSeq} value={n.value}>
                          {n.meaning}
                        </Select.Option>
                      ))}
                  </Select>
                )}
              </FormItem>
            )
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator(`${item.variableName?.replace(/\./g, '%3A')}`, {
                initialValue: val,
              })(<Input defaultValue={val} dbc2sbc={false} />)}
            </FormItem>
          )
        ) : ['LOV', 'SELECT'].includes(item.variableFieldType) ? (
          record[`${item.variableName}Desc`]
        ) : (
          val
        ),
    }));
    const columns = newColumns.concat(existColumns);

    const scrollX = sum(columns.map((n) => (n.width ? n.width : 0)));

    return (
      <Modal
        title={intl.get('swfl.processAppoint.model.button.ruleConfig').d('规则配置')}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        width={1000}
        visible={visible}
        confirmLoading={saveRuleLoading}
        onOk={this.handleRuleSave}
        okText={intl.get('hzero.common.button.ok').d('确定')}
        onCancel={onClose}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        {this.renderForm()}
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Button
            style={{ marginRight: 8 }}
            onClick={this.handleRuleDelete}
            loading={deleteRuleLoading}
            disabled={isEmpty(selectedRowKeys)}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button type="primary" onClick={this.handleRuleAdd}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>
        <EditTable
          bordered
          columns={columns}
          pagination={ruleConfigPagination}
          onChange={this.handlePagination}
          scroll={{ x: scrollX }}
          rowKey="procAssignRuleConfId"
          rowSelection={rowSelection}
          loading={queryRuleLoading}
          dataSource={ruleConfigList}
          className={styles['variable-config']}
        />
      </Modal>
    );
  }
}

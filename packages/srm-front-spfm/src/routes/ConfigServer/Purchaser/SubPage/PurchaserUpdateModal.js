/*
 * PurchaseRequisitionApprovalConfig - 采购申请审批配置弹窗
 * @date: 2019-07-10
 * @author: ZXY <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Input, Modal, Button, Checkbox } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import { isArray, isEmpty } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';

import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import {
  // getCurrentOrganizationId,
  createPagination,
  addItemToPagination,
  delItemsToPagination,
  getEditTableData,
} from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';

import styles from './index.less';

// 初始化通用布局
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

// const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
@connect(({ loading, configServer }) => ({
  configServer,
  loading: loading.effects['configServer/fetchPurchaserUpdateFields'],
  saving: loading.effects['configServer/fetchPurchaserUpdateSave'],
}))
export default class PurchaseRequisitionApprovalConfig extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
      selectedRows: [],
      // tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, form } = this.props;
    const condition = form ? form.getFieldsValue() : null;
    dispatch({
      type: 'configServer/fetchPurchaserUpdateFields',
      payload: { page, ...condition },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content.map((item) => ({ ...item, _status: 'update' })),
          pagination: createPagination(res),
          // selectedRows: [],
        });
      }
    });
  }

  /**
   * 新建
   * @param {Number} shieldSupId
   */
  @Bind()
  handleCreate() {
    const { dataSource, pagination } = this.state;
    this.setState({
      dataSource: [
        {
          tableNameMeaning: dataSource[0]?.tableNameMeaning,
          tableName: 'SPRM_PR_LINE',
          prChangeConfigId: uuid(),
          isCreate: true,
          attributeFieldFlag: 1,
          canModifyFlag: 1,
          _status: 'create',
        },
        ...dataSource,
      ],
      pagination: addItemToPagination(dataSource.length, pagination),
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { dataSource } = this.state;
    const { dispatch } = this.props;
    const data = getEditTableData(dataSource, ['prChangeConfigId']);
    if (Array.isArray(data) && data.length > 0) {
      dispatch({
        type: 'configServer/fetchPurchaserUpdateSave',
        payload: data,
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearch();
        }
      });
    }
  }

  @Bind()
  handleDelete() {
    const { selectedRows, dataSource, pagination } = this.state;
    const { dispatch } = this.props;
    const createLines = selectedRows
      .filter((ele) => ele._status === 'create')
      .map((ele) => ele.prChangeConfigId);
    const deleLines = selectedRows.filter((ele) => ele._status === 'update');
    if (deleLines.length > 0) {
      dispatch({
        type: 'configServer/deleteFields',
        payload: deleLines,
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearch();
          this.setState({
            selectedRows: [],
          });
        }
      });
    } else if (createLines.length > 0) {
      this.setState({
        dataSource: dataSource.filter((ele) => !createLines.includes(ele.prChangeConfigId)),
        pagination: delItemsToPagination(createLines.length, dataSource.length, pagination),
      });
      this.setState({
        selectedRows: [],
      });
      notification.success();
    }
  }

  @Bind()
  handleSync() {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchPurchaserUpdateSync',
    }).then((res) => {
      if (res) {
        notification.success();
      }
    });
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    this.props.form.resetFields();
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  hideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('purchaserUpdateModalVisible', false);
    }
  }

  /**
   * 改变主键
   * @param {Array} selectedRows 选中数据数组
   */
  @Bind()
  handleChangeSelectRowKeys(_, selectedRows) {
    this.setState({ selectedRows });
  }

  render() {
    const { loading, visible = false, form } = this.props;
    const { dataSource = [], pagination, selectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map((item) => item.prChangeConfigId),
      onChange: this.handleChangeSelectRowKeys,
      getCheckboxProps: (record) => {
        return { disabled: !record.attributeFieldFlag };
      },
    };
    // const excludeRoleIds = dataSource.map(ele => ele.roleId) || [];
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.order.tableName`).d('字段位置'),
        dataIndex: 'tableNameMeaning',
        width: 200,
      },
      {
        title: intl.get(`spfm.configServer.model.purchaserUpdateModal.fieldName`).d('字段名称'),
        dataIndex: 'fieldNameMeaning',
        width: 200,
        render: (value, record) => {
          if (record._status === 'create') {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('fieldName', {
                  initialValue: record.fieldName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.configServer.model.purchaserUpdateModal.fieldName`)
                          .d('字段名称'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SPRM.PR.CHANGE_MODEL_SITE"
                    lovOptions={{ displayField: 'displayName', valueField: 'fieldName' }}
                    textValue={record.fieldNameMeaning}
                  />
                )}
              </Form.Item>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get(`spfm.configServer.model.order.canModifyFlag`).d('允许变更'),
        dataIndex: 'canModifyFlag',
        width: 80,
        render: (_, record) => {
          return (
            <Form.Item {...formItemLayout}>
              {record.$form.getFieldDecorator('canModifyFlag', {
                initialValue: record.canModifyFlag === 1 ? 1 : 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={
                    record.tableName === 'SPRM_PR_HEADER' ||
                    record.extensionFieldFlag === 1 ||
                    record.attributeFieldFlag === 1
                  }
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl
          .get(`spfm.configServer.model.purchaserUpdateModal.requireApproval`)
          .d('变更需要审批'),
        dataIndex: 'purchaseApprovalFlag',
        width: 80,
        render: (_, record) => {
          return (
            <Form.Item {...formItemLayout}>
              {record.$form.getFieldDecorator('purchaseApprovalFlag', {
                initialValue: record.purchaseApprovalFlag === 1 ? 1 : 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={record.tableName === 'SPRM_PR_HEADER'}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl
          .get(`spfm.configServer.model.purchaserUpdateModal.attributeLovCode`)
          .d('个性化值集字段对应值集'),
        dataIndex: 'attributeLovCode',
        width: 250,
        render: (_, record) => {
          if (record.attributeFieldFlag) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('attributeLovCode', {
                  initialValue: record.attributeLovCode,
                })(
                  <Lov
                    code="HPFM.LOV.LOV_DETAIL_CODE.ORG"
                    lovOptions={{ displayField: 'lovCode', valueField: 'lovCode' }}
                    textValue={record.attributeLovCode}
                  />
                )}
              </Form.Item>
            );
          }
        },
      },
    ];
    const editTableProps = {
      loading,
      columns,
      dataSource,
      rowSelection,
      pagination,
      bordered: true,
      rowKey: 'prChangeConfigId',
      onChange: this.handleSearch,
    };

    const deleDisable =
      selectedRows.every((ele) => ele.attributeFieldFlag === 1) && selectedRows.length > 0;
    return (
      <Modal
        title={intl
          .get(`spfm.configServer.view.message.modal.requirementsChangeRuleConfiguration`)
          .d('需求变更规则配置')}
        visible={visible}
        onCancel={this.hideModal}
        width={800}
        footer={
          <Row className="search-btn-more">
            <Form.Item>
              {/* <Button onClick={this.handleSync}>
                {intl.get('spfm.configServer.model.purchaserUpdateModal.sync').d('同步')}
              </Button> */}
              <Button type="primary" onClick={this.handleSave}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </Form.Item>
          </Row>
        }
        // onOk={this.handleSave}
        // okText={intl.get('hzero.common.button.save').d('保存')}
        wrapClassName={styles['purchase-requisition-approval-config']}
      >
        {/* <div className="header" style={{ textAlign: 'right' }}>
          <Button
            onClick={this.handleSave}
            loading={saving || loading}
            type="primary"
            style={{ marginRight: '8px' }}
          >
            {}
          </Button>
        </div> */}
        <Form layout="inline" className="more-fields-search-form">
          <Row {...SEARCH_FORM_ROW_LAYOUT}>
            <Col span={16}>
              <Row {...SEARCH_FORM_ROW_LAYOUT}>
                <Col span={18}>
                  <Form.Item
                    label={intl
                      .get(`spfm.configServer.model.purchaserUpdateModal.fieldName`)
                      .d('字段名称')}
                    {...formItemLayout}
                  >
                    {form.getFieldDecorator('fieldNameMeaning')(<Input />)}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button data-code="reset" onClick={this.handleReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div style={{ marginBottom: '10px' }}>
          <Button type="primary" style={{ marginRight: '8px' }} onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button disabled={!deleDisable} onClick={this.handleDelete}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        </div>
        <EditTable {...editTableProps} />
      </Modal>
    );
  }
}

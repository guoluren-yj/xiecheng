/* eslint-disable array-callback-return */
/**
 * OnlyInvoiceRule - 对账规则设置
 * @date: 2019-2-16
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Drawer, Form, Input, Modal, Row } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';

// import { Content } from 'components/Page';
import EditTable from 'components/EditTable';
import ValueList from 'components/ValueList';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import {
  delItemToPagination,
  addItemToPagination,
  getCurrentOrganizationId,
  getEditTableData,
} from 'utils/utils';

import SupplierList from './supplierList';

@connect(({ loading, onlyInvoiceRule }) => ({
  onlyInvoiceRule,
  tenantId: getCurrentOrganizationId(),
  loading: loading.effects['onlyInvoiceRule/fetchBillRule'],
  saving: loading.effects['onlyInvoiceRule/saveBillRule'],
  deleting: loading.effects['onlyInvoiceRule/deleteBillRule'],
}))
@formatterCollections({
  code: ['sodr.onlyInvoiceRule', 'entity.company', 'entity.supplier'],
})
export default class OnlyInvoiceRule extends Component {
  state = {
    selectedRows: [],
    modalVisible: false,
    activeKey: 'NON_BILL',
    rowKey: 'billRuleId',
    dataListName: 'billRuleList',
    pagination: 'billRulePagination',
  };

  componentDidMount() {
    this.handleTabsChange(this.state.activeKey);
  }

  @Bind()
  fetchBillRule(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'onlyInvoiceRule/fetchBillRule',
      payload: {
        page,
        billRuleType: this.state.activeKey,
      },
    });
  }

  /**
   * 隐藏模态框
   */
  @Bind()
  handleHideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('onlyInvoiceRuleVisible', false);
    }
  }

  /**
   * tabs切换执行
   * @param {String} activeKey 激活面板的key
   */
  @Bind()
  handleTabsChange(activeKey) {
    const {
      onlyInvoiceRule: { billRulePagination = {} },
    } = this.props;
    this.setState({ activeKey }, () => {
      this.fetchBillRule(billRulePagination);
    });
  }

  /**
   * 保存选中的行
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 保存数据
   */
  @Bind()
  handleSave() {
    const { dispatch, onlyInvoiceRule = {} } = this.props;
    const { rowKey, dataListName, pagination, activeKey } = this.state;
    const dataList = getEditTableData(onlyInvoiceRule[dataListName], [rowKey]);
    if (isEmpty(dataList)) return;
    const newDataList = dataList.map((o) => ({ ...o, billRuleType: activeKey }));
    dispatch({
      type: 'onlyInvoiceRule/saveBillRule',
      payload: newDataList,
    }).then((res) => {
      if (res) {
        this.fetchBillRule(onlyInvoiceRule[pagination]);
        notification.success();
      }
    });
  }

  /**
   * 删除对账单规则
   */
  @Bind()
  handleDelete() {
    const { dispatch, onlyInvoiceRule = {} } = this.props;
    const { selectedRows, pagination } = this.state;
    dispatch({
      type: 'onlyInvoiceRule/deleteBillRule',
      payload: selectedRows,
    }).then((res) => {
      if (res) {
        this.setState({ selectedRows: [] });
        this.fetchBillRule(onlyInvoiceRule[pagination]);
        notification.success();
      }
    });
  }

  /**
   * 新建行
   */
  @Bind()
  handleCreateRow() {
    const { dispatch, onlyInvoiceRule = {}, tenantId } = this.props;
    const { rowKey, dataListName, pagination } = this.state;
    dispatch({
      type: 'onlyInvoiceRule/updateState',
      payload: {
        [dataListName]: [
          {
            [rowKey]: uuidv4(),
            _status: 'create', // 新建标记位
            tenantId,
          },
          ...onlyInvoiceRule[dataListName],
        ],
        [pagination]: addItemToPagination(
          onlyInvoiceRule[dataListName].length,
          onlyInvoiceRule[pagination]
        ),
      },
    });
  }

  /**
   * 删除新建行
   */
  @Bind()
  handleDeleteRow(record) {
    const { dispatch, onlyInvoiceRule = {} } = this.props;
    const { rowKey, dataListName, pagination } = this.state;
    const newDataList = onlyInvoiceRule[dataListName].filter(
      (item) => item[rowKey] !== record[rowKey]
    );
    dispatch({
      type: 'onlyInvoiceRule/updateState',
      payload: {
        [dataListName]: newDataList,
        [pagination]: delItemToPagination(
          onlyInvoiceRule[dataListName].length,
          onlyInvoiceRule[pagination]
        ),
      },
    });
  }

  /**
   * 取消编辑行
   */
  @Bind()
  handleCancelRow(record) {
    const { dispatch, onlyInvoiceRule = {} } = this.props;
    const { rowKey, dataListName } = this.state;
    const newDataList = onlyInvoiceRule[dataListName].map((item) => {
      if (item[rowKey] === record[rowKey]) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'onlyInvoiceRule/updateState',
      payload: { [dataListName]: newDataList },
    });
  }

  /**
   * 编辑行
   */
  @Bind()
  handleEditRow(record) {
    const { dispatch, onlyInvoiceRule = {} } = this.props;
    const { rowKey, dataListName } = this.state;
    const newDataList = onlyInvoiceRule[dataListName].map((item) =>
      record[rowKey] === item[rowKey] ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: 'onlyInvoiceRule/updateState',
      payload: { [dataListName]: newDataList },
    });
  }

  /**
   * 打开模态框
   * @param {*} record
   */
  @Bind()
  handleJumpPage(record, type) {
    if (record.companyId) {
      const { activeKey } = this.state;
      const modalTitle =
        activeKey === 'NON_BILL'
          ? intl.get(`sodr.onlyInvoiceRule.view.title.modal.nonBill`).d('无需对账配置')
          : intl.get(`sodr.onlyInvoiceRule.view.title.modal.autoBill`).d('自动对账配置');
      this.setState({ modalVisible: true });
      this.props.dispatch({
        type: 'onlyInvoiceRule/updateState',
        payload: {
          modalProps: { ...record, modalTitle, type },
          ruleDetailList: [],
        },
      });
    }
  }

  @Bind()
  handleSupplierListModal() {
    const { onlyInvoiceRule = {} } = this.props;
    const { pagination } = this.state;
    this.setState({ modalVisible: false }, () => {
      this.fetchBillRule(onlyInvoiceRule[pagination]);
    });
  }

  @Bind()
  onChngeCode(_, lovRecord, record) {
    const { dispatch, onlyInvoiceRule = {} } = this.props;
    const { rowKey, dataListName } = this.state;
    const newDataList = onlyInvoiceRule[dataListName]
      .map((item) => {
        if (record[rowKey] === item[rowKey]) {
          return {
            ...item,
            orderTypeCode: lovRecord.orderTypeCode || null,
            orderTypeId: lovRecord.orderTypeId || null,
            // orderTypeName: lovRecord.orderTypeName,
          };
        }
      })
      .filter((n) => n._status === 'create');
    dispatch({
      type: 'onlyInvoiceRule/updateState',
      payload: { [dataListName]: newDataList },
    });
  }

  renderTable(type) {
    const { loading, onlyInvoiceRule = {}, tenantId } = this.props;
    const { rowKey, dataListName, pagination, selectedRows, activeKey } = this.state;
    const isSave = onlyInvoiceRule[dataListName].filter(
      (o) => o._status === 'create' || o._status === 'update'
    );
    const columns = [
      {
        title: intl.get('sodr.onlyInvoiceRule.model.onlyInvoiceRule.consignmentType').d('业务类型'),
        dataIndex: 'consignmentTypeMeaning',
        width: 200,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <React.Fragment>
                <Form.Item>
                  {getFieldDecorator('consignmentType', {
                    initialValue:
                      record._status === 'create' &&
                      (activeKey === 'AUTO_BILL' || activeKey === 'AUTO_BILL')
                        ? 'STANDARD'
                        : record.consignmentType,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sodr.onlyInvoiceRule.model.onlyInvoiceRule.consignmentType')
                            .d('业务类型'),
                        }),
                      },
                    ],
                  })(
                    <ValueList
                      allowClear
                      lovCode="SFIN.BUSINESS_TYPE"
                      style={{ width: '100%' }}
                      lazyLoad={false}
                      disabled={activeKey === 'AUTO_BILL' || activeKey === 'NOT_BILL'}
                    />
                  )}
                </Form.Item>
              </React.Fragment>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('entity.company.code').d('公司编码'),
        dataIndex: 'companyNum',
        width: 200,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('companyId', {
                  initialValue: record.companyId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('entity.company.code').d('公司编码'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SODR.AUTHORITY_COMPANY_FINAN"
                    textValue={record.companyNum}
                    queryParams={{ billRuleType: activeKey }}
                    disabled={record._status === 'update'}
                    onChange={(_, lovRecord) => {
                      setFieldsValue({
                        companyName: lovRecord.companyName,
                      });
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('entity.company.name').d('公司名称'),
        dataIndex: 'companyName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('companyName', {
                  initialValue: record.companyName,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`sodr.onlyInvoiceRule.model.onlyInvoiceRule.supplierInfo`).d('供应商信息'),
        dataIndex: 'supplierInfo',
        width: 100,
        render: (_, record) => (
          <a disabled={!isEmpty(isSave)} onClick={() => this.handleJumpPage(record, type)}>
            {intl.get(`sodr.onlyInvoiceRule.view.message.supplierList`).d('供应商列表')}
          </a>
        ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 75,
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'create' ? (
              <a
                onClick={() => {
                  this.handleDeleteRow(record);
                }}
              >
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <a
                disabled
                onClick={() => {
                  this.handleCancelRow(record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                disabled
                onClick={() => {
                  this.handleEditRow(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      },
    ];

    const columnsList = [
      {
        title: intl.get('sodr.onlyInvoiceRule.model.onlyInvoiceRule.consignmentType').d('业务类型'),
        dataIndex: 'consignmentTypeMeaning',
        width: 200,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <React.Fragment>
                <Form.Item>
                  {getFieldDecorator('consignmentType', {
                    initialValue:
                      record._status === 'create' &&
                      (activeKey === 'AUTO_BILL' || activeKey === 'NOT_BILL')
                        ? 'STANDARD'
                        : record.consignmentType,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sodr.onlyInvoiceRule.model.onlyInvoiceRule.consignmentType')
                            .d('业务类型'),
                        }),
                      },
                    ],
                  })(
                    <ValueList
                      allowClear
                      lovCode="SFIN.BUSINESS_TYPE"
                      style={{ width: '100%' }}
                      lazyLoad={false}
                      disabled={activeKey === 'AUTO_BILL' || activeKey === 'NOT_BILL'}
                    />
                  )}
                </Form.Item>
              </React.Fragment>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl
          .get('sodr.onlyInvoiceRule.model.onlyInvoiceRule.orderTypeCode')
          .d('采购订单类型编码'),
        dataIndex: 'orderTypeCode',
        width: 200,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            return (
              <React.Fragment>
                <Form.Item style={{ display: 'none' }}>
                  {getFieldDecorator('orderTypeId', {
                    initialValue: record.orderTypeId,
                  })(<div />)}
                </Form.Item>

                <Form.Item>
                  {getFieldDecorator('orderTypeCode', {
                    initialValue: record.orderTypeCode,
                  })(
                    <Lov
                      code="SPUC.ORDER_TYPE"
                      textValue={record.orderTypeCode}
                      lovOptions={{ displayField: 'orderTypeCode', valueField: 'orderTypeCode' }}
                      queryParams={{ billRuleType: activeKey, tenantId }}
                      onChange={(_, lovRecord) => {
                        // this.onChngeCode(_, lovRecord, record);
                        setFieldsValue({
                          orderTypeName: lovRecord.orderTypeName,
                          orderTypeId: lovRecord.orderTypeId,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </React.Fragment>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sodr.onlyInvoiceRule.model.onlyInvoiceRule.orderType').d('采购订单类型'),
        dataIndex: 'orderTypeName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('orderTypeName', {
                  initialValue: record.orderTypeName,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('entity.company.code').d('公司编码'),
        dataIndex: 'companyNum',
        width: 200,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('companyId', {
                  initialValue: record.companyId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('entity.company.code').d('公司编码'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code={
                      activeKey === 'NOT_BILL'
                        ? 'SPUC.CONFIG.NOT_BILL'
                        : 'SODR.AUTHORITY_COMPANY_FINAN'
                    }
                    textValue={record.companyNum}
                    queryParams={{ billRuleType: activeKey }}
                    disabled={record._status === 'update'}
                    onChange={(_, lovRecord) => {
                      setFieldsValue({
                        companyName: lovRecord.companyName,
                      });
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('entity.company.name').d('公司名称'),
        dataIndex: 'companyName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('companyName', {
                  initialValue: record.companyName,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`sodr.onlyInvoiceRule.model.onlyInvoiceRule.supplierInfo`).d('供应商信息'),
        dataIndex: 'supplierInfo',
        width: 100,
        render: (_, record) => (
          <a disabled={!isEmpty(isSave)} onClick={() => this.handleJumpPage(record)}>
            {intl.get(`sodr.onlyInvoiceRule.view.message.supplierList`).d('供应商列表')}
          </a>
        ),
      },
      {
        title: intl.get('sodr.onlyInvoiceRule.model.onlyInvoiceRule.invoiceFlag').d('无需应付'),
        dataIndex: 'invoiceFlag',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('invoiceFlag', {
                  initialValue: record.invoiceFlag,
                })(<Checkbox />)}
              </Form.Item>
            );
          } else {
            return <Checkbox defaultChecked={record.invoiceFlag} disabled />;
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 75,
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'create' ? (
              <a
                onClick={() => {
                  this.handleDeleteRow(record);
                }}
              >
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <a
                onClick={() => {
                  this.handleCancelRow(record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                onClick={() => {
                  this.handleEditRow(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      },
    ];

    const rowSelection = {
      selectedRowKeys: selectedRows.map((o) => o[rowKey]),
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record._status === 'create',
      }),
    };

    return (
      <EditTable
        bordered
        loading={loading}
        rowKey={rowKey}
        dataSource={onlyInvoiceRule[dataListName]}
        columns={activeKey === 'AUTO_BILL' ? columns : columnsList}
        pagination={onlyInvoiceRule[pagination]}
        rowSelection={rowSelection}
        onChange={this.fetchBillRule}
      />
    );
  }

  render() {
    const { visible = false, loading, saving, deleting, onlyInvoiceRule = {} } = this.props;
    const { activeKey, selectedRows, dataListName, modalVisible } = this.state;

    const isSave = onlyInvoiceRule[dataListName].filter(
      (o) => o._status === 'create' || o._status === 'update'
    );
    return (
      <Drawer
        destroyOnClose
        placement="right"
        width={1000}
        onClose={this.handleHideModal}
        visible={visible}
      >
        <React.Fragment>
          <div style={{ marginTop: -18 }}>
            <Tabs activeKey={activeKey} animated={false} onChange={this.handleTabsChange}>
              <Tabs.TabPane
                tab={intl.get(`sodr.onlyInvoiceRule.view.message.tab.nonBill`).d('无需对账')}
                key="NON_BILL"
              >
                <Row>
                  <div style={{ float: 'right', marginBottom: 16 }}>
                    <Button
                      disabled={isEmpty(selectedRows)}
                      loading={deleting || loading}
                      onClick={this.handleDelete}
                    >
                      {intl.get('hzero.common.button.delete').d('删除')}
                    </Button>
                    <Button
                      style={{ marginLeft: 8 }}
                      disabled={isEmpty(isSave)}
                      loading={saving || loading}
                      onClick={this.handleSave}
                    >
                      {intl.get('hzero.common.button.save').d('保存')}
                    </Button>
                    <Button style={{ marginLeft: 8 }} type="primary" onClick={this.handleCreateRow}>
                      {intl.get('hzero.common.button.create').d('新建')}
                    </Button>
                  </div>
                </Row>
                {this.renderTable()}
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get(`sodr.onlyInvoiceRule.view.message.tab.autoBill`).d('自动对账')}
                key="AUTO_BILL"
              >
                <Row>
                  <div style={{ float: 'right', marginBottom: 16 }}>
                    <Button
                      disabled={isEmpty(selectedRows)}
                      loading={deleting || loading}
                      onClick={this.handleDelete}
                    >
                      {intl.get('hzero.common.button.delete').d('删除')}
                    </Button>
                    <Button
                      style={{ marginLeft: 8 }}
                      disabled={isEmpty(isSave)}
                      loading={saving || loading}
                      onClick={this.handleSave}
                    >
                      {intl.get('hzero.common.button.save').d('保存')}
                    </Button>
                    <Button style={{ marginLeft: 8 }} type="primary" onClick={this.handleCreateRow}>
                      {intl.get('hzero.common.button.create').d('新建')}
                    </Button>
                  </div>
                </Row>
                {this.renderTable('AUTO_BILL')}
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get(`sodr.onlyInvoiceRule.view.message.tab.notBill`).d('暂不对账')}
                key="NOT_BILL"
              >
                <Row>
                  <div style={{ float: 'right', marginBottom: 16 }}>
                    <Button
                      disabled={isEmpty(selectedRows)}
                      loading={deleting || loading}
                      onClick={this.handleDelete}
                    >
                      {intl.get('hzero.common.button.delete').d('删除')}
                    </Button>
                    <Button
                      style={{ marginLeft: 8 }}
                      disabled={isEmpty(isSave)}
                      loading={saving || loading}
                      onClick={this.handleSave}
                    >
                      {intl.get('hzero.common.button.save').d('保存')}
                    </Button>
                    <Button style={{ marginLeft: 8 }} type="primary" onClick={this.handleCreateRow}>
                      {intl.get('hzero.common.button.create').d('新建')}
                    </Button>
                  </div>
                </Row>
                {this.renderTable()}
              </Tabs.TabPane>
            </Tabs>
          </div>
          <Modal
            title={intl.get(`sodr.onlyInvoiceRule.view.message.supplierList`).d('供应商列表')}
            destroyOnClose
            width={1000}
            footer={null}
            visible={modalVisible}
            onCancel={this.handleSupplierListModal}
          >
            <SupplierList modalProps={onlyInvoiceRule.modalProps} />
          </Modal>
        </React.Fragment>
      </Drawer>
    );
  }
}

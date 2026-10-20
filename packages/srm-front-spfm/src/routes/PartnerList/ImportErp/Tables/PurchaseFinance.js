/**
 * PurchaseFinance - 采购/财务
 * @date: 2018-11-12
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Button, Form, Input, Row, Col, Select } from 'hzero-ui';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import {
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
  getCurrentOrganizationId,
} from 'utils/utils';

const { Option } = Select;

/**
 * 采购/财务
 * @extends {Component} - Component
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} CreateIndex - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

const organizationId = getCurrentOrganizationId();
@connect(({ importErp, loading }) => ({
  importErp,
  loading: loading.effects['importErp/queryFinance'],
  saving: loading.effects['importErp/saveFinance'],
  deleting: loading.effects['importErp/deleteFinance'],
}))
@Form.create({ fieldNameProp: null })
export default class PurchaseFinance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      newSupplierSyncId: undefined,
      frozenFlag: false,
    };
  }

  componentDidMount() {
    const {
      importErp: { financePagination = {} },
    } = this.props;
    this.handleSearchFinance(financePagination);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'importErp/updateState',
      payload: {
        financeList: [],
        financePagination: {},
      },
    });
  }

  /**
   * 查询采购财务
   * @param {Object} pagination 分页参数
   */
  @Bind()
  handleSearchFinance(pagination = {}) {
    const {
      dispatch,
      modalRecord: { supplierSyncId },
    } = this.props;
    const { newSupplierSyncId } = this.state;
    dispatch({
      type: 'importErp/queryFinance',
      payload: {
        supplierSyncId: newSupplierSyncId || supplierSyncId,
        page: pagination,
        customizeUnitCode: 'SPFM.PARTNER_LIST_IMPORT_SAP.PURCHASE_FINANCE',
      },
    });
  }

  /**
   * 保存选中的行
   * @param {Array} selectedRowKeys
   */
  @Bind()
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 新建行
   */
  @Bind()
  handleCreateRow() {
    const {
      dispatch,
      importErp: { financeList = [], financePagination = {} },
      modalRecord: { supplierSyncId, companyId },
    } = this.props;
    dispatch({
      type: 'importErp/fetchCreateRow',
      payload: { companyId, organizationId },
    });
    const { newSupplierSyncId } = this.state;
    dispatch({
      type: 'importErp/updateState',
      payload: {
        financeList: [
          {
            supplierSyncPfId: uuidv4(),
            frozenFlag: 0,
            supplierSyncId: newSupplierSyncId || supplierSyncId,
            tenantId: organizationId,
            _status: 'create', // 新建标记位
          },
          ...financeList,
        ],
        financePagination: addItemToPagination(financeList.length, financePagination),
      },
    });
    this.setState({
      frozenFlag: false,
    });
  }

  /**
   * 删除新建的行
   * @param {object} record
   */
  @Bind()
  handleDeleteRow(record) {
    const {
      dispatch,
      importErp: { financeList = [], financePagination = {} },
    } = this.props;
    const newFinanceList = financeList.filter(
      (item) => item.supplierSyncPfId !== record.supplierSyncPfId
    );
    dispatch({
      type: 'importErp/updateState',
      payload: {
        financeList: newFinanceList,
        financePagination: delItemToPagination(financeList.length, financePagination),
      },
    });
  }

  /**
   * 批量编辑行
   * @param {object} record 每行数据
   */
  @Bind()
  handleEditRow(record) {
    const {
      importErp: { financeList = [] },
      dispatch,
    } = this.props;
    const newFinanceList = financeList.map((item) =>
      record.supplierSyncPfId === item.supplierSyncPfId ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: 'importErp/updateState',
      payload: { financeList: newFinanceList },
    });
  }

  /**
   * 取消编辑行
   * @param {object} record 行数据
   */
  @Bind()
  handleCancelRow(record) {
    const {
      importErp: { financeList = [] },
      dispatch,
    } = this.props;
    const newFinanceList = financeList.map((item) => {
      if (item.supplierSyncPfId === record.supplierSyncPfId) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'importErp/updateState',
      payload: { financeList: newFinanceList },
    });
  }

  /**
   *保存编辑或者新建的数据
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      importErp: { financeList = [], financePagination = {} },
    } = this.props;
    const payloadData = getEditTableData(financeList, ['supplierSyncPfId']);
    if (isEmpty(payloadData)) return;
    dispatch({
      type: 'importErp/saveFinance',
      payload: {
        payloadData,
        customizeUnitCode: 'SPFM.PARTNER_LIST_IMPORT_SAP.PURCHASE_FINANCE',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ newSupplierSyncId: res });
        this.handleSearchFinance(financePagination);
        dispatch({
          type: 'importErp/updateState',
          payload: { purchaseAccountData: {} },
        });
      }
    });
  }

  /**
   * 勾选删除
   */
  @Bind()
  handleDelete() {
    const {
      dispatch,
      importErp: { financePagination = {} },
    } = this.props;
    const { selectedRowKeys } = this.state;
    dispatch({
      type: 'importErp/deleteFinance',
      payload: selectedRowKeys,
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ selectedRowKeys: [] });
        this.handleSearchFinance(financePagination);
      }
    });
  }

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce(
      (prev, current) => prev + (current.className ? 0 : current.width ? current.width : 0),
      0
    );
    return total + fixWidth + 1;
  }

  // 采购冻结全选
  @Bind()
  frozenFlagChange(e, record) {
    const {
      dispatch,
      importErp: { financeList = [] },
    } = this.props;
    const { frozenFlag } = this.state;
    this.setState({
      frozenFlag: !frozenFlag,
    });
    if (record) {
      const newFinanceLists = [...financeList].map((i) =>
        i.supplierSyncPfId === record.supplierSyncPfId
          ? { ...i, frozenFlag: i.frozenFlag ? 0 : 1 }
          : i
      );
      const newFinanceListsRest = newFinanceLists.filter((item) => item._status === 'create');
      const flag = newFinanceListsRest.every((v) => v.frozenFlag);
      dispatch({
        type: 'importErp/updateState',
        payload: {
          financeList: newFinanceLists,
        },
      });
      this.setState({
        frozenFlag: newFinanceListsRest.length !== 0 ? flag : false,
      });
    } else {
      const newFinanceLists = [...financeList].map((newFinanceList) => ({
        ...newFinanceList,
        frozenFlag: newFinanceList._status ? e.target.checked : newFinanceList.frozenFlag,
      }));
      dispatch({
        type: 'importErp/updateState',
        payload: {
          financeList: newFinanceLists,
        },
      });
    }
  }

  renderForm() {
    const {
      modalRecord: { supplierCompanyNum, supplierCompanyName },
      form: { getFieldDecorator },
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
      style: { width: '100%' },
    };
    return (
      <Form layout="inline">
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              {...formItemLayout}
              label={intl.get(`spfm.importErp.model.importErp.supplierCompanyNum`).d('企业代码')}
            >
              {getFieldDecorator('supplierCompanyNum', { initialValue: supplierCompanyNum })(
                <Input disabled />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...formItemLayout}
              label={intl.get(`spfm.importErp.model.importErp.supplierCompanyName`).d('企业名称')}
            >
              {getFieldDecorator('supplierCompanyName', { initialValue: supplierCompanyName })(
                <Input disabled />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      loading,
      saving,
      deleting,
      importErp: { financePagination = {}, financeList = [] },
      modalRecord: { syncStatus },
      tradeTerms = [],
      customizeTable,
      custLoading,
    } = this.props;
    const {
      importErp: { purchaseAccountData = {} },
    } = this.props;

    const { selectedRowKeys, frozenFlag } = this.state;
    const isSave = financeList.filter((o) => o._status === 'create' || o._status === 'update');
    const columns = [
      {
        title: intl.get(`spfm.importErp.model.importErp.organizationCode`).d('采购组织'),
        width: 150,
        dataIndex: 'organizationCode',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('purchaseOrgId', {
                  initialValue: record.purchaseOrgId || purchaseAccountData.purchaseOrgId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.importErp.model.importErp.organizationCode`)
                          .d('采购组织'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SPFM.USER_AUTH.PURORG_CODE"
                    queryParams={{ tenantId: organizationId }}
                    textValue={val || purchaseAccountData.organizationCode}
                    onChange={(value, lovRecord) => {
                      setFieldsValue({
                        organizationName: lovRecord.organizationName,
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
        title: intl.get(`spfm.importErp.model.importErp.organizationName`).d('采购组织名称'),
        width: 120,
        dataIndex: 'organizationName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('organizationName', {
                  initialValue: val || purchaseAccountData.organizationName,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`spfm.importErp.model.importErp.purchaseAgent`).d('采购组'),
        width: 150,
        dataIndex: 'purchaseAgentName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('purchaseAgentId', {
                  // initialValue: record.purchaseAgentId || purchaseAccountData.purchaseAgentId,
                  // initialValue: record.val || purchaseAccountData.purchaseAgentId,
                  initialValue: record.purchaseAgentId || purchaseAccountData.purchaseAgentId,
                })(
                  <Lov
                    code="SMDM.PURCHASE_AGENT"
                    textValue={val}
                    queryParams={{ tenantId: organizationId }}
                    lovOptions={{
                      displayField: 'purchaseAgentName',
                      valueField: 'purchaseAgentId',
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
        title: intl.get(`spfm.importErp.model.importErp.termName`).d('付款条件'),
        width: 150,
        dataIndex: 'termName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('termId', {
                  initialValue: record.termId || purchaseAccountData.termId,
                })(
                  <Lov
                    code="SMDM.PAYMENT.TERM"
                    textValue={record.termName || purchaseAccountData.termName}
                    queryParams={{ tenantId: organizationId }}
                    // textValue={record.termName || purchaseAccountData.termName}
                    lovOptions={{
                      displayField: 'termName',
                      valueField: 'termId',
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
        title: intl.get('spfm.importErp.model.importErp.payMethod').d('付款方式'),
        width: 160,
        align: 'left',
        dataIndex: 'typeName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('typeCode', {
                  initialValue: record.typeCode,
                })(
                  <Lov
                    code="SMDM.PAYMENT_TYPE"
                    textValue={val}
                    queryParams={{ tenantId: organizationId }}
                    lovOptions={{ displayField: 'typeName', valueField: 'typeCode' }}
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
        title: intl.get('spfm.importErp.model.importErp.internationalCondition').d('国贸条件'),
        width: 160,
        dataIndex: 'tradeTermsMeaning',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('tradeTerms', {
                initialValue: record.tradeTerms,
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {tradeTerms.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('spfm.importErp.model.importErp.internationalSite').d('国贸地点'),
        width: 160,
        dataIndex: 'tradeTermsSite',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('tradeTermsSite', {
                initialValue: val,
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spfm.importErp.model.importErp.currencyCode`).d('订单货币'),
        width: 150,
        dataIndex: 'currencyName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('currencyCode', {
                  initialValue: record.currencyCode || purchaseAccountData.currencyCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfm.importErp.model.importErp.currencyCode`).d('订单货币'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SMDM.CURRENCY"
                    queryParams={{ tenantId: organizationId }}
                    lovOptions={{ displayField: 'currencyName', valueField: 'currencyCode' }}
                    textValue={record.currencyName || purchaseAccountData.currencyName}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.currencyName;
          }
        },
      },
      {
        title: intl.get(`spfm.importErp.model.importErp.reconciliationAccount`).d('统驭科目'),
        width: 150,
        dataIndex: 'reconciliationAccountMeaning',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('reconciliationAccount', {
                  initialValue:
                    record.reconciliationAccount || purchaseAccountData.reconciliationAccount,
                })(
                  <Lov
                    code="SSLM.RECONCILIATION_ACCOUNT"
                    queryParams={{ tenantId: organizationId }}
                    textValue={val}
                    lovOptions={{
                      displayField: 'meaning',
                      valueField: 'value',
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
        title: intl.get(`spfm.importErp.model.importErp.sortNumber`).d('排序码'),
        width: 150,
        dataIndex: 'sortNumber',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('sortNumber', {
                  initialValue: val || purchaseAccountData.sortNumber,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfm.importErp.model.importErp.sortNumber`).d('排序码'),
                      }),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                    {
                      pattern: /^\d+$/,
                      message: intl
                        .get(`spfm.importErp.view.message.patternValidate`)
                        .d('请输入正整数'),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        // title: intl.get(`spfm.importErp.model.importErp.purchase.frozenFlag`).d('采购冻结'),
        title: (
          <span>
            {intl.get(`spfm.importErp.model.importErp.purchase.frozenFlag`).d('采购冻结')}
            &nbsp;&nbsp;&nbsp;
            <Checkbox
              onChange={(e) => this.frozenFlagChange(e)}
              checked={
                financeList.length === 0 || financeList[0]._status !== 'create' ? false : frozenFlag
              }
              disabled={financeList.length === 0 || financeList[0]._status !== 'create'}
            />
          </span>
        ),
        width: 120,
        dataIndex: 'frozenFlag',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('frozenFlag', {
                  initialValue: val,
                })(
                  <Checkbox
                    onChange={(e) => this.frozenFlagChange(e, record)}
                    checked={val}
                    style={{ marginLeft: 58 }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(val);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 75,
        fixed: 'right',
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
                disabled={syncStatus === 'PENDING'}
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
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record._status === 'create',
      }),
    };
    return (
      <React.Fragment>
        <div
          style={{
            marginTop: -8,
            paddingBottom: 16,
            fontSize: 16,
            color: '#333',
            fontWeight: 500,
            borderBottom: 'solid 1px #e5e5e5',
          }}
        >
          {intl.get(`spfm.importErp.model.importErp.purchaseFinance`).d('采购/财务')}
        </div>
        <div style={{ margin: '16px 0' }}>
          <div className="table-list-search">{this.renderForm()}</div>
          <Row style={{ textAlign: 'right', marginBottom: 16 }}>
            <Button
              disabled={isEmpty(selectedRowKeys) || syncStatus === 'PENDING'}
              loading={deleting}
              onClick={this.handleDelete}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button
              disabled={isEmpty(isSave) || syncStatus === 'PENDING'}
              loading={saving}
              onClick={this.handleSave}
              style={{ margin: '0 8px' }}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button
              type="primary"
              disabled={syncStatus === 'PENDING'}
              onClick={this.handleCreateRow}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </Row>
          {customizeTable(
            {
              code: 'SPFM.PARTNER_LIST_IMPORT_SAP.PURCHASE_FINANCE',
            },
            <EditTable
              bordered
              rowKey="supplierSyncPfId"
              loading={loading}
              columns={columns}
              dataSource={financeList}
              pagination={financePagination}
              onChange={this.handleSearchFinance}
              rowSelection={rowSelection}
              custLoading={custLoading}
              scroll={{ x: this.scrollWidth(columns, 0) }}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}

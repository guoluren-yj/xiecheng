/**
 * PurchaseInform - 采购/财务信息
 * @date: 2019-12-11
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Input, Form, Button, Modal, Spin, Select } from 'hzero-ui';
import { isNumber, sum, isEmpty, isUndefined } from 'lodash';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { queryMapIdpValue } from 'services/api';
import EditTable from 'srm-front-boot/lib/components/EditTable';

import {
  getResponse,
  getEditTableData,
  getCurrentOrganizationId,
  addItemToPagination,
  delItemToPagination,
  delItemsToPagination,
} from 'utils/utils';
import { queryPurchaseLines } from '@/routes/SupplierLife/utils';
import HeaderInfo from './HeaderInfo';

const { Option } = Select;
const tenantId = getCurrentOrganizationId();

@connect(({ loading, commonApplication }) => ({
  loading,
  commonApplication,
  queryLoading:
    loading.effects['commonApplication/queryPurchaseData'] ||
    loading.effects['commonApplication/queryPurchaseHeader'] ||
    loading.effects['commonApplication/queryPurchaseLines'],
  deleteLoading: loading.effects['commonApplication/deletePurchaseLines'],
}))
@Form.create({ fieldNameProp: null })
export default class PurchaseInform extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      frozenFlag: false,
      code: {}, // 值集集合
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    this.init();
    if (onRef) onRef(this);
  }

  // 值集查询
  @Bind()
  init() {
    const lovCode = {
      tradeTerms: 'SSLM.TRADE_TERMS',
      planGroups: 'SSLM.PROGRAMME_GROUPS', // 计划组
      paymentFrozenList: 'SSLM.PAYMENT_FROZEN', // 付款冻结代码
    };
    queryMapIdpValue(lovCode).then(response => {
      const res = getResponse(response);
      if (res) {
        this.setState({ code: res });
      }
    });
  }

  // 获取保存数据
  @Bind()
  checkData() {
    const {
      commonApplication: { purchaseHeadInfo, purchaseList },
    } = this.props;
    let validateFlag = true;
    const payload = {};
    // 获取表单数据
    if (!isUndefined(this.headerForm)) {
      this.headerForm.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          payload.lifeChangeSync = { ...purchaseHeadInfo, ...values };
        } else {
          validateFlag = false;
        }
      });
    }
    // 获取表格数据
    const tableDate = getEditTableData(purchaseList, ['_status', 'supplierSyncPfId']);
    const editDate = purchaseList.filter(n => n._status === 'create' || n._status === 'update');
    if (isEmpty(tableDate) && !isEmpty(editDate)) {
      validateFlag = false;
    } else {
      payload.lifeChangeSyncPfs = tableDate;
    }

    if (validateFlag) {
      return payload;
    } else {
      return false;
    }
  }

  // 新建
  @Bind()
  handleAdd() {
    const {
      dispatch,
      commonApplication: { purchaseList, purchaseListPagination },
    } = this.props;
    dispatch({
      type: 'commonApplication/updateState',
      payload: {
        purchaseList: [{ _status: 'create', supplierSyncPfId: uuidv4() }, ...purchaseList],
        purchaseListPagination: addItemToPagination(purchaseList.length, purchaseListPagination),
      },
    });
  }

  // 清除
  @Bind()
  handleCancel(record) {
    const {
      dispatch,
      commonApplication: { purchaseList, purchaseListPagination },
    } = this.props;
    const newPurchaseList = purchaseList.filter(
      item => item.supplierSyncPfId !== record.supplierSyncPfId
    );
    dispatch({
      type: 'commonApplication/updateState',
      payload: {
        purchaseList: newPurchaseList,
        purchaseListPagination: delItemToPagination(purchaseList.length, purchaseListPagination),
      },
    });
  }

  // 编辑、取消编辑
  @Bind()
  handleEdit(record, flag) {
    const {
      dispatch,
      commonApplication: { purchaseList },
    } = this.props;
    const newPurchaseList = purchaseList.map(item =>
      record.supplierSyncPfId === item.supplierSyncPfId
        ? { ...item, _status: flag ? 'update' : '' }
        : item
    );
    dispatch({
      type: 'commonApplication/updateState',
      payload: {
        purchaseList: newPurchaseList,
      },
    });
  }

  // 删除
  @Bind()
  handleDelete() {
    const {
      dispatch,
      requisitionId,
      commonApplication: { purchaseList, purchaseListPagination },
    } = this.props;
    const { selectedRows, selectedRowKeys } = this.state;
    const newPurchaseList = purchaseList.filter(n => !selectedRowKeys.includes(n.supplierSyncPfId));
    const deleteRows = purchaseList.filter(n => selectedRowKeys.includes(n.supplierSyncPfId));
    const updateRows = selectedRows.filter(n => n._status !== 'create');

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: async () => {
        await dispatch({
          type: 'commonApplication/updateState',
          payload: {
            purchaseList: newPurchaseList,
            purchaseListPagination: delItemsToPagination(
              deleteRows.length,
              purchaseList.length,
              purchaseListPagination
            ),
          },
        });
        if (!isEmpty(updateRows) && requisitionId) {
          // 单据未生成时不掉接口删除
          await dispatch({
            type: 'commonApplication/deletePurchaseLines',
            payload: updateRows,
          }).then(res => {
            if (res) {
              queryPurchaseLines({ dispatch, requisitionId, page: purchaseListPagination });
              notification.success();
            }
          });
        }
        await this.setState({
          selectedRows: [],
          selectedRowKeys: [],
        });
      },
    });
  }

  // 采购冻结全选
  @Bind()
  frozenFlagChange(e, record) {
    const {
      dispatch,
      commonApplication: { purchaseList },
    } = this.props;
    const { frozenFlag } = this.state;
    this.setState({
      frozenFlag: !frozenFlag,
    });

    if (record) {
      const newPurchaseList = purchaseList.map(i =>
        i.supplierSyncPfId === record.supplierSyncPfId
          ? { ...i, frozenFlag: i.frozenFlag ? 0 : 1 }
          : i
      );
      const newPurchaseListRest = purchaseList.filter(
        item => item._status === 'create' || item._status === 'update'
      );
      const flag = newPurchaseList.every(v => v.frozenFlag === 1);
      dispatch({
        type: 'commonApplication/updateState',
        payload: { purchaseList: newPurchaseList },
      });
      this.setState({
        frozenFlag: newPurchaseListRest.length !== 0 ? flag : true,
      });
    } else {
      const newPurchaseList = purchaseList.map(list => ({
        ...list,
        frozenFlag: this.state.frozenFlag ? 0 : 1,
        _status: list._status || 'update',
        supplierSyncPfId: list.supplierSyncPfId,
      }));
      dispatch({
        type: 'commonApplication/updateState',
        payload: { purchaseList: newPurchaseList },
      });
    }
  }

  // 选中项发生变化时的回调
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  render() {
    const {
      form,
      isEdit,
      dispatch,
      queryLoading,
      deleteLoading,
      custLoading,
      dimensionCode,
      requisitionId,
      customizeForm = () => {},
      customizeTable = () => {},
      customizeBtnGroup,
      customizeBtnGroupCode,
      commonApplication: { purchaseHeadInfo, purchaseList, purchaseListPagination },
    } = this.props;
    const {
      selectedRows,
      selectedRowKeys,
      code: { planGroups = [], paymentFrozenList = [], tradeTerms = [] } = {},
    } = this.state;

    const { getFieldDecorator } = form;
    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const columns = [
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.organizationCode').d('采购组织'),
        width: 150,
        dataIndex: 'organizationCode',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            record.$form.getFieldDecorator('purchaseOrgId', { initialValue: record.purchaseOrgId });
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('organizationCode', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.supplierInform.model.supplierInform.organizationCode')
                          .d('采购组织'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SPFM.USER_AUTH.PURORG_CODE"
                    lovOptions={{
                      displayField: 'organizationCode',
                      valueField: 'organizationCode',
                    }}
                    onChange={(value, lovRecord) => {
                      record.$form.setFieldsValue({
                        organizationName: lovRecord.organizationName,
                        purchaseOrgId: lovRecord.purchaseOrgId,
                      });
                    }}
                    textField="organizationCode"
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
        title: intl
          .get('sslm.supplierInform.model.supplierInform.organizationName')
          .d('采购组织名称'),
        width: 150,
        dataIndex: 'organizationName',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('organizationName', {
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.purchaseAgent').d('采购员'),
        width: 150,
        dataIndex: 'purchaseAgentName',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('purchaseAgentId', {
                initialValue: record.purchaseAgentId,
              })(
                <Lov
                  code="SMDM.PURCHASE_AGENT"
                  queryParams={{ tenantId }}
                  textValue={record.purchaseAgentName}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.termName').d('付款条款'),
        width: 150,
        dataIndex: 'termName',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('termId', {
                initialValue: record.termId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sslm.supplierInform.model.supplierInform.termName`)
                        .d('付款条件'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SSLM.PAYMENT.TERM"
                  queryParams={{ tenantId }}
                  textValue={record.termName}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.payMethod').d('付款方式'),
        width: 160,
        dataIndex: 'paymentTypeCode',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('paymentTypeCode', {
                initialValue: record.paymentTypeCode,
              })(
                <Lov
                  code="SMDM.PAYMENT_TYPE"
                  textValue={record.typeName}
                  lovOptions={{ valueField: 'typeCode' }}
                />
              )}
            </Form.Item>
          ) : (
            record.typeName
          ),
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
                  {tradeTerms.map(item => (
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
        title: intl.get('sslm.supplierInform.model.supplierInform.currencyCode').d('订单货币'),
        width: 150,
        dataIndex: 'currencyName',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currencyCode', {
                initialValue: record.currencyCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.supplierInform.model.supplierInform.currencyCode')
                        .d('订单货币'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SMDM.CURRENCY"
                  textValue={record.currencyName}
                  lovOptions={{ valueField: 'currencyCode' }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.controlAccount').d('统驭科目'),
        width: 150,
        dataIndex: 'reconciliationAccountMeaning',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('reconciliationAccount', {
                initialValue: record.reconciliationAccount,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.supplierInform.model.supplierInform.controlAccount')
                        .d('统驭科目'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SSLM.RECONCILIATION_ACCOUNT"
                  queryParams={{ tenantId }}
                  lovOptions={{
                    displayField: 'meaning',
                    valueField: 'value',
                  }}
                  textValue={record.reconciliationAccountMeaning}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.supplierInform.model.supplierInform.sortNumber`).d('排序码'),
        width: 150,
        dataIndex: 'sortNumber',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('sortNumber', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sslm.supplierInform.model.supplierInform.sortNumber`)
                        .d('排序码'),
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
                      .get(`sslm.supplierInform.view.message.patternValidate`)
                      .d('请输入正整数'),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: (
          <span>
            {intl.get(`sslm.supplierInform.model.purchase.frozenFlag`).d('采购冻结')}
            {isEdit ? (
              <Checkbox
                style={{ marginLeft: 10 }}
                onChange={e => this.frozenFlagChange(e)}
                checked={this.state.frozenFlag}
              />
            ) : null}
          </span>
        ),
        width: 120,
        dataIndex: 'frozenFlag',
        render: (val, record) => {
          return isEdit ? (
            <Form.Item>
              {getFieldDecorator(`frozenFlag#${record.supplierSyncPfId}`, {
                initialValue: val,
              })(
                <Checkbox
                  checked={val}
                  style={{ marginLeft: 58 }}
                  onChange={e => this.frozenFlagChange(e, record)}
                  disabled={!(record._status === 'create' || record._status === 'update')}
                />
              )}
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          );
        },
      },
    ];
    if (isEdit) {
      columns.push({
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        fixed: 'right',
        width: 75,
        render: (_, record) => (
          <Fragment>
            {record._status === 'create' ? (
              <a onClick={() => this.handleCancel(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <a onClick={() => this.handleEdit(record, false)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a onClick={() => this.handleEdit(record, true)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </Fragment>
        ),
      });
    }
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? Number(n.width) : 150)));

    return (
      <Spin spinning={queryLoading || false}>
        <HeaderInfo
          isEdit={isEdit}
          planGroups={planGroups}
          custLoading={custLoading}
          dimensionCode={dimensionCode}
          customizeForm={customizeForm}
          purchaseHeadInfo={purchaseHeadInfo}
          paymentFrozenList={paymentFrozenList}
          onRef={node => {
            this.headerForm = node;
          }}
        />
        {isEdit &&
          (customizeBtnGroup ? (
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'flex-start',
                flexDirection: 'row-reverse',
              }}
            >
              {customizeBtnGroup(
                {
                  code: customizeBtnGroupCode,
                },
                [
                  <Button
                    data-name="delete"
                    loading={deleteLoading}
                    style={{ marginRight: 8 }}
                    onClick={this.handleDelete}
                    disabled={isEmpty(selectedRows)}
                  >
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </Button>,
                  <Button data-name="create" type="primary" onClick={this.handleAdd}>
                    {intl.get(`hzero.common.button.create`).d('新建')}
                  </Button>,
                ]
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Button
                loading={deleteLoading}
                style={{ marginRight: 8 }}
                onClick={this.handleDelete}
                disabled={isEmpty(selectedRows)}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
              <Button type="primary" onClick={this.handleAdd}>
                {intl.get(`hzero.common.button.create`).d('新建')}
              </Button>
            </div>
          ))}
        {customizeTable(
          {
            code: 'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_LINES',
            clearCache: (a, b, cb) => {
              if (a !== b) cb(a);
            },
            useNewValid: true,
          },
          <EditTable
            bordered
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={purchaseList}
            rowKey="supplierSyncPfId"
            rowSelection={isEdit ? rowSelection : null}
            custLoading={custLoading}
            pagination={requisitionId ? purchaseListPagination : false}
            onChange={page => queryPurchaseLines({ dispatch, requisitionId, page })}
          />
        )}
      </Spin>
    );
  }
}

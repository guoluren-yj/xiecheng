/**
 * ServiceLineTable - 服务费列表展示组件
 * @date: 2020-04-01
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Form, Input, Button, Modal, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, isEmpty, filter } from 'lodash';
import uuidv4 from 'uuid/v4';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import { tableScrollWidth, getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';

import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { numberSeparatorRender } from '@/utils/renderer';

const promptCode = 'ssrc.depositManage';
const organizationId = getCurrentOrganizationId();
const userId = getCurrentUserId();

/**
 * ServiceLineTable - 展示组件 - 询价单头信息
 * @extends {Component} - React.Component
 * @reactProps {!Object} [dataSource=[]] - 数据源
 * @reactProps {!Object} [loading=false] - table数据加载中标识
 * @reactProps {!Object} [pagination={}] - 分页对象
 * @reactProps {Function} [onChange=e => e] - 改变分页函数
 * @reactProps {Function} [onSave=e => e] - 保存保证金函数
 * @return React.element
 */

@withCustomize({
  unitCode: [
    'SSRC.EXPENSE_MANAGEMENT.LINETABLE_SERVICE_CHARGE_TABLE', // 服务费
  ],
})
export default class ServiceLineTable extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(props.key, this);
    }
    this.state = {};
  }

  /**
   * 保存保证金变更
   * @param {Object} record - 操作行
   */
  @Bind()
  handleSave() {
    const { onSave, expensesType, dataIndex, dataSource, selectedRows } = this.props;
    const data = selectedRows?.length ? selectedRows : dataSource;
    onSave(data, expensesType, dataIndex);
  }

  /**
   * 新建行
   */
  @Bind()
  createRow() {
    const {
      dispatch,
      dataIndex,
      dataSource,
      expensesType,
      header,
      currencyIsCNY = false,
      currencyIsRMB = false,
    } = this.props;
    dispatch({
      type: 'depositManage/updateState',
      payload: {
        [`${dataIndex}Data`]: [
          {
            expensesRelDocId: uuidv4(),
            supplierCompanyNum: '',
            supplierTenantId: '',
            supplierCompanyName: '',
            suggestedQtnTaxAmount: null,
            suggestedQtnNetAmount: null,
            suggestedCurrencyCode: '',
            expenseCurrencyCode: currencyIsCNY ? 'CNY' : currencyIsRMB ? 'RMB' : '',
            currencyName:
              currencyIsCNY || currencyIsRMB ? intl.get('ssrc.common.model.CNY').d('人民币') : '',
            expenseCurrencyMeaning: '',
            expectAmount: null,
            invoiceRuleMeaning: '',
            invoiceRule: '',
            expensesAmount: null,
            returnedAmount: null,
            syncExpenseStatusMeaning: '',
            syncExpenseResponseMsg: '',
            sourceId: header.sourceId,
            sourceNum: header.sourceNum,
            expensesType,
            _status: 'create', // 新建标记位
            expenseStatus: 'NO_PAY',
          },
          ...dataSource,
        ],
      },
    });
  }

  /**
   * 删除
   */
  @Bind
  handleDelete() {
    const {
      dispatch,
      selectedRows = [],
      dataSource = [],
      dataIndex,
      updateSelectedRows,
    } = this.props;
    // 过滤出勾选数据的剩下数据
    const newData = filter(dataSource, (item) => {
      return selectedRows?.map((r) => r.expensesRelDocId).indexOf(item.expensesRelDocId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        selectedRows.forEach((item) => {
          if (item._status !== 'create') {
            remoteDelete.push(item);
          }
        });
        dispatch({
          type: 'depositManage/updateState',
          payload: {
            [`${dataIndex}Data`]: [...newData, ...remoteDelete],
          },
        });
        updateSelectedRows(dataIndex);
      },
    });
  }

  /**
   * 改变供应商编码-获取供应商名称
   */
  @Bind()
  changeSupplierCompanyNum(value, dataList, record) {
    const {
      supplierCompanyName,
      supplierCompanyCode,
      supplierTenantId,
      suggestedQtnTaxAmount,
      suggestedQtnNetAmount,
      suggestedCurrencyCode,
      expectAmount,
      invoiceRuleMeaning,
      expensesAmount,
      returnedAmount,
      syncExpenseStatusMeaning,
      syncExpenseResponseMsg,
      invoiceRule,
    } = dataList;
    record.$form.setFieldsValue({
      supplierCompanyName,
      supplierTenantId,
      supplierCompanyNum: supplierCompanyCode,
      suggestedQtnTaxAmount,
      suggestedQtnNetAmount,
      suggestedCurrencyCode,
      expectAmount,
      invoiceRuleMeaning,
      expensesAmount,
      returnedAmount,
      syncExpenseStatusMeaning,
      syncExpenseResponseMsg,
      invoiceRule,
    });
  }

  render() {
    const {
      expensesType,
      onChange,
      header = {},
      loading = false,
      pagination = {},
      dataSource = [],
      selectedRows = [],
      rowSelection,
      customizeTable = () => {},
      saveLoading,
      sourceId,
      paymentRuleStatus = [],
      currencyIsCNY = false,
      currencyIsRMB = false,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.depositManage.supplierCompanyNum`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('supplierCompanyId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.bidHall.model.bidHall.supplierCode`).d('供应商编码'),
                      }),
                    },
                  ],
                  initialValue: record.supplierCompanyId,
                })(
                  <Lov
                    code="SSRC.NEED_PAY_SERVICE_EXPENSE_SUPPLIER"
                    onChange={(value, dataList) =>
                      this.changeSupplierCompanyNum(value, dataList, record)
                    }
                    queryParams={{ organizationId, userId, companyId: header.companyId, sourceId }}
                    textValue={record.supplierCompanyNum}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('supplierTenantId', {
                  initialValue: record.supplierTenantId,
                })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.supplierCompanyName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        // width: 200,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('supplierCompanyName', {
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl
          .get(`${promptCode}.model.depositManage.suggestedQtnTaxAmount`)
          .d('中标金额（含税）'),
        dataIndex: 'suggestedQtnTaxAmount',
        width: 150,
        render: (val, record) => {
          record.$form.getFieldDecorator('suggestedQtnTaxAmount', {
            initialValue: val,
          });
          return numberSeparatorRender(val);
        },
      },
      {
        title: intl
          .get(`${promptCode}.model.depositManage.suggestedQtnNetAmount`)
          .d('中标金额（不含税）'),
        dataIndex: 'suggestedQtnNetAmount',
        width: 150,
        render: (val, record) => {
          record.$form.getFieldDecorator('suggestedQtnNetAmount', {
            initialValue: val,
          });
          return numberSeparatorRender(val);
        },
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.suggestedCurrencyCode`).d('中标币种'),
        dataIndex: 'suggestedCurrencyCode',
        width: 150,
        render: (val, record) => {
          record.$form.getFieldDecorator('suggestedCurrencyCode', {
            initialValue: val,
          });
          return val;
        },
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.expenseCurrencyCode`).d('服务费币种'),
        dataIndex: 'expenseCurrencyCode',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('expenseCurrencyCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.depositManage.expenseCurrencyCode`)
                          .d('服务费币种'),
                      }),
                    },
                  ],
                  initialValue: val || (currencyIsCNY ? 'CNY' : currencyIsRMB ? 'RMB' : ''),
                })(
                  <Lov
                    code="SMDM.CURRENCY_CODE"
                    queryParams={{ enabledFlag: 1 }}
                    lovOptions={{
                      displayField: 'currencyCode',
                      valueField: 'currencyCode',
                    }}
                  />
                )}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.expectAmount`).d('含税服务费金额（元）'),
        dataIndex: 'expectAmount',
        align: 'right',
        width: 120,
        render: (val, record) => {
          if (['create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('expectAmount', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.depositManage.expectAmount`)
                          .d('含税服务费金额（元）'),
                      }),
                    },
                  ],
                })(
                  <PrecisionInputNumber
                    type="hzero"
                    precision={2}
                    min={0}
                    max="99999999999999999999"
                    style={{ width: '100%' }}
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
          .get(`${promptCode}.model.depositManage.chargeInvoiceRuleMeaning`)
          .d('服务费开票规则'),
        dataIndex: 'invoiceRuleMeaning',
        width: 150,
        render: (val, record) => {
          record.$form.getFieldDecorator('invoiceRuleMeaning', {
            initialValue: val,
          });
          record.$form.getFieldDecorator('invoiceRule', {
            initialValue: record.invoiceRule,
          });
          return val;
        },
      },
      {
        title: intl
          .get(`${promptCode}.model.depositManage.chargeExpensesAmount`)
          .d('服务费已缴纳金额'),
        dataIndex: 'expensesAmount',
        width: 150,
        render: (val, record) => {
          record.$form.getFieldDecorator('expensesAmount', {
            initialValue: val,
          });
          return numberSeparatorRender(val);
        },
      },
      {
        title: intl
          .get(`${promptCode}.model.depositManage.chargeReturnedAmount`)
          .d('服务费已退回金额'),
        dataIndex: 'returnedAmount',
        width: 150,
        render: (val, record) => {
          record.$form.getFieldDecorator('returnedAmount', {
            initialValue: val,
          });
          return numberSeparatorRender(val);
        },
      },
      {
        title: intl
          .get(`${promptCode}.model.depositManage.syncExpenseStatusMeaning`)
          .d('同步费用工作台状态'),
        dataIndex: 'syncExpenseStatusMeaning',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.model.depositManage.syncExpenseResponseMsg`)
          .d('同步费用工作台反馈'),
        dataIndex: 'syncExpenseResponseMsg',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.paymentStatusMeaning`).d('支付状态'),
        dataIndex: 'paymentStatusMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.invoiceStatusMeaning`).d('开票状态'),
        dataIndex: 'invoiceStatusMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.paymentRuleMeaning`).d('缴纳类型'),
        dataIndex: 'paymentRule',
        width: 150,
        render: (_, record) => {
          if (['create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('paymentRule', {
                  initialValue: record.paymentRule || 'NEED_PAYMENT',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.depositManage.paymentRuleMeaning`)
                          .d('缴纳类型'),
                      }),
                    },
                  ],
                })(
                  <Select style={{ width: '100%' }} allowClear>
                    {paymentRuleStatus.map((item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            );
          } else {
            return record.paymentRuleMeaning;
          }
        },
      },
    ].filter(Boolean);
    const scrollX = tableScrollWidth(columns);
    return (
      <React.Fragment>
        <div style={{ marginBottom: '8px' }}>
          {header?.serviceExpenseChargeFlag === 1 ? (
            <Button type="primary" style={{ marginRight: 8 }} onClick={this.createRow}>
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>
          ) : null}
          <Button style={{ marginRight: 8 }} onClick={this.handleSave} loading={saveLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            style={{ marginRight: 8 }}
            disabled={isEmpty(selectedRows)}
            onClick={this.handleDelete}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        </div>
        {customizeTable(
          {
            code: 'SSRC.EXPENSE_MANAGEMENT.LINETABLE_SERVICE_CHARGE_TABLE', // 服务费
          },
          <EditTable
            bordered
            loading={loading}
            rowKey="expensesRelDocId"
            dataSource={dataSource}
            columns={columns}
            pagination={pagination}
            rowSelection={rowSelection}
            onChange={(page) => onChange(page, expensesType)}
            scroll={{ x: scrollX }}
          />
        )}
      </React.Fragment>
    );
  }
}

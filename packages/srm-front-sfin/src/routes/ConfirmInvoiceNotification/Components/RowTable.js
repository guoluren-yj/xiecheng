/**
 * RowTable - 行表格
 * @date: 2018-11-27
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Input, InputNumber } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import math from 'mathjs';

import intl from 'utils/intl';
// import { numberRender } from 'utils/renderer';
import EditTable from 'components/EditTable';

import styles from '../../Invoice/index.less';
import { thousandBitSeparator, precisionNum, thousandBitSeparatorDJ } from '@/routes/utils';

// import styles from './index.less';

const promptCode = 'sfin.invoiceBill';
/**
 * 行表格
 * @extends {Component} - Component
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */

@connect(({ bill }) => ({ bill }))
export default class RowTable extends Component {
  state = {};

  /**
   * 科学计算
   * @param {Number} value
   * @param {Number} precision 四舍五入的精度
   */
  @Bind()
  handleCalculation(value, amountPrecision) {
    // return math.eval(value);
    return math.eval(value).toFixed(amountPrecision);
    // return thousandBitSeparatorIsNew(Number(math.eval(value)), amountPrecision);
  }

  /**
   * 填写含税单价后的修改
   * @param {Object} record 行数据
   */
  @Bind()
  handleTaxPriceBlur(evt, record) {
    const {
      dispatch,
      rowDataSource: { content = [], ...other },
    } = this.props;
    const { quantity, taxRate, unitPriceBatch, amountPrecision, pricePrecision } = record;
    const taxIncludedPrice = evt.target.value;
    const realTaxRate = taxRate ? taxRate / 100 : taxRate;
    const newContent = content.map((item) => {
      if (item.billLineId === record.billLineId) {
        return {
          ...item,
          // 含税金额
          taxIncludedAmount: this.handleCalculation(
            (taxIncludedPrice * quantity) / unitPriceBatch,
            amountPrecision
          ),
          // 税额
          taxAmount: this.handleCalculation(
            ((taxIncludedPrice / (1 + realTaxRate)) * realTaxRate * quantity) / unitPriceBatch,
            amountPrecision
          ),
          // 不含税单价
          netPrice: this.handleCalculation(taxIncludedPrice / (1 + realTaxRate), pricePrecision),
          // 不含税金额
          netAmount: this.handleCalculation(
            (taxIncludedPrice * quantity) / (1 + realTaxRate) / unitPriceBatch,
            amountPrecision
          ),
          // taxIncludedAmount: +(taxIncludedPrice * quantity).toFixed(2),
          // taxAmount: +(taxIncludedPrice / (1 + taxRate) * taxRate * quantity).toFixed(2),
          // netPrice: +(taxIncludedPrice / (1 + taxRate)).toFixed(10),
          // netAmount: +(taxIncludedPrice * quantity / (1 + taxRate)).toFixed(2),
        };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'bill/updateState',
      payload: {
        rowDataSource: {
          ...other,
          content: newContent,
        },
      },
    });
  }

  /**
   * 填写 不含税单价后的修改
   * @param {Object} record 行数据
   */
  @Bind()
  handleNetPriceBlur(evt, record) {
    const {
      dispatch,
      rowDataSource: { content = [], ...other },
    } = this.props;
    const { quantity, taxRate, unitPriceBatch, amountPrecision, pricePrecision } = record;
    const netPrice = evt.target.value;
    const realTaxRate = taxRate ? taxRate / 100 : taxRate;
    const newContent = content.map((item) => {
      if (item.billLineId === record.billLineId) {
        return {
          ...item,
          // 含税金额
          taxIncludedAmount: this.handleCalculation(
            (netPrice * (1 + realTaxRate) * quantity) / unitPriceBatch,
            amountPrecision
          ),
          // 税额
          taxAmount: this.handleCalculation(
            (netPrice * realTaxRate * quantity) / unitPriceBatch,
            amountPrecision
          ),
          // 含税单价
          taxIncludedPrice: this.handleCalculation(netPrice * (1 + realTaxRate), pricePrecision),
          // 不含税金额
          netAmount: this.handleCalculation(
            (netPrice * quantity) / unitPriceBatch,
            amountPrecision
          ),
          // taxIncludedAmount: +(netPrice * (1 + taxRate) * quantity).toFixed(2),
          // taxAmount: +(netPrice / (1 + taxRate) * quantity).toFixed(2),
          // taxIncludedPrice: +(netPrice / (1 + taxRate)).toFixed(10),
          // netAmount: +(netPrice * quantity).toFixed(2),
        };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'bill/updateState',
      payload: {
        rowDataSource: {
          ...other,
          content: newContent,
        },
      },
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

  render() {
    const {
      isEdit = true, // 行表是否可编辑
      supplierUpdateShield, // 判断是否修改单价
      basePrice, // 判断基准价是否为含税价
      onTableChange,
      rowDataSource: { content = [] },
      rowPagination = {},
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.billLineNum`).d('开票单行号'),
        dataIndex: 'billLineNum',
        width: 150,
      },
      {
        title: intl.get('entity.item.code').d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.itemName`).d('物料描述'),
        dataIndex: 'itemName',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierItemNum`).d('供应商料号'),
        dataIndex: 'supplierItemNum',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierItemDesc`).d('供应商料号描述'),
        dataIndex: 'supplierItemDesc',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.specificationsAndModel`).d('规格型号'),
        dataIndex: 'specificationsAndModel',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.unit`).d('单位'),
        dataIndex: 'uom',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceQuantityAvailable`).d('可开票数量'),
        dataIndex: 'quantity',
        width: 100,
        render: (text) => thousandBitSeparator(text),
      },
      // {
      //   title: intl.get(`${promptCode}.model.invoiceBill.orignNetPrice`).d('原不含税单价'),
      //   dataIndex: 'orignNetPrice',
      //   width: 150,
      //   align: 'right',
      // },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netPrice`).d('不含税单价'),
        dataIndex: 'netPrice',
        align: 'right',
        render: (text, record) => {
          if (isEdit && supplierUpdateShield && basePrice === 'NET_PRICE') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('netPrice', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.model.invoiceBill.netPrice`).d('不含税单价'),
                      }),
                    },
                  ],
                  initialValue: record.netPrice,
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={precisionNum(text, record, 'netPrice')}
                    allowThousandth
                    onBlur={(evt) => this.handleNetPriceBlur(evt, record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.priceShieldFlag === 1
              ? '***'
              : thousandBitSeparator(text, record.amountPrecision);
          }
        },
        onCell: (record) => {
          const { orignNetPrice, netPrice } = record;
          if (orignNetPrice && orignNetPrice !== netPrice && basePrice === 'NET_PRICE') {
            return { className: styles['invoice-diff-col'] };
          } else {
            return {};
          }
        },
      },
      {
        title: `${intl.get(`${promptCode}.model.invoiceBill.per`).d('每')}`,
        dataIndex: 'unitPriceBatch',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
        dataIndex: 'netAmount',
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1 ? '***' : thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: `${intl.get(`${promptCode}.model.invoiceBill.taxRate`).d('税率')}（%）`,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1 ? '***' : thousandBitSeparator(text, record.amountPrecision),
      },
      // {
      //   title: intl.get(`${promptCode}.model.invoiceBill.orignTaxIncludedPrice`).d('原含税单价'),
      //   dataIndex: 'orignTaxIncludedPrice',
      //   width: 100,
      //   align: 'right',
      // },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedPrice`).d('含税单价'),
        dataIndex: 'taxIncludedPrice',
        align: 'right',
        render: (text, record) => {
          if (isEdit && supplierUpdateShield && basePrice === 'TAX_INCLUDED_PRICE') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('taxIncludedPrice', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.invoiceBill.taxIncludedPrice`)
                          .d('含税单价'),
                      }),
                    },
                  ],
                  initialValue: record.taxIncludedPrice,
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    allowThousandth
                    // {...precisionParams(text, true)}
                    precision={record.pricePrecision}
                    onBlur={(evt) => this.handleTaxPriceBlur(evt, record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.priceShieldFlag === 1
              ? '***'
              : thousandBitSeparatorDJ(text, record.pricePrecision);
          }
        },
        onCell: (record) => {
          const { orignTaxIncludedPrice, taxIncludedPrice } = record;
          if (
            orignTaxIncludedPrice &&
            orignTaxIncludedPrice !== taxIncludedPrice &&
            basePrice === 'TAX_INCLUDED_PRICE'
          ) {
            return { className: styles['invoice-diff-col'] };
          } else {
            return {};
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedAmount`).d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(text, record.amountPrecision) || 0,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.row.remark`).d('行备注'),
        dataIndex: 'remark',
        width: 200,
        // fixed: isEdit ? 'right' : '',
        render: (text, record) => {
          if (isEdit) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('remark', {
                  initialValue: record.remark,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return text;
          }
        },
      },
    ];

    if (supplierUpdateShield && basePrice === 'NET_PRICE') {
      const orignNetPrice = {
        title: intl.get(`${promptCode}.model.invoiceBill.orignNetPrice`).d('原不含税单价'),
        dataIndex: 'orignNetPrice',
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1 ? '***' : thousandBitSeparator(text, record.pricePrecision),
      };
      columns.splice(6, 0, orignNetPrice);
    }
    if (supplierUpdateShield && basePrice === 'TAX_INCLUDED_PRICE') {
      const orignTaxIncludedPrice = {
        title: intl.get(`${promptCode}.model.invoiceBill.orignTaxIncludedPrice`).d('原含税单价'),
        dataIndex: 'orignTaxIncludedPrice',
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1 ? '***' : thousandBitSeparator(text, record.pricePrecision),
      };
      columns.splice(10, 0, orignTaxIncludedPrice);
    }

    return (
      <React.Fragment>
        <EditTable
          bordered
          rowKey="billLineId"
          columns={columns}
          dataSource={content}
          pagination={rowPagination}
          onChange={onTableChange}
          scroll={{ x: this.scrollWidth(columns, 850) }}
        />
      </React.Fragment>
    );
  }
}

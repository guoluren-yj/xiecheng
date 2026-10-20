/* eslint-disable no-unused-expressions */
/**
 * RowTable - 行表格
 * @date: 2018-11-27
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Input, InputNumber } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  thousandBitSeparator,
  thousandBitSeparatorIsNew,
  thousandBitSeparatorDJ,
  delcommafy,
  thousandBitSeparatorDJCutZore,
  cutZero,
  getNetPriceByTaxIncPrice,
  getIncTaxAmountByNetPrice,
} from '@/routes/utils';

import styles from '../../Invoice/index.less';
// import styles from './index.less';

const promptCode = 'sfin.invoiceBill';
/**
 * 行表格
 * @extends {Component} - Component
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@withCustomize({
  unitCode: ['SFIN.BILL_MAINTAIN_DETAIL.LINE'],
})
@connect(({ bill }) => ({ bill }))
@formatterCollections({
  code: ['smdm.materiel'],
})
export default class RowTable extends Component {
  /**
   * 科学计算
   * @param {Number} value
   * @param {Number} precision 四舍五入的精度
   */
  @Bind()
  handleCalculation(value, amountPrecision) {
    return math.toFixed(value, Number(amountPrecision));
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
      nameKey = 'rowDataSource',
    } = this.props;
    const { quantity, taxRate, unitPriceBatch, amountPrecision, pricePrecision } = record;
    const taxIncludedPrice = this.handleCalculation(delcommafy(evt.target.value), pricePrecision);
    record.$form.setFieldsValue({ taxIncludedPrice });
    const realTaxRate = taxRate ? math.div(taxRate, 100) : taxRate;
    const newContent = content.map((item) => {
      if (item.billLineId === record.billLineId) {
        const ratePlus = math.plus(1, realTaxRate);
        return {
          ...item,
          // 含税金额
          taxIncludedAmount: this.handleCalculation(
            math.div(math.multipliedBy(taxIncludedPrice, quantity), unitPriceBatch),
            amountPrecision
          ),
          // 税额
          taxAmount: this.handleCalculation(
            math.div(
              math.multipliedBy(
                math.div(taxIncludedPrice, ratePlus),
                math.multipliedBy(realTaxRate, quantity)
              ),
              unitPriceBatch
            ),
            amountPrecision
          ),
          // 不含税单价
          netPrice: cutZero(
            getNetPriceByTaxIncPrice(
              taxIncludedPrice,
              quantity,
              taxRate,
              pricePrecision,
              unitPriceBatch
            )
          ),
          // 不含税金额
          netAmount: this.handleCalculation(
            math.div(
              math.div(math.multipliedBy(taxIncludedPrice, quantity), ratePlus),
              unitPriceBatch
            ),
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
        [nameKey]: {
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
      nameKey = 'rowDataSource',
    } = this.props;
    const { quantity, taxRate, unitPriceBatch, amountPrecision, pricePrecision } = record;
    const netPrice = this.handleCalculation(delcommafy(evt.target.value), pricePrecision);
    record.$form.setFieldsValue({ netPrice });
    const realTaxRate = taxRate ? math.div(taxRate, 100) : taxRate;
    const newContent = content.map((item) => {
      if (item.billLineId === record.billLineId) {
        const ratePlus = math.plus(1, realTaxRate);
        return {
          ...item,
          netPrice,
          // 含税金额
          taxIncludedAmount: this.handleCalculation(
            math.div(
              math.multipliedBy(math.multipliedBy(netPrice, ratePlus), quantity),
              unitPriceBatch
            ),
            amountPrecision
          ),
          // 税额
          taxAmount: this.handleCalculation(
            math.div(
              math.multipliedBy(math.multipliedBy(netPrice, realTaxRate), quantity),
              unitPriceBatch
            ),
            amountPrecision
          ),
          // 含税单价
          taxIncludedPrice: getIncTaxAmountByNetPrice(
            netPrice,
            quantity,
            taxRate,
            pricePrecision,
            unitPriceBatch
          ),
          // 不含税金额
          netAmount: this.handleCalculation(
            math.div(math.multipliedBy(netPrice, quantity), unitPriceBatch),
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
        [nameKey]: {
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
      customizeTable,
      billFlag,
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
        title: intl.get('smdm.materiel.model.materiel.commonName').d('通用名'),
        dataIndex: 'commonName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierItemNum`).d('供应商料号'),
        dataIndex: 'supplierItemNum',
        width: 150,
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
        width: 180,
        render: (text, record) => {
          if (isEdit && supplierUpdateShield && basePrice === 'NET_PRICE') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('netPrice', {
                  initialValue: record.netPrice,
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    onBlur={(evt) => this.handleNetPriceBlur(evt, record)}
                  />
                )}
              </Form.Item>
            );
          } else if (billFlag) {
            return record.priceShieldFlag === 1 ? '***' : record.netPrice;
          } else {
            return record.priceShieldFlag === 1
              ? '***'
              : thousandBitSeparatorDJCutZore(text, record.pricePrecision);
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
        width: 180,
        render: (text, record) => {
          if (billFlag) {
            return record.priceShieldFlag === 1
              ? '***'
              : thousandBitSeparator(record.netAmount, record.amountPrecision);
          } else {
            return record.priceShieldFlag === 1
              ? '***'
              : numberRender(text, record.amountPrecision);
          }
        },
        // record.priceShieldFlag === 1 ? '***' : numberRender(text, record.amountPrecision),
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
        width: 120,
        render: (text, record) => {
          if (billFlag) {
            return record.priceShieldFlag === 1
              ? '***'
              : thousandBitSeparator(record.taxAmount, record.amountPrecision);
          } else {
            return record.priceShieldFlag === 1
              ? '***'
              : numberRender(text, record.amountPrecision);
          }
        },
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
        width: 160,
        render: (text, record) => {
          if (isEdit && supplierUpdateShield && basePrice === 'TAX_INCLUDED_PRICE') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('taxIncludedPrice', {
                  initialValue: record.taxIncludedPrice,
                })(
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    // allowThousandth
                    // precision={record.pricePrecision}
                    onBlur={(evt) => this.handleTaxPriceBlur(evt, record)}
                    // onChange={() => this.focusValue(record)}
                  />
                )}
              </Form.Item>
            );
          } else if (billFlag) {
            return record.priceShieldFlag === 1 ? '***' : record.taxIncludedPrice;
          } else {
            return record.priceShieldFlag === 1
              ? '***'
              : thousandBitSeparatorDJCutZore(text, record.pricePrecision);
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
        // 发票总额
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedAmount`).d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        align: 'right',
        width: 140,
        render: (text, record) => {
          if (billFlag) {
            return record.priceShieldFlag === 1
              ? '***'
              : thousandBitSeparator(record.taxIncludedAmount, record.amountPrecision);
          } else {
            return record.priceShieldFlag === 1
              ? '***'
              : thousandBitSeparator(text, record.amountPrecision) || 0;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.row.remark`).d('行备注'),
        dataIndex: 'remark',
        // width: 200,
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
        width: 150,
        render: (text, record) => {
          if (billFlag) {
            return record.priceShieldFlag === 1 ? '***' : record.orignNetPrice;
          } else {
            return record.priceShieldFlag === 1
              ? '***'
              : thousandBitSeparatorDJ(text, record.pricePrecision);
          }
        },
      };
      columns.splice(6, 0, orignNetPrice);
    }
    if (supplierUpdateShield && basePrice === 'TAX_INCLUDED_PRICE') {
      const orignTaxIncludedPrice = {
        title: intl.get(`${promptCode}.model.invoiceBill.orignTaxIncludedPrice`).d('原含税单价'),
        dataIndex: 'orignTaxIncludedPrice',
        width: 120,
        align: 'right',
        render: (text, record) => {
          if (billFlag) {
            return record.priceShieldFlag === 1 ? '***' : record.orignTaxIncludedPrice;
          } else {
            return record.priceShieldFlag === 1 ? '***' : thousandBitSeparatorIsNew(text);
          }
        },
      };
      columns.splice(10, 0, orignTaxIncludedPrice);
    }

    return customizeTable(
      {
        code: 'SFIN.BILL_MAINTAIN_DETAIL.LINE',
      },
      <EditTable
        bordered
        rowKey="billLineId"
        columns={columns}
        dataSource={content}
        pagination={rowPagination}
        onChange={onTableChange}
        scroll={{ x: this.scrollWidth(columns, 200) }}
      />
    );
  }
}

/**
 * DetailTable - 明细表格
 * @date: 2018-11-27
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { yesOrNoRender, dateRender } from 'utils/renderer';

import intl from 'utils/intl';
import { thousandBitSeparator, thousandBitSeparatorDJ } from '@/routes/utils';

// const FormItem = Form.Item;
const promptCode = 'sfin.invoiceBill';
/**
 * 明细表格
 * @extends {Component} - Component
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
export default class DetailTable extends Component {
  state = {};

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  render() {
    const {
      onTableChange,
      detailDataSource: { content = [] },
      detailPagination = {},
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxAndLineNum`).d('事务编号|行号'),
        dataIndex: 'trxAndLineNum',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get('entity.item.code').d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.itemName`).d('物料描述'),
        dataIndex: 'itemName',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.specificationsAndModel`).d('规格型号'),
        dataIndex: 'specificationsAndModel',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.unit`).d('单位'),
        dataIndex: 'unit',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceQuantityAvailable`).d('可开票数量'),
        dataIndex: 'invoiceQuantityAvailable',
        width: 100,
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netPrice`).d('不含税单价'),
        dataIndex: 'netPrice',
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparatorDJ(text, record.pricePrecision),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.unitPriceBatch`).d('每'),
        dataIndex: 'unitPriceBatch',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
        dataIndex: 'netAmount',
        render: (text, record) =>
          record.priceShieldFlag === 1 ? '***' : thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: `${intl.get(`${promptCode}.model.invoiceBill.taxRate`).d('税率')}（%）`,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedPrice`).d('含税单价'),
        dataIndex: 'taxIncludedPrice',
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparatorDJ(text, record.pricePrecision),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedAmount`).d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1 ? '***' : thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1 ? '***' : thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxType`).d('事务类型'),
        dataIndex: 'trxType',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.parentNumber`).d('父事务编号|行号'),
        dataIndex: 'parentNumber',
        width: 140,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.asnNumAndAsnLineNum`).d('送货单号|行号'),
        dataIndex: 'asnNumAndAsnLineNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.poNumAndLineNum`).d('订单号|行号'),
        dataIndex: 'poNumAndLineNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.displayReleaseNum`).d('发放号'),
        dataIndex: 'displayReleaseNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.displayLine`).d('发运行'),
        dataIndex: 'displayLineLocationNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.orderTypeName`).d('订单类型'),
        dataIndex: 'orderTypeName',
        width: 100,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 120,
      },
      {
        title: intl.get('entity.business.tag').d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purchaseOrgName`).d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.organizationName`).d('库存组织'),
        dataIndex: 'organizationName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.inventoryName`).d('库房'),
        dataIndex: 'inventoryName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purAgentName`).d('采购员'),
        dataIndex: 'purAgentName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierNum`).d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        // width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierSiteName`).d('供应商地点'),
        dataIndex: 'supplierSiteName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxDate`).d('事务日期'),
        dataIndex: 'trxDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.cancelledFlag`).d('是否取消'),
        dataIndex: 'cancelledFlag',
        width: 100,
        render: yesOrNoRender,
      },
    ];
    return (
      <React.Fragment>
        <Table
          bordered
          rowKey="categoryAssignId"
          columns={columns}
          dataSource={content}
          pagination={detailPagination}
          onChange={onTableChange}
          scroll={{ x: this.scrollWidth(columns, 750) }}
          // scroll={{ x: 3250 }}
        />
      </React.Fragment>
    );
  }
}

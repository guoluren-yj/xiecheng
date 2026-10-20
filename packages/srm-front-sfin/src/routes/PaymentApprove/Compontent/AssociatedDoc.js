import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { dateRender } from 'utils/renderer';
import { thousandBitSeparator, thousandBitSeparatorDJ } from '@/routes/utils';

@withCustomize({
  unitCode: ['SFIN.PAY_APPROVE_DETAIL.ASSOIATED_LINE'],
})
export default class AssociatedDoc extends Component {
  @Bind()
  getColumns() {
    // 订单号/行号 发放号; 发运号; 送货单号 | 行号; 事务编号 | 行号;  事务日期; 对账单号 | 行号; 订单类型; 业务实体; 采购组织; 采购员;
    const columns = [
      {
        title: intl.get(`sfin.payment.invoiceNumAndLineNum`).d('SRM发票号|行号'),
        dataIndex: 'invoiceNumAndLineNum',
        width: 165,
        fixed: 'left',
      },
      {
        title: intl.get(`sfin.payment.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
        fixed: 'left',
      },
      {
        title: intl.get(`sfin.payment.itemName`).d('物料描述'),
        dataIndex: 'itemName',
        width: 130,
        fixed: 'left',
      },
      {
        title: intl.get(`sfin.payment.specificationsAndModel`).d('规格型号'),
        dataIndex: 'specificationsAndModel',
        // width: 150,
      },
      //   税务发票代码 物料编码 物料描述 规格型号 单位
      {
        title: intl.get(`sfin.payment.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 150,
      },
      {
        title: intl.get(`sfin.payment.quantity`).d('开票数量'),
        dataIndex: 'quantity',
        width: 150,
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get(`sfin.payment.netPrice`).d('不含税单价'),
        dataIndex: 'netPrice',
        width: 150,
        render: (text, record) => thousandBitSeparatorDJ(text, record.pricePrecision),
      },
      {
        title: intl.get(`sfin.payment.netAmount`).d('不含税金额'),
        dataIndex: 'netAmount',
        width: 150,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`sfin.payment.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 150,
      },
      {
        title: intl.get(`sfin.payment.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        width: 150,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`sfin.payment.taxIncludedPrice`).d('含税单价'),
        dataIndex: 'taxIncludedPrice',
        width: 150,
        render: (text, record) => thousandBitSeparatorDJ(text, record.pricePrecision),
      },
      {
        title: intl.get(`sfin.payment.taxIncludedAmount`).d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        width: 150,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`sfin.payment.poNumAndLineNum`).d('订单号|行号'),
        dataIndex: 'poNumAndLineNum',
        width: 160,
      },
      {
        title: intl.get(`sfin.payment.displayReleaseNum`).d('发放号'),
        dataIndex: 'displayReleaseNum',
        width: 100,
      },
      {
        title: intl.get(`sfin.payment.displayLineLocationNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 100,
      },
      {
        title: intl.get(`sfin.payment.prNumAndLineNum`).d('采购申请号/行号'),
        dataIndex: 'prNumAndLineNum',
        width: 160,
      },
      {
        title: intl.get(`sfin.payment.asnNumAndAsnLineNum`).d('送货单号|行号'),
        dataIndex: 'asnNumAndAsnLineNum',
        width: 160,
      },
      {
        title: intl.get(`sfin.payment.trxAndLineNum`).d('事务编号|行号'),
        dataIndex: 'trxAndLineNum',
        width: 160,
      },
      {
        title: intl.get(`sfin.payment.trxDate`).d('事务日期'),
        dataIndex: 'trxDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sfin.payment.billNumAndBillLineNum`).d('对账单号|行号'),
        dataIndex: 'billNumAndBillLineNum',
        width: 160,
      },
      {
        title: intl.get(`sfin.payment.orderTypeName`).d('订单类型'),
        dataIndex: 'orderTypeName',
        width: 150,
      },
      {
        title: intl.get(`sfin.payment.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`sfin.payment.organizationName`).d('采购组织'),
        dataIndex: 'organizationName',
        width: 150,
      },
      {
        title: intl.get(`sfin.payment.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 150,
      },
    ];
    return columns;
  }

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
    const columns = this.getColumns();
    const { dataSource, pagination, onTableChange, loading, customizeTable } = this.props;
    return customizeTable(
      {
        code: 'SFIN.PAY_APPROVE_DETAIL.ASSOIATED_LINE',
      },
      <Table
        bordered
        rowKey="billLineId"
        columns={columns}
        loading={loading}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onTableChange}
        scroll={{ x: this.scrollWidth(columns, 150) }}
      />
    );
  }
}

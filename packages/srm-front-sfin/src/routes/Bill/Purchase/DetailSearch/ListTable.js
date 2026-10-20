import React, { Component } from 'react';
import { Table, Popover } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import {
  dateRender,
  yesOrNoRender,
  //  numberRender
} from 'utils/renderer';
import { thousandBitSeparator, thousandBitSeparatorDJ } from '@/routes/utils';

const prefix = `sfin.invoiceBill.model.invoiceBill`;

@withCustomize({
  unitCode: ['SFIN.BILL_PURCHASE_LIST.DETAIL_GRID'],
})
export default class ListTable extends Component {
  render() {
    const {
      dataSource = [],
      pagination = {},
      loading,
      onFetchList,
      rowSelection,
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${prefix}.billNum`).d('开票单号'),
        dataIndex: 'displayBillNum',
        width: 180,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'billStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.trxAndLineNum`).d('事务编号|行号'),
        dataIndex: 'trxAndLineNum',
        width: 180,
      },
      {
        title: intl.get('entity.item.code').d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get('entity.item.name').d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`${prefix}.categoryName`).d('物料类别'),
        dataIndex: 'categoryName',
        width: 150,
      },
      {
        title: intl.get(`${prefix}.commonName`).d('通用名'),
        dataIndex: 'commonName',
        width: 120,
      },
      {
        title: intl.get(`${prefix}.specificationsAndModel`).d('规格型号'),
        dataIndex: 'specificationsAndModel',
        width: 120,
      },
      {
        title: intl.get(`${prefix}.wbsElement`).d('WBS元素'),
        dataIndex: 'wbs',
        width: 120,
      },
      {
        title: intl.get(`${prefix}.model.unit`).d('单位'),
        dataIndex: 'unit',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.invoiceQuantityAvailable`).d('可开票数量'),
        dataIndex: 'invoiceQuantityAvailable',
        width: 100,
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get(`${prefix}.netPrice`).d('不含税单价'),
        dataIndex: 'netPrice',
        width: 100,
        render: (val, record) => {
          return record.priceShieldFlag === 1 ? '***' : thousandBitSeparatorDJ(val);
          //  numberRender(val, 2);
        },
      },
      {
        title: `${intl.get(`${prefix}.per`).d('每')}`,
        dataIndex: 'unitPriceBatch',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.netAmount`).d('不含税金额'),
        dataIndex: 'netAmount',
        width: 100,
        render: (val, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : //  numberRender(val, 2);
              thousandBitSeparator(val, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${prefix}.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.taxIncludedPrice`).d('含税单价'),
        dataIndex: 'taxIncludedPrice',
        width: 100,
        render: (val, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : //  numberRender(val, 2)
              thousandBitSeparatorDJ(val);
        },
      },
      {
        title: intl.get(`${prefix}.taxIncludedAmount`).d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        width: 100,
        render: (val, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : // numberRender(val, 2);
              thousandBitSeparator(val, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${prefix}.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        width: 100,
        render: (val, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : //  numberRender(val, 2);
              thousandBitSeparator(val, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${prefix}.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.trxType`).d('事务类型'),
        dataIndex: 'trxType',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.parentNumber`).d('父事务编号|行号'),
        dataIndex: 'parentNumber',
        width: 140,
      },
      {
        title: intl.get(`${prefix}.asnNumAndAsnLineNum`).d('送货单号|行号'),
        dataIndex: 'asnNumAndAsnLineNum',
        width: 150,
      },
      {
        title: intl.get(`${prefix}.poNumAndLineNum`).d('订单号|行号'),
        dataIndex: 'poNumAndLineNum',
        width: 150,
      },
      {
        title: intl.get(`${prefix}.displayReleaseNum`).d('发放号'),
        dataIndex: 'displayReleaseNum',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.displayLine`).d('发运行'),
        dataIndex: 'displayLineLocationNum',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.orderTypeName`).d('订单类型'),
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
        title: intl.get(`${prefix}.purchaseOrgName`).d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 120,
      },
      {
        title: intl.get(`${prefix}.organizationName`).d('库存组织'),
        dataIndex: 'organizationName',
        width: 120,
      },
      {
        title: intl.get(`${prefix}.inventoryName`).d('库房'),
        dataIndex: 'inventoryName',
        width: 120,
      },
      {
        title: intl.get(`${prefix}.purAgentName`).d('采购员'),
        dataIndex: 'purAgentName',
        width: 120,
      },
      {
        title: intl.get(`${prefix}.supplierNum`).d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
      },
      {
        title: intl.get(`${prefix}.supplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 150,
      },
      {
        title: intl.get(`${prefix}.supplierSiteName`).d('供应商地点'),
        dataIndex: 'supplierSiteName',
        width: 120,
      },
      {
        title: intl.get(`${prefix}.trxDate`).d('事务日期'),
        dataIndex: 'trxDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`${prefix}.taxInvoiceNumber`).d('税务发票号'),
        dataIndex: 'taxInvoiceNums',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`${prefix}.erpInvoiceNum`).d('ERP发票号'),
        dataIndex: 'erpInvoiceNums',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`${prefix}.model.invoiceBill.cancelledFlag`).d('是否取消'),
        dataIndex: 'cancelledFlag',
        width: 100,
        render: yesOrNoRender,
      },
    ];
    const tableProps = {
      bordered: true,
      loading,
      dataSource,
      pagination,
      columns,
      rowKey: 'billDetailId',
      scroll: { x: tableScrollWidth(columns) },
      onChange: onFetchList,
      rowSelection,
    };
    return customizeTable(
      {
        code: 'SFIN.BILL_PURCHASE_LIST.DETAIL_GRID',
      },
      <Table {...tableProps} />
    );
  }
}

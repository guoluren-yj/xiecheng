/**
 * LineCreation - 按行引用创建
 * @date: 2019-02-20
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { sum } from 'lodash';
import intl from 'utils/intl';
import { formatUom, formatAumont } from '@/routes/components/utils';

export default class List extends PureComponent {
  defaultTableRowKey = 'poLineLocationId';

  render() {
    const { dataSource = [], rowKey, fetchDetailList, pagination, ...others } = this.props;
    const tableProps = {
      onChange: (page) => fetchDetailList(page),
      dataSource,
      pagination,
      columns: [
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.itemCode`).d('物料编码'),
          width: 120,
          dataIndex: 'itemCode',
          fixed: 'left',
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.itemName`).d('物料名称'),
          width: 120,
          dataIndex: 'itemName',
          fixed: 'left',
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.applicationCode`).d('申请编码'),
          dataIndex: 'displayPrNum',
          width: 120,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.lineNum`).d('行号'),
          dataIndex: 'displayLineNum',
          width: 120,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.supplierName`).d('供应商'),
          dataIndex: 'supplierName',
          width: 120,
          render: (val, record) => val || record.supplierCompanyName,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.uomName`).d('单位'),
          dataIndex: 'uomName',
          width: 120,
          render: (_, { uomCodeAndName }) => uomCodeAndName,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.quantity`).d('数量'),
          dataIndex: 'quantity',
          width: 120,
          render: (value) => formatAumont(value),
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.rateOfTaxation`).d('税率'),
          dataIndex: 'taxRate',
          width: 100,
        },
        {
          title: intl
            .get(`sodr.quotePurchase.model.quotePurchase.includedPrice`)
            .d('预估单价（含税）'),
          dataIndex: 'taxIncludedUnitPrice',
          width: 180,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.needByDate`).d('需求日期'),
          dataIndex: 'needByDate',
          width: 120,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.companyName`).d('公司'),
          dataIndex: 'companyName',
          width: 120,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.ouName`).d('业务实体'),
          dataIndex: 'ouName',
          width: 120,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.purchaseOrgId`).d('采购组织'),
          dataIndex: 'purchaseOrganizationName',
          width: 120,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.invOrganizationId`).d('库存组织'),
          dataIndex: 'invOrganizationName',
          width: 120,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.productNum`).d('商品编码'),
          dataIndex: 'productNum',
          width: 120,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.productName`).d('商品名称'),
          dataIndex: 'productName',
          width: 120,
        },
        {
          title: intl.get(`sodr.quotePurchase.model.quotePurchase.catalogName`).d('商品目录'),
          dataIndex: 'catalogName',
          width: 120,
        },
      ],
      rowKey: 'prLineId',
      bordered: true,
      ...others,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) };
    return <Table {...tableProps} />;
  }
}

/**
 * List
 * @date: 2020-02-05
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { dateRender } from 'utils/renderer';
import { sum } from 'lodash';
import intl from 'utils/intl';

export default class List extends Component {
  getColumns = () => {
    // 判断是否为 引用寻源单据
    const { quoteSourceFlag = false, showModal } = this.props;
    // 采购申请单据
    const createColumns = [
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
        dataIndex: 'prNum',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.lineNum`).d('行号'),
        dataIndex: 'lineNum',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.supplierName`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 120,
        render: (val, record) => record.supplierCompanyName || record.supplierName,
      },
      {
        title: intl.get(`sodr.quotePurchase.model.quotePurchase.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.createdOrderNum`).d('可用数量'),
        dataIndex: 'availableQuantity',
        width: 120,
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
        dataIndex: 'neededDate',
        width: 120,
        render: dateRender,
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
        dataIndex: 'purchaseOrgName',
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
    ];
    // 寻源单据
    const quoteSourceSolumns = [
      {
        title: intl.get(`spcm.common.model.common.sourceNum`).d('寻源单号'),
        dataIndex: 'sourceNum',
        width: 150,
      },
      {
        title: intl.get(`spcm.common.model.common.lineNumber`).d('行号'),
        dataIndex: 'itemNum',
        width: 120,
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'companyNum',
        width: 150,
        render: (_, record) => record.supplierCompanyNum,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get(`spcm.common.model.common.stockOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.model.common.goodsNum`).d('物品编码'),
        dataIndex: 'itemCode',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.common.goodsName`).d('物品名称'),
        dataIndex: 'itemName',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.MaterialClassify`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 170,
      },
      {
        title: intl.get(`spcm.common.model.common.currencyType`).d('币种'),
        dataIndex: 'currencyCode',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.model.common.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.model.common.quantity`).d('数量'),
        dataIndex: 'quantity',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.occupyQuantity`).d('占用数量'),
        dataIndex: 'occupationQuantity',
        width: 100,
      },
      {
        title: intl.get(`spcm.common.model.common.createdOrderNum`).d('可用数量'),
        dataIndex: 'availableQuantity',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
        dataIndex: 'taxRate',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.noTaxPrice`).d('不含税单价'),
        dataIndex: 'unitPrice',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.noTaxAmount`).d('不含税金额'),
        dataIndex: 'amountExcludingTax',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.TaxPrice`).d('含税单价'),
        dataIndex: 'taxIncludedUnitPrice',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.TaxAmount`).d('含税金额'),
        dataIndex: 'taxAmount',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.promiseDate`).d('承诺交货日期'),
        dataIndex: 'validPromisedDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.common.model.common.ladderOffer`).d('阶梯报价'),
        dataIndex: 'ladderOffer',
        width: 120,
        render: (val, record) =>
          // eslint-disable-next-line no-extra-boolean-cast
          Boolean(record.quotationLineId) ? (
            <a onClick={() => showModal(record)}>
              {intl.get(`spcm.common.model.common.ladderOffer`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 100,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`spcm.common.model.common.purchaseOrg`).d('采购组织'),
        dataIndex: 'purchaseOrganizatioName',
        width: 100,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'realName',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
      },
      {
        title: intl.get(`spcm.common.model.common.purReqNumOrLine`).d('采购申请单号|行号'),
        dataIndex: 'prLineNum',
        width: 180,
        render: (value, record) => {
          if (!record.prNum && !record.prLineNum) {
            return null;
          }
          return `${record.prNum || ''}|${record.prLineNum || ''}`;
        },
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'itemRemark',
        width: 100,
      },
    ];

    return quoteSourceFlag ? quoteSourceSolumns : createColumns;
  };

  render() {
    const {
      dataSource = [],
      rowKey,
      quoteSourceFlag,
      fetchDetailList,
      pagination,
      ...others
    } = this.props;
    const tableProps = {
      onChange: (page) => fetchDetailList(page),
      dataSource,
      pagination,
      columns: this.getColumns(),
      rowKey: quoteSourceFlag ? 'resultId' : 'prLineId',
      bordered: true,
      ...others,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) };
    return <Table {...tableProps} />;
  }
}

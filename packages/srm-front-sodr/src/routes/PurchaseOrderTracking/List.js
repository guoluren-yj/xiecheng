/*
 * PurchaseOrderTracking - 采购订单跟踪报表列表
 * @date: 2020/02/27 14:45:33
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import EditTable from 'components/EditTable';
import { Bind } from 'lodash-decorators';
import DocFlow from '_components/DocFlow';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { dateTimeRender } from 'utils/renderer';

import { formatAumont } from '@/routes/components/utils';

export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @Bind()
  getCloumns() {
    const columns = [
      {
        title: intl.get('sodr.common.model.common.displayPrNum').d('采购申请编号'),
        dataIndex: 'displayPrNum',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.applicationType').d('申请类型'),
        dataIndex: 'prTypeName',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.ouName').d('业务实体'),
        dataIndex: 'ouName',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.purOrganizationId').d('采购组织'),
        dataIndex: 'organizationName',
        width: 200,
      },
      {
        title: intl.get(`sodr.common.model.common.agentId`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.requirementCreator').d('需求创建人'),
        dataIndex: 'realName',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.invoiceTitle').d('发票抬头（开票主体）'),
        dataIndex: 'invoiceTitle',
        width: 200,
      },
      {
        title: intl.get('hzero.common.date.creation').d('创建时间'),
        dataIndex: 'creationDate',
        width: 200,
        render: (text) => {
          const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
          const formatDom = dateTimeRender(dom) || null;
          return <>{formatDom}</>;
        },
      },
      {
        title: intl.get('sodr.common.model.common.displayPrLineNum').d('采购申请行号'),
        dataIndex: 'displayLineNum',
        width: 150,
      },
      {
        title: intl.get('sodr.common.model.common.purReqAppliedName').d('需求申请人'),
        dataIndex: 'prRequestedName',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.centerGroup').d('中心部门'),
        dataIndex: 'unitName',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.requestItemCode').d('申请物料编码'),
        dataIndex: 'itemCode',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.requestItemName').d('申请物料名称'),
        dataIndex: 'itemName',
        width: 200,
      },
      {
        title: intl
          .get('sodr.common.model.common.requestItemCategory')
          .d('申请物料类别（采购品类）'),
        dataIndex: 'prCategoryName',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.commodityEncoding').d('商品编码'),
        dataIndex: 'productNum',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.tradeName').d('商品名称'),
        dataIndex: 'productName',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.catalogue').d('商品目录'),
        dataIndex: 'catalogName',
        width: 200,
      },
      // {
      //   title: intl.get('sodr.common.model.common.specifications').d('规格'),
      //   dataIndex: 'itemSpecs',
      //   width: 200,
      // },
      {
        title: intl.get('sodr.common.model.common.uomName').d('需求单位'),
        dataIndex: 'uomName',
        width: 100,
        render: (_, { uomCodeName }) => uomCodeName,
      },
      {
        title: intl.get('sodr.common.model.common.num').d('需求数量'),
        dataIndex: 'prQuantity',
        width: 100,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get('sodr.common.model.common.lastPurchaseprice').d('历史含税单价'),
        dataIndex: 'poLastPurchasePrice',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.erpContractNum').d('合同编号'),
        dataIndex: 'pcNum',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.warrantyTime').d('保修时间（备注）'),
        dataIndex: 'remark',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.displayStatusCode').d('订单状态'),
        dataIndex: 'displayStatusMeaning',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.displayPoNumr').d('订单编号'),
        dataIndex: 'displayPoNum',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.poDisplayLineNum').d('订单行号'),
        dataIndex: 'poDisplayLineNum',
        width: 100,
      },
      {
        title: intl.get('sodr.common.model.common.shipmentNum').d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 100,
      },
      {
        title: intl.get('sodr.common.model.common.poItemCode').d('订单物料编码'),
        dataIndex: 'poItemCode',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.poItemName').d('订单物料名称'),
        dataIndex: 'poItemName',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.poCategoryName').d('订单物料类别（采购品类）'),
        dataIndex: 'poCategoryName',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.orderQuantity').d('订单数量'),
        dataIndex: 'quantity',
        width: 200,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get('sodr.common.model.common.unitPriceBatch').d('每'),
        dataIndex: 'unitPriceBatch',
        width: 200,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get('sodr.common.model.common.orderUomCode').d('订单单位'),
        dataIndex: 'poUomName',
        width: 200,
        render: (_, { poUomCodeName }) => poUomCodeName,
      },
      {
        title: intl.get('sodr.common.model.common.enteredTaxIncludedPrice').d('含税单价'),
        dataIndex: 'enteredTaxIncludedPrice',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.totalTax').d('含税总额'),
        dataIndex: 'taxIncludedLineAmount',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.itemSpecs').d('规格'),
        dataIndex: 'itemSpecs',
        width: 200,
      },
      {
        title: intl.get('entity.supplier.code').d('供应商编码'),
        dataIndex: 'supplierCode',
        width: 200,
      },
      {
        title: intl.get('entity.supplier.name').d('供应商名称'),
        dataIndex: 'supplierName',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.orderTime').d('下单时间'),
        dataIndex: 'releasedDate',
        width: 200,
        render: (text) => {
          const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
          const formatDom = dateTimeRender(dom) || null;
          return <>{formatDom}</>;
        },
      },
      {
        title: intl.get('sodr.common.model.common.sourceCode').d('来源系统'),
        dataIndex: 'poSourcePlatformMeaning',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.prSourcePlatformMeaning').d('单据来源'),
        dataIndex: 'sourceBillTypeMeaning',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.promiseDeliveryDate').d('承诺交货日期'),
        dataIndex: 'promiseDeliveryDate',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.netDeliverQuantity').d('到货数量'),
        dataIndex: 'netDeliverQuantity',
        width: 200,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get('sodr.common.model.common.trxDate').d('到货时间'),
        dataIndex: 'trxDate',
        width: 200,
        render: (text) => {
          const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
          const formatDom = dateTimeRender(dom) || null;
          return <>{formatDom}</>;
        },
      },
      {
        title: intl.get('sodr.common.model.common.billQuantity').d('对账数量'),
        dataIndex: 'billQuantity',
        width: 200,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get('sodr.common.model.common.billTaxIncludedAmount').d('对账金额'),
        dataIndex: 'billTaxIncludedAmount',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.invoiceTaxIncludedAmount').d('发票总额'),
        dataIndex: 'invoiceTaxIncludedAmount',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.invoiceAuantity').d('发票数量'),
        dataIndex: 'invoiceQuantity',
        width: 200,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get('sodr.common.model.common.satisfactionDegreeMeaning').d('满意度'),
        dataIndex: 'satisfactionDegreeMeaning',
        width: 200,
      },
      {
        title: intl.get('sodr.common.model.common.evaluateRemark').d('满意度-备注'),
        dataIndex: 'evaluateRemark',
        width: 200,
      },
      {
        width: 100,
        dataIndex: 'docFlow',
        title: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
        render: (_, record) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.poLineLocationId} />
        ),
      },
    ];
    return columns;
  }

  render() {
    const {
      fetchList = (e) => e,
      trackingList = [],
      rowSelection = {},
      fetchListLoading = false,
      trackingPagination = {},
      customizeTable,
    } = this.props;
    const columns = this.getCloumns();
    return customizeTable(
      {
        code: 'SODR.ORDER_TRACKING_LIST.LIST',
      },
      <EditTable
        bordered
        rowKey="poLineLocationId"
        columns={columns}
        dataSource={trackingList}
        scroll={{
          x: columns.map((item) => item.width).reduce((sum, val) => sum + val),
          y: 'calc(100vh - 350px)',
        }}
        onChange={(page) => fetchList(page, true)}
        loading={fetchListLoading}
        rowSelection={rowSelection}
        pagination={{ ...trackingPagination, showQuickJumper: true }}
      />
    );
  }
}

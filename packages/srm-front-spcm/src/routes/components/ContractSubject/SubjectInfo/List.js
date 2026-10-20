/**
 * List
 * @date: 2020-02-05
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { dateRender, dateTimeRender, numberRender, yesOrNoRender } from 'utils/renderer';
import { sum } from 'lodash';
import intl from 'utils/intl';
import { getDynamicLabel } from '@/utils/util';

export default class List extends Component {
  getColumns = () => {
    // 判断是否为 引用寻源单据
    const { quoteSourceFlag = false, remote, showModal, doubleUnitEnabled } = this.props;
    // 采购申请单据
    const createColumns = [
      {
        title: intl.get(`spcm.common.model.prNum`).d('申请编号'),
        dataIndex: 'prNum',
        width: 160,
        fixed: 'left',
      },
      {
        title: intl.get(`spcm.common.model.lineNum`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 160,
        fixed: 'left',
      },
      {
        title: intl.get(`spcm.common.model.common.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        fixed: 'left',
        width: 160,
      },
      {
        title: intl.get('spcm.common.model.projectTaskName').d('项目任务名称'),
        dataIndex: 'projectTaskId',
        width: 150,
        render: (_, record) => record.projectTaskName,
      },
      {
        title: intl.get(`spcm.common.model.common.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.common.categoryName`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 160,
      },
      {
        // title: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币含税单价'),
        title: getDynamicLabel(doubleUnitEnabled, 'taxIncludedUnitPrice'),
        dataIndex: 'taxIncludedUnitPrice',
        width: 160,
        // render: (val) => numberRender(val, 2),
      },
      {
        title: intl.get(`spcm.common.model.common.taxType`).d('税种'),
        dataIndex: 'taxCode',
        width: 160,
        // render: val => numberRender(val, 2),
      },
      {
        title: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
        dataIndex: 'taxRate',
        width: 160,
        render: (val) => numberRender(val, 2),
      },
      {
        title: intl.get(`spcm.common.model.common.currencyCode`).d('原币币种'),
        dataIndex: 'currencyCode',
        width: 160,
      },
      {
        // title: intl.get(`spcm.common.model.common.unit`).d('单位'),
        title: getDynamicLabel(doubleUnitEnabled),
        dataIndex: 'uomName',
        width: 160,
        render: (_, record) => record.uomCodeAndName,
      },
      {
        // title: intl.get(`spcm.common.model.common.quantity`).d('数量'),
        title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
        dataIndex: 'quantity',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.common.availableQuantity`).d('可用数量'),
        dataIndex: 'availableQuantity',
        width: 160,
        render: (_, record) =>
          doubleUnitEnabled ? record.secondaryAvailableQuantity : record.availableQuantity,
      },
      {
        title: intl.get(`spcm.common.model.executionStatusCode`).d('执行状态'),
        dataIndex: 'executionStatusCodeMeaning',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.reqTypeCode`).d('申请类型'),
        dataIndex: 'reqTypeCode',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCode',
        width: 160,
        render: (_, record) => <span>{record.supplierCode || record.supplierCompanyCode}</span>,
      },
      {
        title: intl.get(`spcm.common.model.supplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 160,
        render: (_, record) => <span>{record.supplierName || record.supplierCompanyName}</span>,
      },
      {
        title: intl.get(`spcm.common.model.companyName`).d('公司'),
        dataIndex: 'companyName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.purchaseOrgName`).d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.purchaseOrgGroupName`).d('采购员'),
        dataIndex: 'agentName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.productNum`).d('商品编码'),
        dataIndex: 'productNum',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.productName`).d('商品名称'),
        dataIndex: 'productName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.catalogName`).d('商品目录'),
        dataIndex: 'catalogName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.prRequestedName`).d('申请人'),
        dataIndex: 'prRequestedName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.common.telNum`).d('联系电话'),
        dataIndex: 'contactTelNum',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.invoiceAddress`).d('收货方地址'),
        dataIndex: 'invoiceAddress',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.neededDate`).d('需求日期'),
        dataIndex: 'neededDate',
        width: 160,
        render: (val) => dateRender(val, 2),
      },
      {
        title: intl.get(`spcm.common.model.companyOrgName`).d('公司组织'),
        dataIndex: 'companyOrgName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.costAnchDepDesc`).d('费用挂靠部门'),
        dataIndex: 'costAnchDepDesc',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.expBearDep`).d('费用承担部门'),
        dataIndex: 'expBearDep',
        width: 160,
      },
      // {
      //   title: intl.get(`spcm.common.model.itemAtrMeaning`).d('属性'),
      //   dataIndex: 'itemAtrMeaning',
      //   width: 160,
      // },
      {
        title: intl.get(`spcm.common.model.agentName`).d('采购员'),
        dataIndex: 'agentName',
        width: 160,
      },
      // {
      //   title: intl.get(`spcm.common.model.keeperUserName`).d('保管人'),
      //   dataIndex: 'keeperUserName',
      //   width: 160,
      // },
      // {
      //   title: intl.get(`spcm.common.model.accepterUserName`).d('验收人'),
      //   dataIndex: 'accepterUserName',
      //   width: 160,
      // },
      {
        title: intl.get(`spcm.common.model.location`).d('地点'),
        dataIndex: 'addressMeaning',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.projectCode`).d('项目编码'),
        dataIndex: 'projectNum',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.projectName`).d('项目名称'),
        dataIndex: 'projectName',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.prSourcePlatformMeaning`).d('来源平台'),
        dataIndex: 'prSourcePlatformMeaning',
        width: 160,
      },
      {
        title: intl.get(`spcm.common.model.urgentFlag`).d('是否加急'),
        dataIndex: 'urgentFlag',
        width: 160,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: intl.get(`spcm.common.model.urgentDate`).d('加急时间'),
        dataIndex: 'urgentDate',
        width: 160,
        render: (val) => dateTimeRender(val, 2),
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get('spcm.common.model.executorName').d('需求执行人'),
        dataIndex: 'executorName',
        width: 160,
      },
      doubleUnitEnabled && {
        title: intl.get(`spcm.common.model.common.unit`).d('单位'),
        dataIndex: 'secondaryUomId',
        width: 180,
        render: (_, record) => record.secondaryUomCodeAndName,
      },
      doubleUnitEnabled && {
        title: intl.get(`spcm.common.model.common.quantity`).d('数量'),
        dataIndex: 'secondaryQuantity',
        width: 120,
      },
      doubleUnitEnabled && {
        title: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
        dataIndex: 'taxIncludedSecondaryUnitPrice',
        width: 150,
      },
    ].filter(Boolean);
    // 寻源单据
    const quoteSourceSolumns = [
      {
        title: intl.get(`spcm.common.model.common.sourceNum`).d('寻源单号'),
        dataIndex: 'sourceNum',
        width: 150,
      },
      {
        title: intl.get('spcm.common.model.projectTaskName').d('项目任务名称'),
        dataIndex: 'projectTaskId',
        width: 150,
        render: (_, record) => record.projectTaskName,
      },
      {
        title: intl.get(`spcm.common.model.common.lineNumber`).d('行号'),
        dataIndex: 'itemNum',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.companyNum`).d('企业编码'),
        dataIndex: 'companyNum',
        width: 150,
        render: (_, record) => record.supplierCompanyNum,
      },
      {
        title: intl.get(`spcm.common.model.common.supplierCompanyName2`).d('企业名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get(`spcm.common.model.common.erpSupplierId`).d('ERP供应商编码'),
        dataIndex: 'supplierNum',
        width: 150,
      },
      {
        title: intl.get('spcm.common.model.common.erpSupplierName').d('ERP供应商名称'),
        dataIndex: 'supplierName',
        width: 150,
      },
      {
        title: intl.get('spcm.common.model.common.termId').d('付款条款'),
        dataIndex: 'termsName',
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
        title: getDynamicLabel(doubleUnitEnabled),
        dataIndex: 'uomName',
        width: 160,
        render: (_, record) => record.uomCodeAndName,
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
        dataIndex: 'quantity',
        width: 160,
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
        render: (_, record) =>
          doubleUnitEnabled ? record.secondaryAvailableQuantity : record.availableQuantity,
      },
      {
        title: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
        dataIndex: 'taxRate',
        width: 120,
      },
      {
        // title: intl.get(`spcm.common.model.common.noTaxPrice`).d('不含税单价'),
        title: getDynamicLabel(doubleUnitEnabled, 'unitPrice'),
        dataIndex: 'unitPrice',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.noTaxAmount`).d('不含税金额'),
        dataIndex: 'amountExcludingTax',
        width: 120,
      },
      {
        // title: intl.get(`spcm.common.model.common.TaxPrice`).d('含税单价'),
        title: getDynamicLabel(doubleUnitEnabled, 'taxIncludedUnitPrice'),
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
      // {
      //   title: intl.get(`spcm.common.model.common.buyer`).d('采购员'),
      //   dataIndex: 'purchaseAgentName',
      //   width: 100,
      // },
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
        width: 150,
        render: (value, record) => {
          if (!record.prNum && !record.prLineNum) {
            return null;
          }
          return `${record.prNum || ''}|${record.prLineNum || ''}`;
        },
      },
      {
        title: intl.get(`spcm.common.model.common.displayPrNumLineNum`).d('采购申请展示单号-行号'),
        dataIndex: 'prDisplayLineNum',
        width: 180,
        render: (value, record) => {
          if (!record.prDisplayNum && !record.prDisplayLineNum) {
            return null;
          }
          return `${record.prDisplayNum || ''}|${record.prDisplayLineNum || ''}`;
        },
      },
      {
        title: intl.get(`spcm.common.model.common.rfxRoleMan`).d('核价员'),
        dataIndex: 'rfxRoleMan',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'itemRemark',
        width: 100,
      },
      doubleUnitEnabled && {
        title: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
        dataIndex: 'taxIncludedSecondaryUnitPrice',
        width: 150,
      },
      doubleUnitEnabled && {
        title: intl.get(`spcm.common.model.unitPrice`).d('原币单价(不含税)'),
        dataIndex: 'secondaryUnitPrice',
        width: 150,
      },
      doubleUnitEnabled && {
        title: intl.get(`spcm.common.model.common.unit`).d('单位'),
        dataIndex: 'secondaryUomId',
        width: 180,
        render: (_, record) => record.secondaryUomCodeAndName,
      },
      doubleUnitEnabled && {
        title: intl.get(`spcm.common.model.common.quantity`).d('数量'),
        dataIndex: 'secondaryQuantity',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.common.contractPendingFlag`).d('是否暂挂'),
        dataIndex: 'contractPendingFlag',
        width: 100,
        render: (_, record) => record.contractPendingFlagMeaning,
      },
      {
        title: intl.get(`spcm.common.model.common.resultStatusSet`).d('寻源结果状态'),
        dataIndex: 'resultStatus',
        width: 150,
        render: (_, record) => record.resultStatusMeaning,
      },
      {
        title: intl.get(`spcm.common.model.common.occupyStatus`).d('占用状态'),
        dataIndex: 'occupyStatus',
        width: 150,
        render: (_, record) => record.occupyStatusMeaning,
      },
      {
        title: intl.get(`spcm.contractMaintain.model.sourceItemRemark`).d('物料说明'),
        dataIndex: 'sourceItemRemark',
        width: 100,
      },
    ].filter(Boolean);
    const columnArray = quoteSourceFlag ? quoteSourceSolumns : createColumns;
    return remote
      ? remote.process('SPCM_CONTRACT_MAINTAIN_DETAIL_SUBJECT_INFO_COLUMN', columnArray, {
          current: this,
        })
      : columnArray;
  };

  render() {
    const {
      dataSource = [],
      rowKey,
      quoteSourceFlag,
      fetchDetailList,
      pagination,
      customizeTable,
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
    return customizeTable(
      {
        code: quoteSourceFlag
          ? 'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.SOURCE'
          : 'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PURCHASE.DEMAND',
      },
      <Table {...tableProps} />
    );
  }
}

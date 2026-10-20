/**
 * index.js - 协议拟制列表
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
// import { Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum } from 'lodash';
import Table from 'srm-front-boot/lib/components/Table';
import intl from 'utils/intl';
import { getDynamicLabel } from '@/utils/util';
import { dateRender } from 'utils/renderer';

export default class List extends React.Component {
  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { showModal, viewApplicationOrgModal, doubleUnitEnabled } = this.props;
    const columnArray = [
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
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.applicationOrganization`)
          .d('适用其他组织'),
        dataIndex: 'sourceAppScopeLineDTOs',
        width: 120,
        render: (_, record) => (
          <a
            onClick={() => viewApplicationOrgModal(record.sourceAppScopeLineDTOs)}
            disabled={!record.sourceAppScopeLineDTOs}
          >
            {intl
              .get('ssrc.inquiryHall.model.inquiryHall.applicationOrganization')
              .d('适用其他组织')}
          </a>
        ),
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

    return columnArray;
  }

  render() {
    const {
      loading,
      dataSource,
      onSearch,
      pagination,
      selectedRows,
      onRowSelectChange = (e) => e,
      customizeTable,
    } = this.props;
    const selectedRowKeys = selectedRows.map((item) => item.resultId);
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: onRowSelectChange,
    };
    const tableProps = {
      loading,
      columns,
      dataSource,
      rowSelection,
      bordered: true,
      rowKey: 'resultId',
      onChange: (page) => onSearch(page),
      pagination,
    };
    tableProps.scroll = {
      x: sum(tableProps.columns.map((n) => n.width)) + 300,
      y: 'calc(100vh - 335px)',
    };

    return customizeTable(
      {
        code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.SOURCE',
      },
      <Table {...tableProps} />
    );
  }
}

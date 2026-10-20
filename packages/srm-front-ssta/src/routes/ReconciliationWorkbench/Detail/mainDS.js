/*
 * @Description:
 * @Date: 2020-08-20 14:21:53
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  filterNullValueObject,
  getDateFormat,
} from 'utils/utils';

import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { billLineConfig } from '@/utils/amountConfig';
import queryString from 'querystring';
// import { decimalPointAccuracy, getUrlVars } from '@/routes/utils';

// import { getDatas } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();
const customizeUnitCodeForBillLines =
  'SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAILS,SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAIL_SEARCH';

const validatorRender = (_, name, record) => {
  const { preValidator, preEditor } = billLineConfig[name];
  const { action } = record.dataSet;
  return preEditor(record, action) ? preValidator(name, record) : true;
};

const editAbleRender = ({ record, dataSet, name }) => {
  const { preEditor } = billLineConfig[name];
  const { action } = dataSet || record.dataSet;
  return preEditor(record, action);
};

// 头
const formDs = () => ({
  // autoQuery: true,
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'objectVersionNumber',
      type: 'string',
    },
    {
      name: 'billNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billNum')
        .d('对账单编号'),
      disabled: true,
    },
    {
      name: 'billStatus',
      type: 'string',
      lookupCode: 'SSTA.BILL_STATUS',
      defaultValue: 'NEW',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billStatus')
        .d('对账单状态'),
      required: true,
    },
    {
      name: 'camp',
      type: 'string',
      lookupCode: 'SSTA.CAMP',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.camp')
        .d('创建方阵营'),
    },
    {
      name: 'creationDate',
      type: 'date',
      format: 'YYYY-MM-DD HH:mm:ss',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.createdDate')
        .d('创建日期'),
    },
    {
      name: 'createdUserName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.createdUserName')
        .d('创建人'),
      disabled: true,
    },
    {
      name: 'companLov',
      type: 'object',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      textField: 'companyNum',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billCompanyCode')
        .d('对账公司编码'),
      noCache: true,
      required: true,
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      ignore: 'always',
    },
    {
      name: 'companyId',
      type: 'string',
      bind: 'companLov.companyId',
    },
    {
      name: 'companyNum',
      type: 'string',
      bind: 'companLov.companyNum',
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billCompanyName')
        .d('对账公司名称'),
      bind: 'companLov.companyName',
    },
    {
      name: 'currencyLov',
      type: 'object',
      lovCode: 'SMDM.LEDGER.CURRENCY',
      textField: 'currencyCode',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.currencyCode')
        .d('币种'),
      noCache: true,
      required: true,
      ignore: 'always',
    },
    {
      name: 'currencyCode',
      bind: 'currencyLov.currencyCode',
    },
    {
      name: 'currencyName',
      bind: 'currencyLov.currencyName',
    },
    {
      name: 'supplierCompanyLov',
      type: 'object',
      textField: 'supplierCompanyNum',
      label: intl.get('ssta.settlePool.model.settlePool.billSuppliersCode').d('对账供应商公司编码'),
      lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
      noCache: true,
      required: true,
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      ignore: 'always',
    },

    {
      name: 'supplierCompanyId',
      type: 'string',
      bind: 'supplierCompanyLov.supplierCompanyId',
    },
    {
      name: 'supplierCompanyNum',
      bind: 'supplierCompanyLov.supplierCompanyNum',
    },
    {
      name: 'supplierId',
      bind: 'supplierCompanyLov.supplierId',
    },
    {
      name: 'supplierNum',
      bind: 'supplierCompanyLov.supplierNum',
    },
    {
      name: 'supplierTenantId',
      type: 'string',
      bind: 'supplierCompanyLov.supplierTenantId',
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl
        .get('ssta.settlePool.model.settlePool.supplierCompanysNames')
        .d('对账供应商公司名称'),
      bind: 'supplierCompanyLov.supplierCompanyName',
    },
    {
      name: 'ouName',
      type: 'string',
      label: intl.get('ssta.settlePool.model.settlePool.ouName').d('业务实体'),
    },
    {
      name: 'sourceSupplierCompanyName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceSupplierName')
        .d('数据源平台供应商名称'),
    },
    {
      name: 'sourceSupplierCompanyNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceSupplierNum')
        .d('数据源平台供应商编码'),
    },
    {
      label: intl.get(`ssta.common.model.common.unitName`).d('部门名称'),
      type: 'string',
      name: 'unitName',
    },
    {
      name: 'netAmountMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.netAmount')
        .d('不含税总金额'),
    },
    {
      name: 'taxAmountMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.taxAmount')
        .d('税额'),
    },
    {
      name: 'taxIncludedAmountMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.taxIncludedAmount')
        .d('含税总金额'),
    },
    // 主策略信息
    {
      name: 'settleConfigNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.settleConfigNum')
        .d('主结算策略编码'),
    },
    {
      name: 'settleConfigName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.settleConfigName')
        .d('主结算策略名称'),
    },
    {
      name: 'configVersionNumber',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.configVersionNumber')
        .d('主结算策略版本号'),
    },
    {
      name: 'confirmCollaborativeModeMeaning',
      type: 'string',
      // lookupCode: 'SSTA.COOPERATION_MODE',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.confirmCollaborativeMode')
        .d('协同模式-确认'),
    },
    {
      name: 'confirmApproveMethodMeaning',
      type: 'string',
      // lookupCode: 'SSTA.APPROVAL_METHOD',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.confirmApproveMethod')
        .d('审批方式-确认'),
    },
    {
      name: 'autoIssueMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.auto')
        .d('自动出单'),
    },
    {
      name: 'cancelCollaborativeModeMeaning',
      type: 'string',
      // lookupCode: 'SSTA.COOPERATION_MODE',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.cancelCollaborativeMode')
        .d('协同模式-取消'),
    },
    {
      name: 'cancelApproveMethodMeaning',
      type: 'string',
      // lookupCode: 'SSTA.APPROVAL_METHOD',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.cancelApproveMethod')
        .d('审批方式-取消'),
    },
    {
      name: 'lineLimitQuantity',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.lineLimitQuantity')
        .d('对账单行数限制'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.remarks')
        .d('备注'),
    },
    {
      name: 'canceledReason',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.canceledReason')
        .d('取消原因'),
    },
    {
      name: 'approvedRemark',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.confirmApprovedRemark')
        .d('审批意见-确认'),
    },
    {
      name: 'canceledRemark',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.cancelApprovedRemark')
        .d('审批意见-取消'),
    },
    {
      name: 'ecBillNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.ecBillNum')
        .d('电商对账单编号'),
    },
    {
      name: 'termCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.termCode')
        .d('付款条件'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.invOrganizationName')
        .d('库存组织'),
    },
    {
      name: 'sourceSettleNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceSettleNum')
        .d('结算事务来源编号'),
    },
    {
      name: 'purOrganizationName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.purOrganizationName')
        .d('采购组织'),
    },
    {
      name: 'supplierSiteCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.supplierSiteCode')
        .d('供应商地点'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('ssta.costSheet.model.costSheet.purchaserEnclosure').d('采购方附件'),
    },
  ],
});

const filledInfoDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'canceledReason',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.canceledReason')
        .d('取消原因'),
    },
    {
      name: 'approvedRemark',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.confirmApprovedRemark')
        .d('审批意见-确认'),
    },
    {
      name: 'canceledRemark',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.cancelApprovedRemark')
        .d('审批意见-取消'),
    },
  ],
});

// 行DS
const tableDs = (props) => ({
  // autoQuery: true,
  primaryKey: 'billLineId',
  cacheSelection: true,
  forceValidate: true,
  // table表单显示的字段
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.lineNum')
        .d('对账单行号'),
    },
    {
      name: 'settleNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.settleNum')
        .d('结算事务编号'),
    },
    {
      name: 'sourceSettleNumAndLineNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceSettleAndLineNum')
        .d('结算事务来源编号-行号'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.itemCode')
        .d('结算商品编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.itemName')
        .d('结算商品名称'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.quantity')
        .d('本次对账数量'),
      dynamicProps: {
        required: editAbleRender,
      },
      validator: validatorRender,
    },
    {
      name: 'netPrice',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.netPriceMeaning')
        .d('本次对账不含税单价'),
      dynamicProps: {
        required: editAbleRender,
      },
      validator: validatorRender,
    },
    {
      name: 'unitPriceBatch',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.unitPriceBatch')
        .d('每'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.currentNetAmount')
        .d('本次对账不含税金额'),
      dynamicProps: {
        required: editAbleRender,
      },
      validator: validatorRender,
    },
    {
      name: 'taxRate',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.taxRate')
        .d('税率'),
    },
    {
      name: 'taxAmount',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.taxAmountMeaning')
        .d('税额'),
    },
    {
      name: 'taxIncludedPrice',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.taxIncludedPriceMeaning')
        .d('本次对账含税单价'),
      dynamicProps: {
        required: editAbleRender,
      },
      validator: validatorRender,
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.currentTaxIncludedAmount')
        .d('本次对账含税金额'),
      dynamicProps: {
        required: editAbleRender,
      },
      validator: validatorRender,
    },
    {
      name: 'settleMatchDimensionMeaning',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbench.model.reconciliationWorkbench.settleMatchDimensionMeaning'
        )
        .d('结算匹配维度'), //  SSTA.MATCH_DIMENSION
    },
    {
      name: 'settleBasePriceMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.settleBasePriceMeaning')
        .d('结算基准价'), // SSTA.BASE_PRICE
    },
    {
      name: 'enableQuantity',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.enableQuantity')
        .d('可对账数量'),
    },
    {
      name: 'orignPriceMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.orignPriceMeaning')
        .d('原对账单价'),
    },
    {
      name: 'enableAmountMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.enableAmountMeaning')
        .d('可对账金额'),
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.priceSource`)
        .d('取价来源'),
      type: 'string',
      name: 'priceSource',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.priceSourceMeaning`)
        .d('取价来源'),
      type: 'string',
      name: 'priceSourceMeaning',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceUnitPriceBatch`)
        .d('数据源每'),
      type: 'string',
      name: 'sourceUnitPriceBatch',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.libUnitPriceBatch`)
        .d('价格库每'),
      type: 'string',
      name: 'libUnitPriceBatch',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.libPrice`)
        .d('价格库价格'),
      type: 'string',
      name: 'libPrice',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.priceAction`)
        .d('取价时点'),
      type: 'string',
      name: 'priceAction',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.priceActionMeaning`)
        .d('取价时点'),
      type: 'string',
      name: 'priceActionMeaning',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.priceTime`)
        .d('取价时间'),
      type: 'dateTime',
      name: 'priceTime',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceNetPrice`)
        .d('数据源不含税单价'),
      type: 'string',
      name: 'sourceNetPrice',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceTaxIncludedPrice`)
        .d('数据源含税单价'),
      type: 'string',
      name: 'sourceTaxIncludedPrice',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.multiDealTrxNum`)
        .d('三方交易关联事务来源编号'),
      type: 'string',
      name: 'multiDealTrxNum',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.multiDealTrxLineNum`)
        .d('三方交易关联事务来源行'),
      type: 'string',
      name: 'multiDealTrxLineNum',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.multiDealPoNum`)
        .d('三方交易关联订单编号'),
      type: 'string',
      name: 'multiDealPoNum',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.multiDealPoLineNum`)
        .d('三方交易关联订单行号'),
      type: 'string',
      name: 'multiDealPoLineNum',
    },
    {
      name: 'operation',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.operation')
        .d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { billHeaderId } = data;
      const { action } = queryString.parse(props.location.search.slice(1));
      return {
        url: `/ssta/v1/${organizationId}/bill-lines/${billHeaderId}?customizeUnitCode=${customizeUnitCodeForBillLines}`,
        method: 'GET',
        data: {
          ...data,
          action,
        },
        // transformResponse: (res) => {
        //   const response = JSON.parse(res);
        //   response.content = response.content.map((item) => {
        //     return {
        //       ...item,
        //       quantity:
        //         action === 'UPDATE'
        //           ? decimalPointAccuracy(item.quantity, item.uomPrecision)
        //           : item.quantity,
        //     };
        //   });

        //   return response;
        // },
      };
    },
  },
});

const addModalDs = () => {
  return {
    selection: 'multiple',
    primaryKey: 'settleId',
    cacheSelection: true,
    autoQuery: false,
    dataToJSON: 'selected',
    queryFields: [],
    fields: [
      {
        name: 'settleNum',
        type: 'string',
        label: intl.get('ssta.settlePool.model.settlePool.settleNum').d('结算事务编号'),
      },
      {
        name: 'errorSettleNum',
        type: 'string',
        label: intl.get('ssta.settlePool.model.settlePool.errorSettleNum').d('结算事务编号'),
      },
      {
        name: 'souceSettleAndLineNum',
        type: 'string',
        label: intl
          .get('ssta.settlePool.model.settlePool.souceSettleAndLineNum')
          .d('结算事务来源编号｜行号'),
      },
      {
        label: intl.get(`ssta.settlePool.model.settlePool.company`).d('公司'),
        type: 'string',
        name: 'companyName',
      },
      {
        label: intl
          .get(`ssta.settlePool.model.settlePool.suppliersCompanyName`)
          .d('对账公司供应商名称'),
        type: 'string',
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssta.settlePool.model.settlePool.currencyCode`).d('币种'),
        type: 'string',
        name: 'currencyCode',
      },
      {
        label: intl.get(`ssta.settlePool.model.settlePool.itemName`).d('结算商品名称'),
        type: 'string',
        name: 'itemName',
      },
      {
        type: 'string',
        name: 'quantity',
        label: intl.get(`ssta.settlePool.model.settlePool.quantity`).d('可结算数量'),
      },
      {
        label: intl.get(`ssta.settlePool.model.settlePool.taxIncludedAmount`).d('可结算含税金额'),
        type: 'string',
        name: 'taxIncludedAmount',
      },
      {
        type: 'string',
        name: 'billStatusMeaning',
        label: intl.get(`ssta.settlePool.model.settlePool.billStatusMeaning`).d('对账状态'),
      },
      {
        type: 'string',
        name: 'invoiceStatusMeaning',
        label: intl.get(`ssta.settlePool.model.settlePool.invoiceStatusMeaning`).d('发票状态'),
      },
      {
        type: 'string',
        name: 'paymentStatusMeaning',
        label: intl.get(`ssta.settlePool.model.settlePool.paymentStatusMeaning`).d('付款状态'),
      },

      /**
       * 可对账
       */
      {
        label: intl.get(`ssta.settlePool.model.settlePool.netPrice`).d('不含税单价'),
        type: 'string',
        name: 'netPrice',
      },
      {
        label: intl.get(`hzero.common.view.unitPriceBatch`).d('每'),
        name: 'unitPriceBatch',
        type: 'string',
      },
      {
        label: intl.get('ssta.settlePool.model.settlePool.netAmount').d('不含税金额'),
        name: 'netAmount',
        type: 'string',
      },
      {
        label: intl
          .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.taxRate')
          .d('税率'),
        type: 'string',
        name: 'taxRate',
      },
      {
        label: intl.get(`ssta.settlePool.model.settlePool.taxAmount`).d('税额'),
        type: 'string',
        name: 'taxAmount',
      },
      {
        label: intl.get(`ssta.settlePool.model.settlePool.taxIncludedPrice`).d('含税单价'),
        type: 'string',
        name: 'taxIncludedPrice',
      },
      {
        label: intl.get(`ssta.settlePool.model.settlePool.taxIncludedAmount`).d('含税金额'),
        type: 'string',
        name: 'taxIncludedAmount',
      },

      /**
       * 可开票
       */

      /**
       * 可付款
       */
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.paymentOccupiedAmount`)
          .d('已付款发起金额'),
        type: 'string',
        name: 'paymentOccupiedAmount',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.ablePayAmount`)
          .d('可付款金额'),
        type: 'string',
        name: 'ablePayAmount',
      },

      /**
       * 垃圾箱
       */
      {
        label: intl.get(`ssta.settlePool.model.settlePool.errorType`).d('导入失败类型'),
        type: 'string',
        name: 'errorTypeMeaning',
      },
      {
        label: intl.get(`ssta.settlePool.model.settlePool.errorMsg`).d('导入失败原因'),
        type: 'string',
        name: 'errorMsg',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.priceSource`)
          .d('取价来源'),
        type: 'string',
        name: 'priceSource',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.priceSourceMeaning`)
          .d('取价来源'),
        type: 'string',
        name: 'priceSourceMeaning',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.libPrice`)
          .d('价格库价格'),
        type: 'string',
        name: 'libPrice',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.priceAction`)
          .d('取价时点'),
        type: 'string',
        name: 'priceAction',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.priceActionMeaning`)
          .d('取价时点'),
        type: 'string',
        name: 'priceActionMeaning',
      },
      {
        label: intl.get(`ssta.purchaseSettlePool.model.purchaseSettlePool.priceTime`).d('取价时间'),
        type: 'dateTime',
        name: 'priceTime',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceNetPrice`)
          .d('数据源不含税单价'),
        type: 'string',
        name: 'sourceNetPrice',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceTaxIncludedPrice`)
          .d('数据源含税单价'),
        type: 'string',
        name: 'sourceTaxIncludedPrice',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.libPriceFlag`)
          .d('是否本次已取价'),
        type: 'number',
        name: 'libPriceFlag',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.sourceUnitPriceBatch`)
          .d('数据源每'),
        type: 'string',
        name: 'sourceUnitPriceBatch',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.libUnitPriceBatch`)
          .d('价格库每'),
        type: 'string',
        name: 'libUnitPriceBatch',
      },
      {
        label: intl
          .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.supplierSiteCode`)
          .d('供应商地点'),
        type: 'string',
        name: 'supplierSiteCode',
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: (config) => {
        const { params, dataSet, data } = config;
        const {
          queryParameter: { type },
        } = dataSet;
        let url = '';
        const customizeUnitCodeB =
          'SSTA.PURCHASE_POOL_LIST.BILL_GRID, SSTA.PURCHASER_BILL_DETAIL.ADD';
        switch (type) {
          case 'A':
            url = isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settles/purchaser/page-all`
              : `/ssta/v1/settles/purchaser/page-all`;
            break;
          case 'B':
            url = isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settles/purchaser/page-bill-able?customizeUnitCode=${customizeUnitCodeB}`
              : `/ssta/v1/settles/purchaser/page-bill-able?customizeUnitCode=${customizeUnitCodeB}`;
            break;
          case 'C':
            url = isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settles/purchaser/page-invoice-able`
              : `/ssta/v1/settles/purchaser/page-invoice-able`;
            break;
          case 'D':
            url = isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settles/purchaser/page-payment-able`
              : `/ssta/v1/settles/purchaser/page-payment-able`;
            break;
          case 'E':
            url = isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/ssta-settle-errors/purchaser/page-all`
              : `/ssta/v1/ssta-settle-errors/purchaser/page-all`;
            break;
          default:
            url = isTenantRoleLevel()
              ? `/ssta/v1/${organizationId}/settles/purchaser/page-all`
              : `/ssta/v1/settles/purchaser/page-all`;
            break;
        }
        data.trxDateFrom =
          data.date &&
          data.date.start &&
          `${moment(data.date.start, getDateFormat()).format(DEFAULT_DATE_FORMAT)} 00:00:00`;
        data.trxDateTo =
          data.date &&
          data.date.end &&
          `${moment(data.date.end, getDateFormat()).format(DEFAULT_DATE_FORMAT)} 23:59:59`;
        delete data.date;
        delete data.type;
        return {
          url,
          method: 'GET',
          params: filterNullValueObject({
            ...params,
            ...data,
          }),
        };
      },
    },
  };
};

export { formDs, tableDs, addModalDs, filledInfoDs };

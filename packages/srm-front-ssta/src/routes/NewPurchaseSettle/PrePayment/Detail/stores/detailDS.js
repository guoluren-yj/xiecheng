import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import { amountFormatterOptions, numberFormatterOptions } from '@/utils/utils';
import {
  headUnitCodes,
  lineUnitCodes,
  cuszLineUnitCodeMap,
  paymentStageCode,
  paymentStageLineCode,
} from '..';

const organizationId = getCurrentOrganizationId();

const apiPrefix = `${SRM_SSTA}/v1/${organizationId}`;

export const prePaymentHeaderDS = (settleHeaderId) => {
  return {
    autoCreate: true,
    paging: false,
    forceValidate: true,
    fields: [
      /**
       * 基本信息
       */
      {
        name: 'settleNum',
        type: 'object',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleNum').d('结算单编号'),
      },
      {
        name: 'settleStatus',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleStatus').d('结算单状态'),
        lookupCode: 'SSTA.SETTLE_STATUS',
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.camp').d('创建方阵营'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.creationDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.createdUserName').d('创建人'),
      },
      {
        name: 'createdUnitLov',
        type: 'object',
        lovCode: 'SPRM.USER_EMPLOYEE_ALL_UNIT',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.createdUnitName').d('创建人部门'),
        noCache: true,
        lovPara: {
          tenantId: getCurrentOrganizationId(),
        },
        ignore: 'always',
      },
      {
        name: 'createdUnitName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.createdUnitName').d('创建人部门'),
        bind: 'createdUnitLov.unitName',
      },
      {
        name: 'createdUnitId',
        type: 'string',
        bind: 'createdUnitLov.unitId',
      },
      {
        name: 'documentType',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.documentType').d('结算单类型'),
        lookupCode: 'SSTA.RECORD_DOCUMENT_TYPE',
        defaultValue: 'PREPAYMENT',
      },
      {
        name: 'settleTypeMeaning',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.documentType').d('结算单类型'),
      },
      {
        name: 'importPayPlatformFlag',
        type: 'string',
        label: intl
          .get(`ssta.common.model.purchaseSettle.importPayPlatformFlag`)
          .d('是否导入支付池'),
        lookupCode: 'HPFM.FLAG',
      },
      /**
       * 交易方信息
       */
      {
        name: 'companyNumLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.settleCompanyName')
          .d('结算公司名称'),
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        ignore: 'always',
        noCache: true,
        required: true,
      },
      {
        name: 'companyNum',
        type: 'string',
        bind: 'companyNumLov.companyNum',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.settleCompanyNum')
          .d('结算公司编码'),
      },

      {
        name: 'companyId',
        type: 'string',
        bind: 'companyNumLov.companyId',
      },
      {
        name: 'companyName',
        type: 'string',
        bind: 'companyNumLov.companyName',
      },
      {
        name: 'currencyCodeLov',
        type: 'object',
        noCache: true,
        lovCode: 'SSTA.CURRENCY',
        lovPara: { organizationId },
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.currencyCode').d('币种'),
        required: true,
        ignore: 'always',
        textField: 'currencyCode',
      },
      {
        name: 'currencyCode',
        bind: 'currencyCodeLov.currencyCode',
        // required: true,
      },
      {
        name: 'currencyName',
        bind: 'currencyCodeLov.currencyName',
      },
      {
        name: 'supplierCompanyNumLov',
        type: 'object',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.settleSupplierName')
          .d('结算供应商名称'),
        lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
        ignore: 'always',
        noCache: true,
        required: true,
        dynamicProps: {
          disabled: ({ record }) => !record.get('companyId'),
          lovPara: ({ record }) => ({
            tenantId: organizationId,
            pageSource: 'PrepaymentSettle',
            companyId: record.get('companyId'),
          }),
        },
      },
      {
        name: 'supplierCompanyNum',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierCompanyNum',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.settleSupplierNum')
          .d('结算供应商编码'),
      },

      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierCompanyId',
      },
      {
        name: 'supplierTenantId',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierTenantId',
      },
      {
        name: 'supplierId',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierId',
      },
      {
        name: 'supplierNum',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierNum',
      },
      {
        name: 'supplierName',
        bind: 'supplierCompanyNumLov.supplierName',
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierCompanyName',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.settleSupplierName')
          .d('结算供应商名称'),
      },
      {
        name: 'ouName',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.ouName').d('业务实体'),
      },
      {
        name: 'supplierSiteLov',
        type: 'object',
        lovCode: 'SSTA.SUPPLIER_SITE',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.supplierSiteLov').d('供应商地点'),
        noCache: true,
        ignore: 'always',
        textField: 'supplierSiteCode',
        dynamicProps: {
          required: ({ record }) => record.get('supplierSiteEnableFlag') === 1,
          lovPara: ({ record }) => ({
            supplierId: record.get('supplierId'),
            tenantId: getCurrentOrganizationId(),
          }),
        },
      },
      {
        name: 'supplierSiteId',
        bind: 'supplierSiteLov.supplierSiteId',
      },
      {
        name: 'supplierSiteCode',
        bind: 'supplierSiteLov.supplierSiteCode',
      },
      {
        label: intl.get(`ssta.common.model.common.unitName`).d('部门名称'),
        type: 'string',
        name: 'unitName',
      },

      /**
       * 付款信息
       */
      {
        name: 'prepaymentType',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.prepaymentType').d('预付款类型'),
        required: true,
        lookupCode: 'SSTA.PREPAYMENT_TYPE',
      },
      {
        name: 'prepaymentAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.prepaymentAmount')
          .d('预付款总金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
        // TODO:
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.bankId`).d('收款银行'),
        type: 'object',
        name: 'bankIdLov',
        ignore: 'always',
        noCache: true,
        required: true,
        textField: 'bankName',
        dynamicProps: {
          lovCode: ({ dataSet }) =>
            dataSet.getState('supBankFlag')
              ? 'SSTA.COMPANY_BANK_ACCOUNT_SUP'
              : 'SSTA.COMPANY_BANK_ACCOUNT',
          disabled: ({ record }) => !record.get('supplierCompanyNumLov'),
          required: ({ record }) =>
            record.get('supplierCompanyNumLov') && record.get('refundStatus') !== 'REFUND',
          lovPara: ({ record }) => ({
            companyId: record.get('companyId'),
            supplierCompanyId: record.get('supplierCompanyId'),
            tenantId: getCurrentOrganizationId(),
            supplierId: record.get('supplierId'),
          }),
        },
        // cascadeMap: { parentValue: 'supplierCompanyNumLov' },
      },
      {
        name: 'bankId',
        bind: 'bankIdLov.bankId',
      },
      {
        name: 'bankName',
        bind: 'bankIdLov.bankName',
        // required: true,
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.bankId`).d('收款银行'),
        // dynamicProps: {
        //   required: ({ record }) => record.get('settleTaxAmount') > 0,
        // },
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.bankBranchName`).d('收款开户行'),
        type: 'string',
        name: 'bankBranchName',
        bind: 'bankIdLov.bankBranchName',
      },
      {
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.bankAccountNum`).d('收款银行帐号'),
        type: 'string',
        name: 'bankAccountNum',
        bind: 'bankIdLov.bankAccountNum',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.bankAccountName1`)
          .d('收款银行账户名称'),
        type: 'string',
        name: 'bankAccountName',
        bind: 'bankIdLov.bankAccountName',
      },
      {
        name: 'associationAccountId', // 关联账户id
        bind: 'bankIdLov.associationAccountId',
      },
      {
        name: 'associationSystem', // 账户来源系统（内部，外部）
        bind: 'bankIdLov.associationSystem',
      },
      {
        name: 'bankFirm', // 联行行号
        bind: 'bankIdLov.bankFirm',
      },
      {
        name: 'payBankLov',
        type: 'object',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentBank`).d('付款银行'),
        lovCode: 'SSTA.COMPANY_BANK_ACCOUNT_PURCHASER',
        dynamicProps: {
          disabled: ({ record }) => !record.get('companyId'),
          lovPara: ({ record }) => ({
            companyId: record.get('companyId'),
            tenantId: getCurrentOrganizationId(),
          }),
        },
        noCache: true,
      },
      {
        name: 'payBankId',
        bind: 'payBankLov.bankId',
      },
      {
        name: 'payBankName',
        bind: 'payBankLov.bankName',
      },
      {
        name: 'payBankBranchName',
        bind: 'payBankLov.bankBranchName',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.paymentBankBranch`)
          .d('付款开户行'),
        disabled: true,
      },
      {
        name: 'payBankAccountNum',
        bind: 'payBankLov.bankAccountNum',
        label: intl.get(`ssta.purchaseSettle.purchaseSettle.paymentBankAccount`).d('付款银行帐号'),
        disabled: true,
      },
      {
        name: 'payBankAccountName',
        bind: 'payBankLov.bankAccountName',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.paymentBankAccountName`)
          .d('付款银行账户名称'),
        disabled: true,
      },
      {
        name: 'payBankFirm', // 联行行号
        bind: 'payBankLov.bankFirm',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.paymentMethod`)
          .d('付款方式'),
        type: 'object',
        name: 'paymentMethodLov',
        lovCode: 'SMDM.PAYMENT_TYPE',
        ignore: 'always',
        noCache: true,
        // required: true,
        dynamicProps: {
          required: ({ record }) => record.get('refundStatus') !== 'REFUND',
        },
      },
      {
        name: 'paymentTypeId',
        bind: 'paymentMethodLov.typeId',
      },
      {
        name: 'paymentTypeName',
        bind: 'paymentMethodLov.typeName',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentCondition`).d('付款条件'),
        type: 'object',
        name: 'paymentCondition',
        ignore: 'always',
        lovCode: 'SMDM.PAYMENT.TERM',
        noCache: true,
        dynamicProps: {
          // required: () => true,
          required: ({ record }) => record.get('refundStatus') !== 'REFUND',
          lovPara: () => ({
            tenantId: getCurrentOrganizationId(),
          }),
        },
      },
      {
        name: 'paymentTermId',
        bind: 'paymentCondition.termId',
        // dynamicProps: {
        //   required: ({ record }) => record.get('settleTaxAmount') > 0,
        // },
      },
      {
        name: 'paymentTermName',
        bind: 'paymentCondition.termName',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.paymentDiscountAmount`)
          .d('付款折扣金额'),
        type: 'number',
        name: 'paymentDiscountAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planNum',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.paymentPlanNum`)
          .d('付款计划编号'),
      },
      {
        name: 'versionNumber',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.paymentPlanVersionNum`)
          .d('付款计划版本号'),
      },
      {
        name: 'planStageNum',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.payPlanStageNum`)
          .d('付款计划阶段编码'),
      },
      {
        name: 'planStageDesc',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.payPlanStageDesc`)
          .d('付款计划阶段描述'),
      },
      {
        name: 'planStageAmount',
        type: 'number',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.planStageAmount`)
          .d('计划阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planStageBalance',
        type: 'number',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.balanceStageAmount`)
          .d('剩余阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planStagePercent',
        type: 'number',
        label: intl.get(`ssta.purchaseSettle.view.purchaseSettle.stagePercent`).d('阶段比例（%）'),
      },
      {
        name: 'planStageStartDate',
        type: 'date',
        label: intl.get(`ssta.purchaseSettle.view.purchaseSettle.stageStartDate`).d('阶段开始日期'),
      },
      {
        name: 'planStageEndDate',
        type: 'date',
        label: intl.get(`ssta.purchaseSettle.view.purchaseSettle.stageEndDate`).d('阶段到期日期'),
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.expectPaymentDate`)
          .d('期望付款日期'),
        type: 'date',
        name: 'expectPaymentDate',
        dynamicProps: {
          required: ({ record }) => record.get('refundStatus') !== 'REFUND',
        },
      },
      // TODO:
      {
        name: 'remark',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.remark').d('备注'),
      },
      {
        name: 'canceledReason',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.canceledReason').d('取消原因'),
      },
      {
        name: 'confirmCollaborativeModeMeaning',
        type: 'string',
        // lookupCode: 'SSTA.COOPERATION_MODE',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.confirmCollaborativeMode')
          .d('协同模式-确认'),
      },
      {
        name: 'confirmApproveMethodMeaning',
        type: 'string',
        // lookupCode: 'SSTA.APPROVAL_METHOD',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.confirmApproveMethod')
          .d('审批方式-确认'),
      },
      {
        name: 'cancelCollaborativeModeMeaning',
        type: 'string',
        // lookupCode: 'SSTA.COOPERATION_MODE',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.cancelCollaborativeMode')
          .d('协同模式-取消'),
      },
      {
        name: 'cancelApproveMethodMeaning',
        type: 'string',
        // lookupCode: 'SSTA.APPROVAL_METHOD',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.cancelApproveMethod')
          .d('审批方式-取消'),
      },
      {
        name: 'approvedRemark',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.approvedRemark')
          .d('审批意见-确认'),
      },
      {
        name: 'canceledRemark',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.canceledRemark')
          .d('审批意见-取消'),
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.ouIdLov`).d('业务实体'),
        type: 'object',
        name: 'ouIdLov',
        ignore: 'always',
        lovCode: 'SSTA.SPFM.USER_AUTH.OU',
        noCache: true,
        dynamicProps: {
          disabled: ({ record }) => !record.get('companyId'),
          lovPara: ({ record }) => ({
            tenantId: getCurrentOrganizationId(),
            companyId: record.get('companyId'),
          }),
        },
      },
      {
        name: 'ouId',
        bind: 'ouIdLov.ouId',
      },
      {
        name: 'ouName',
        bind: 'ouIdLov.ouName',
      },
      {
        name: 'paymentControlRuleSource',
        type: 'string',
        lookupCode: 'SSTA.PAYMENT_CONTROL_RULE_SOURCE',
        label: intl.get('ssta.common.model.common.paymentControlRuleSource').d('付款管控规则来源'),
      },
      /**
       * 附件
       */
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.purchaserEnclosure`)
          .d('采购方附件'),
      },
      // 退款相关字段
      {
        name: 'refundStatus',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.refundStatus')
          .d('预付款退款标识'),
        lookupCode: 'SSTA.SETTLE_REFUND_STATUS',
      },
      {
        name: 'associatedPreSettleNum',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.relatePrePaymentNum')
          .d('关联预付款申请结算单编号'),
      },
      {
        name: 'prepaymentRefundAmount',
        type: 'number',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prePaymentRefundAmount`)
          .d('预付款退款总金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
    ],
    queryParameter: {
      settleHeaderId,
      customizeUnitCode: headUnitCodes.join(),
    },
    transport: {
      read: () => {
        return {
          url: `${apiPrefix}/pre-pay-headers/${settleHeaderId}`,
          method: 'GET',
        };
      },
    },
    events: {
      update: ({ name, value, record }) => {
        if (['supplierCompanyNumLov', 'companyNumLov'].includes(name) && value === null) {
          record.set('bankIdLov', null);
        }
      },
    },
  };
};

export const prePaymentFilledInfoDs = () => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'canceledReason',
        type: 'string',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.canceledReason').d('取消原因'),
      },
      {
        name: 'approvedRemark',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.approvedRemark')
          .d('审批意见-确认'),
      },
      {
        name: 'canceledRemark',
        type: 'string',
        label: intl
          .get('ssta.purchaseSettle.model.purchaseSettle.canceledRemark')
          .d('审批意见-取消'),
      },
    ],
  };
};

export const prePaymentLineDS = (settleHeaderId) => {
  return {
    pageSize: 20,
    selection: 'multiple',
    primaryKey: 'prepaymentLineId',
    cacheSelection: true,
    queryFields: [],
    forceValidate: true,
    cacheModified: true,
    fields: [
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.lineNum`).d('结算单行号'),
        type: 'string',
        name: 'lineNum',
      },
      {
        name: 'prepaymentAmount',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentAmount1`)
          .d('预付款行金额'),
        type: 'number',
        validator: (value) => {
          if (math.lt(value, 0)) {
            return intl
              .get(`ssta.common.message.validate.mustGreaterEqualZero`)
              .d(`必须大于等于零`);
          }
          // if (
          //   !jiuliFlag &&
          //   record.get('associateAmount') &&
          //   math.gt(value, record.get('associateAmount'))
          // ) {
          //   return intl
          //     .get(`ssta.purchaseSettle.model.supplySettle.pleaseInputSmall`)
          //     .d('预付款行金额不得大于关联单据金额');
          // }
          return true;
        },
        dynamicProps: {
          precision: ({ record }) => record.get('amountPrecision'),
          formatterOptions: amountFormatterOptions,
          required: () => true,
        },
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.associateNum`).d('关联单据号'),
        type: 'object',
        name: 'associateNumLov',
        ignore: 'always',
        noCache: true,
      },
      {
        name: 'associateNum',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.associateNum`).d('关联单据号'),
        type: 'string',
      },
      {
        name: 'associateLineNum',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.associateLineNum`)
          .d('关联单据行号'),
      },
      {
        name: 'associateNumAndLineNum',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.associateNumAndLineNum`)
          .d('关联单据号 | 关联单据行号'),
        type: 'string',
      },
      {
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.associateAmount`)
          .d('关联单据金额'),
        type: 'number',
        name: 'associateAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'launchPrepaymentAmount',
        type: 'number',
        label: intl
          .get('ssta.prePayment.model.prePayment.prepaymentInitiatedAmount')
          .d('预付款已发起金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'prepaymentOccupiedAmount',
        type: 'number',
        label: intl
          .get('ssta.prePayment.model.prePayment.prepaymentOccupiedAmount')
          .d('预付款已占用金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        type: 'number',
        label: intl
          .get('ssta.prePayment.model.prePayment.prepaymentCompletedAmount')
          .d('预付款已完成金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.prepaymentApplyAmount`).d('已核销金额'),
        type: 'number',
        name: 'prepaymentApplyAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.poItemName`).d('商品名称'),
        type: 'string',
        name: 'itemName',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.quantity`).d('数量'),
        type: 'number',
        name: 'quantity',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.taxIncludedLineAmount`).d('含税行金额'),
        type: 'number',
        name: 'taxIncludedLineAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.lineAmount1`).d('不含税行金额'),
        type: 'number',
        name: 'lineAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.categoryName`).d('品类'),
        type: 'string',
        name: 'categoryName',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.poCreatedNameOrigin`).d('来源单据创建人'),
        type: 'string',
        name: 'poCreatedName',
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.poCreationDate`).d('订单创建时间'),
        type: 'dateTime',
        name: 'poCreationDate',
      },
      {
        name: 'settleHeaderNum',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prePaymentApplyNum`)
          .d('预付款申请编号'),
      },
      {
        name: 'planNum',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.paymentPlanNum`)
          .d('付款计划编号'),
      },
      {
        name: 'versionNumber',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.paymentPlanVersionNum`)
          .d('付款计划版本号'),
      },
      {
        name: 'planStageNum',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.payPlanStageNum`)
          .d('付款计划阶段编码'),
      },
      {
        name: 'planStageDesc',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.payPlanStageDesc`)
          .d('付款计划阶段描述'),
      },
      {
        name: 'planStageAmount',
        type: 'number',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.planStageAmount`)
          .d('计划阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planStageBalance',
        type: 'number',
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.balanceStageAmount`)
          .d('剩余阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planStagePercent',
        type: 'number',
        label: intl.get(`ssta.purchaseSettle.view.purchaseSettle.stagePercent`).d('阶段比例（%）'),
      },
      {
        name: 'planStageStartDate',
        type: 'date',
        label: intl.get(`ssta.purchaseSettle.view.purchaseSettle.stageStartDate`).d('阶段开始日期'),
      },
      {
        name: 'planStageEndDate',
        type: 'date',
        label: intl.get(`ssta.purchaseSettle.view.purchaseSettle.stageEndDate`).d('阶段到期日期'),
      },
      {
        name: 'paymentTypeName',
        type: 'string',
        label: intl
          .get(`ssta.purchaseSettle.view.message.model.purchaseSettle.paymentMethod`)
          .d('付款方式'),
      },
      {
        name: 'paymentTermName',
        type: 'string',
        label: intl.get(`ssta.purchaseSettle.model.purchaseSettle.paymentCondition`).d('付款条件'),
      },
      {
        name: 'orderOverAmountValidateRuleEnableFlagMeaning',
        type: 'string',
        label: intl
          .get(
            `ssta.purchaseSettle.view.purchaseSettle.orderOverAmountValidateRuleEnableFlagMeaning`
          )
          .d('是否启用超额校验(订单)'),
      },
      {
        name: 'orderOverAmountValidateRuleCheckLevelMeaning',
        type: 'string',
        label: intl
          .get(
            `ssta.purchaseSettle.view.purchaseSettle.orderOverAmountValidateRuleCheckLevelMeaning`
          )
          .d('校验等级(订单)'),
      },
      {
        name: 'orderOverAmountValidateRuleTolControlTypeMeaning',
        type: 'string',
        label: intl
          .get(
            `ssta.purchaseSettle.view.purchaseSettle.orderOverAmountValidateRuleTolControlTypeMeaning`
          )
          .d('超额校验允差控制类型(订单)'),
      },
      {
        name: 'orderOverAmountValidateRuleTolTolRange',
        type: 'number',
        label: intl
          .get(`ssta.purchaseSettle.view.purchaseSettle.orderOverAmountValidateRuleTolTolRange`)
          .d('超额校验允差(订单)'),
      },
      {
        name: 'contractOverAmountValidateRuleEnableFlagMeaning',
        type: 'string',
        label: intl
          .get(
            `ssta.purchaseSettle.view.purchaseSettle.contractOverAmountValidateRuleEnableFlagMeaning`
          )
          .d('是否启用超额校验(协议)'),
      },
      {
        name: 'contractOverAmountValidateRuleCheckLevelMeaning',
        type: 'string',
        label: intl
          .get(
            `ssta.purchaseSettle.view.purchaseSettle.contractOverAmountValidateRuleCheckLevelMeaning`
          )
          .d('校验等级(协议)'),
      },
      {
        name: 'contractOverAmountValidateRuleTolControlTypeMeaning',
        type: 'string',
        label: intl
          .get(
            `ssta.purchaseSettle.view.purchaseSettle.contractOverAmountValidateRuleTolControlTypeMeaning`
          )
          .d('超额校验允差控制类型(协议)'),
      },
      {
        name: 'contractOverAmountValidateRuleTolTolRange',
        type: 'number',
        label: intl
          .get(`ssta.purchaseSettle.view.purchaseSettle.contractOverAmountValidateRuleTolTolRange`)
          .d('超额校验允差(协议)'),
      },
      // 退款相关
      {
        name: 'associatedPrepaymentAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.prePayment.associatedPrepaymentAmount')
          .d('被退款预付款行金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'refundCompletedPreAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.prePayment.refundCompletedPreAmount')
          .d('退款完成后预付款行金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'refundAmount',
        type: 'number',
        label: intl.get('ssta.purchaseSettle.model.prePayment.refundAmount').d('本次退款金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
        validator: (value) => {
          if (math.lt(value, 0)) {
            return intl
              .get(`ssta.common.message.validate.mustGreaterEqualZero`)
              .d(`必须大于等于零`);
          }
          return true;
        },
      },

      {
        name: 'sumRefundCompletedAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.prePayment.sumRefundCompletedAmount')
          .d('累计退款完成金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'origPrepaymentAmount',
        type: 'number',
        label: intl
          .get('ssta.purchaseSettle.model.prePayment.origPrepaymentAmount')
          .d('原始预付款行金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        label: intl.get(`ssta.purchaseSettle.common.prepaymentApplyAmount`).d('已核销金额'),
        type: 'number',
        name: 'origPrepaymentApplyAmount',
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'syncStatus',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.syncStatus').d('同步状态'),
        lookupCode: 'SSTA.SETTLE_HEADER_SYNC_STATUS',
      },
    ],
    queryParameter: {
      settleHeaderId,
      customizeUnitCode: lineUnitCodes.join(),
    },
    transport: {
      read: () => {
        return {
          url: `${apiPrefix}/pre-payment-lines/${settleHeaderId}`,
          method: 'GET',
        };
      },
      destroy: () => {
        return {
          url: `${apiPrefix}/pre-payment-lines/batch/cancel`,
          method: 'PUT',
        };
      },
    },
    feedback: {
      submitSuccess: () => {},
    },
  };
};

/**
 * Generates a cuszLineDS object with the given settleHeaderId.
 *
 * @param {string | number} settleHeaderId - The ID of the settle header.
 * @return {import('choerodon-ui/dataset/data-set/DataSet').DataSetProps} - The cuszLineDS object.
 */
export const cuszLineDS = (settleHeaderId) => ({
  selection: false,
  autoQuery: false,
  forceValidate: true,
  fields: [],
  autoQueryAfterSubmit: false,
  queryParameter: {
    documentId: settleHeaderId,
    documentType: 'PREPAYMENT',
    customizeUnitCode: Object.values(cuszLineUnitCodeMap).join(),
  },
  transport: {
    read: () => {
      return {
        url: `${apiPrefix}/settle-expand-lines/list`,
        method: 'GET',
      };
    },
  },
});

export const batchModifyDS = (headerDs, lineDs) => {
  const { amountPrecision, settleHeaderId } =
    headerDs.current?.get(['amountPrecision', 'settleHeaderId']) || {};
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        label: intl
          .get(`ssta.purchaseSettle.model.purchaseSettle.prepaymentAmount1`)
          .d('预付款行金额'),
        name: 'prepaymentAmount',
        type: 'number',
        computedProps: {
          formatterOptions: ({ value }) => numberFormatterOptions(value, amountPrecision),
        },
      },
    ],
    transport: {
      submit: ({ data, params }) => {
        const { selected, unSelected } = lineDs;
        let checkedPrePaymentLineList = [];
        let newPrePaymentLineList = [];
        let customizeUnitCode = 'SSTA.PURCHASE_SETTLE_DETAIL.PRE__BATCH_MODIFY_LINE';
        let searchBarData = {};
        if (selected.length === 0) {
          // 如果没有勾选，需要过滤出没有行id（点新增未保存）的数据 checkedPrePaymentLineList，newPrePaymentLineList
          newPrePaymentLineList = lineDs
            .filter((v) => !v?.get('prepaymentLineId'))
            .map((item) => ({ ...item.toData(), settleHeaderId }));
          customizeUnitCode = `${customizeUnitCode},SSTA.PURCHASE_SETTLE_DETAIL.PRE_TRANSACTIONDETAIL,SSTA.PURCHASE_SETTLE_DETAIL.PRE_TRANSACTION_DETAIL_SEARCH`;
          searchBarData = lineDs.queryDataSet?.current?.toData() || {};
          delete searchBarData.__dirty;
        } else {
          // 如果选中了，需要把选中数据放到checkedPrePaymentLineList，未选中数据中新增的放到newPrePaymentLineList
          // 重新赋值加上settleHeaderId，避免选中的数据中有新增的
          checkedPrePaymentLineList = selected.map((item) => ({
            ...item.toData(),
            settleHeaderId,
          }));
          newPrePaymentLineList = unSelected
            .filter((v) => !v?.get('prepaymentLineId'))
            .map((item) => ({ ...item.toData(), settleHeaderId }));
        }
        return {
          url: `${apiPrefix}/pre-payment-lines/batch/edit`,
          method: 'PUT',
          data: { ...data[0], settleHeaderId, newPrePaymentLineList, checkedPrePaymentLineList },
          params: {
            ...params,
            ...searchBarData,
            customizeUnitCode,
          },
        };
      },
    },
  };
};

export const refundLineDS = () => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'settleNum',
      type: 'string',
      label: intl
        .get('ssta.purchaseSettle.model.prePayment.refundSettleNum')
        .d('退款预付款申请单号'),
    },
    {
      name: 'lineNum',
      type: 'number',
      label: intl
        .get('ssta.purchaseSettle.model.prePayment.refundSettleLineNum')
        .d('退款预付款申请行号'),
    },
    {
      name: 'settleStatus',
      type: 'string',
      lookupCode: 'SSTA.SETTLE_STATUS',
      label: intl
        .get('ssta.purchaseSettle.model.prePayment.refundSettleStatus')
        .d('退款付款申请状态'),
    },
    {
      name: 'refundAmount',
      type: 'number',
      label: intl.get('ssta.purchaseSettle.model.prePayment.refundAmount').d('退款金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const prepaymentLineId = dataSet.getQueryParameter('prepaymentLineId');
      return {
        url: `${apiPrefix}/pre-payment-lines/refund/records/${prepaymentLineId}`,
        method: 'GET',
      };
    },
  },
});

export const PaymentStageDS = (settleHeaderId) => ({
  autoQuery: false,
  selection: 'multiple',
  queryParameter: {
    settleHeaderId,
  },
  primaryKey: 'stageLineId',
  cacheSelection: true,
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('ssta.purchaseSettle.model.prePayment.lineNum').d('行号'),
    },
    {
      name: 'stageDocumentAndLineNum',
      type: 'string',
      label: intl
        .get('ssta.purchaseSettle.model.prePayment.docTermNumAndLine')
        .d('条款来源单据编号-行号'),
    },
    {
      name: 'stageNum',
      type: 'string',
      label: intl.get('ssta.purchaseSettle.model.prePayment.stageNum').d('阶段编码'),
    },
    {
      name: 'stageDesc',
      type: 'string',
      label: intl.get('ssta.purchaseSettle.model.prePayment.stageDesc').d('阶段描述'),
    },
    {
      name: 'stageAmount',
      type: 'number',
      label: intl.get('ssta.purchaseSettle.model.prePayment.stageAmount').d('阶段金额'),
    },
    {
      name: 'paymentAmount',
      type: 'number',
      label: intl
        .get('ssta.purchaseSettle.model.prePayment.docPaymentAmount')
        .d('本次实际付款金额'),
    },
    {
      name: 'remainPaymentAmount',
      type: 'number',
      label: intl
        .get('ssta.purchaseSettle.model.prePayment.refundCompletedStagePayAmount')
        .d('退款完成后阶段付款金额'),
    },
    {
      name: 'sumRefundCompletedPaymentAmount',
      type: 'number',
      label: intl
        .get('ssta.purchaseSettle.model.prePayment.sumRefundCompletedAmount')
        .d('累计退款完成金额'),
    },
    {
      name: 'orgPaymentAmount',
      type: 'number',
      label: intl
        .get('ssta.purchaseSettle.model.prePayment.originalPaymentAmount')
        .d('原始付款金额'),
    },
    {
      name: 'prepPaymentAmount',
      type: 'number',
      label: intl
        .get('ssta.purchaseSettle.model.prePayment.prepCompletePayAmount')
        .d('编制确认付款金额'),
    },
    {
      name: 'paymentOccupyAmount',
      type: 'number',
      label: intl.get('ssta.purchaseSettle.model.prePayment.docPaidAmount').d('已付款金额'),
    },
    {
      name: 'enablePaymentAmount',
      type: 'number',
      label: intl.get('ssta.purchaseSettle.model.prePayment.docAbleAmount').d('可付款金额'),
    },
    {
      name: 'prepLatestPaymentDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl
        .get('ssta.purchaseSettle.model.prePayment.prepPaymentDate')
        .d('编制确认付款日期（最早）'),
    },
    {
      name: 'prepLastPaymentDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl
        .get('ssta.purchaseSettle.model.prePayment.prepPaymentDateLast')
        .d('编制确认付款日期（最晚）'),
    },

    {
      name: 'prepDocumentAndLineNum',
      type: 'string',
      label: intl
        .get('ssta.purchaseSettle.model.prePayment.prepDocumentAndLineNum')
        .d('编制来源单据单号-行号'),
    },
    {
      name: 'prepRelationNum',
      type: 'string',
      label: intl
        .get('ssta.purchaseSettle.model.prePayment.settleNumAndStageLine')
        .d('结算单行&阶段明细行关联标识'),
    },
    {
      name: 'prepPaymentDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl
        .get('ssta.purchaseSettle.model.prePayment.prepPaymentConfirmDate')
        .d('编制确认付款日期'),
    },
    {
      name: 'syncStatus',
      type: 'string',
      label: intl.get('ssta.purchaseSettle.model.prePayment.syncStatus').d('同步状态'),
      lookupCode: 'SSTA.SETTLE_HEADER_SYNC_STATUS',
    },
    {
      name: 'shareFlag',
      type: 'string',
      label: intl.get('ssta.purchaseSettle.model.prePayment.shareFlag').d('本次付款/核销'),
      lookupCode: 'HPFM.FLAG',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { paymentStageTypeCustom } = data;
      const customizeUnitCode =
        paymentStageTypeCustom === 'PAYMENT_STAGE'
          ? Object.values(paymentStageCode).join()
          : Object.values(paymentStageLineCode).join();
      const url =
        paymentStageTypeCustom === 'PAYMENT_STAGE'
          ? `${apiPrefix}/payment-stage-headers/list?customizeUnitCode=${customizeUnitCode}`
          : `${apiPrefix}/payment-stage-lines/list?customizeUnitCode=${customizeUnitCode}`;
      return {
        url,
        method: 'GET',
      };
    },
    submit: ({ dataSet, data }) => {
      const submitType = dataSet?.getState('submitType');
      switch (submitType) {
        case 'resync':
          return {
            url: `${apiPrefix}/settle-export-records/PREPAYMENT_STAGE/re-execute`,
            method: 'PUT',
            data: data.map((item) => item?.stageLineId),
          };
        default:
      }
    },
  },
});

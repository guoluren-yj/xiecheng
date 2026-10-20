import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import type { ActiveKey } from '../../utils/type';
import { amountFormatterOptions } from '../../../../utils/utils';
import { ActionType, DetailGridCustCode, DetailSearchCustCode, WholeGridCustCode, WholeSearchCustCode } from '../../utils/type';

const organizationId = getCurrentOrganizationId();

export const wholeTableDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    primaryKey: 'planHeaderId',
    fields: [
      {
        name: 'planStatus',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.status').d('状态'),
        lookupCode: 'SPRP.PLAN_STATUS',
      },
      {
        name: 'operation',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.operation').d('操作'),
      },
      {
        name: 'planNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentPlanNum').d('付款计划编号'),
      },
      {
        name: 'planDesc',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentPlanDesc').d('付款计划说明'),
      },
      {
        name: 'sourceCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentSource').d('付款来源类型'),
        lookupCode: 'SPRP.PLAN_SOURCE_CODE',
      },
      {
        name: 'sourceDisplayNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentSourceDocNum').d('付款来源单据编号'),
      },
      {
        name: 'paymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payPlanTotalAmount').d('付款计划总额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'executedAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.executedAmount').d('已执行金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'planLineNums',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.executionStageCode').d('执行阶段编码'),
      },
      {
        name: 'versionNumber',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.version').d('版本'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.companyName').d('公司名称'),
      },
      {
        name: 'displaySupplierName',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.supplierName').d('供应商名称'),
      },
    ],
    queryParameter: {
      actionType: ActionType[activeKey],
      customizeUnitCode: [WholeGridCustCode[activeKey], WholeSearchCustCode[activeKey]].join(),
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SSTA}/v1/${organizationId}/plan-headers/page`,
          method: 'GET',
        };
      },
    },
  };
};

export const detailTableDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    primaryKey: 'planLineId',
    fields: [
      {
        name: 'planStatus',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentPlanStatus').d('付款计划状态'),
        lookupCode: 'SPRP.PLAN_STATUS',
      },
      {
        name: 'planNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentPlanNum').d('付款计划编号'),
      },
      {
        name: 'planDesc',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentPlanDesc').d('付款计划说明'),
      },
      {
        name: 'sourceCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentSource').d('付款来源类型'),
        lookupCode: 'SPRP.PLAN_SOURCE_CODE',
      },
      {
        name: 'sourceDisplayNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentSourceDocNum').d('付款来源单据编号'),
      },
      {
        name: 'paymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payPlanTotalAmount').d('付款计划总额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'executedAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.executedAmount').d('已执行金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'versionNumber',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.version').d('版本'),
      },
      {
        name: 'lineNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.orderNum').d('序号'),
      },
      {
        name: 'lineStatus',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentStageStatus').d('付款阶段状态'),
        lookupCode: 'SPRP.PLAN_STATUS',
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payStageNum').d('付款阶段编号'),
      },
      {
        name: 'stageDesc',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payStageDesc').d('付款阶段描述'),
      },
      {
        name: 'stagePercent',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.stagePercent').d('阶段比例（%）'),
      },
      {
        name: 'stageAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.planStageAmount').d('计划阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'executedStageAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.execStageAmount').d('已执行阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'stageBalance',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.stageBalanceAmount').d('剩余阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'baseDate',
        type: FieldType.date,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.planPayBaseDate').d('计划付款基准日期'),
      },
      {
        name: 'deadLineDate',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.benchReferDateDeadline').d('基准参考日期截止日'),
      },
      {
        name: 'operation',
        label: intl.get('ssta.paymentPlan.model.paymentPlan.operation').d('操作'),
      },
      {
        name: 'termNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payTermNum').d('付款条款编码'),
      },
      {
        name: 'termName',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payTermDesc').d('付款条款描述'),
      },
      {
        name: 'termVersionNumber',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payTermVersion').d('付款条款版本'),
      },
      {
        name: 'planPrepayFlag',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.existsPrepayFlag').d('存在预付'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'planStageFlag',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.stageFlag').d('分期'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'baseAmountFieldCode',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.benchReferAmount').d('基准参考金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'grandFlag',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.sumPercentFlag').d('累计比例'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'amountMaintainCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.amountCalcRule').d('金额计算规则'),
        lookupCode: 'SPRP.AMOUNT_MAINTIAN_CODE',
      },
      {
        name: 'prepayFlag',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.prepayFlag').d('预付'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'dateMaintainCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.dateCalcRule').d('日期计算规则'),
        lookupCode: 'SPRP.DATE_MAINTAIN_CODE',
      },
      {
        name: 'baseDateFieldCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.benchReferDate').d('基准参考日期'),
        lookupCode: 'SPRP.BASE_DATE_FIELD',
      },
      {
        name: 'sourceNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.sourceDocNo').d('来源单据编号'),
      },
      {
        name: 'accountPeriodType',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payPeriodDaysType').d('付款账期天数类型'),
        lookupCode: 'SPRP.ACCOUNT_PERIOD_TYPE',
      },
      {
        name: 'fixedDate',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.fixedDate').d('固定日'),
      },
      {
        name: 'addMonth',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.additionalMonths').d('附加月数'),
      },
      {
        name: 'accountPeriod',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentPeriodDays').d('付款账期天数'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.companyName').d('公司名称'),
      },
      {
        name: 'displaySupplierName',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.supplierName').d('供应商名称'),
      },
    ],
    queryParameter: {
      actionType: ActionType[activeKey],
      customizeUnitCode: [DetailGridCustCode[activeKey], DetailSearchCustCode[activeKey]].join(),
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SSTA}/v1/${organizationId}/plan-lines/line-page`,
          method: 'GET',
        };
      },
    },
  };
};
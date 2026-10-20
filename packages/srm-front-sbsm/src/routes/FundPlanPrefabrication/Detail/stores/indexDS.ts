import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse, filterNullValueObject } from 'utils/utils';
// import { DEFAULT_DATE_FORMAT } from 'utils/constants';
// import moment from 'moment';

import { StageAllDetailBasicCode, StageAllDetailLineCode, StageAllDetailPreLineCode, StageAllPrepRuleCode, StageAllPrefabInfoCode, StageAllPrepInfoCode,
  PrepLineCode, PrepLineDetailCode, summaryInfoCode, summaryLineCode, summaryLineDetailCode, prePaymentInfoCode, prePaymentLineCode, prePaymentLineDetailCode, paymentInfoCode, paymentLineCode, paymentLineDetailCode,
 } from '../../utils/type';
import { amountFormatterPrecision } from '../../../../utils/utils';

const organizationId = getCurrentOrganizationId();
export const headerDS = (poolStageId, stageNum, viewType, poolHeaderId): DataSetProps => {
  return {
    autoQuery: true,
    selection: false,
    fields: [
      // 预制信息
      {
        name: 'prefabPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prePayAmount').d('预制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prefabApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.preWriteOffAmount').d('预制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prefabStatus',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stagePreStatus').d('阶段预制状态'),
      },
      {
        name: 'prefabPaymentDate',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prePayAmountDateFirst').d('预制付款日期(最早)'),
      },
      {
        name: 'prefabPaymentDateLast',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prePayAmountDateLast').d('预制付款日期(最晚)'),
      },
      // 编制信息
      {
        name: 'prepOccupyPayAmount',
        type: FieldType.number,
        label: viewType ==='STAGE' ? intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepOccupyPayAmount').d('阶段编制占用付款金额') :
               intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepOccupyPayAmountSource').d('编制占用付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepCompletePayAmount',
        type: FieldType.number,
        label: viewType ==='STAGE' ? intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepCompletePayAmount').d('阶段编制完成付款金额') :
              intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepCompletePayAmountSource').d('编制完成付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepEnablePayAmount',
        type: FieldType.number,
        label: viewType ==='STAGE' ? intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepEnablePayAmount').d('阶段可编制付款金额') :
              intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepEnablePayAmountSource').d('可编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepOccupyApplyAmount',
        type: FieldType.number,
        label: viewType ==='STAGE' ? intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepOccupyApplyAmount').d('阶段编制占用核销金额') :
              intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepOccupyApplyAmountSource').d('编制占用核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepCompleteApplyAmount',
        type: FieldType.number,
        label: viewType ==='STAGE' ? intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepCompleteApplyAmount').d('阶段编制完成核销金额') :
          intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepCompleteApplyAmountSource').d('编制完成核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepEnableApplyAmount',
        type: FieldType.number,
        label: viewType ==='STAGE' ? intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepEnableApplyAmount').d('阶段可编制核销金额') :
              intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepEnableApplyAmountSource').d('可编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepStatus',
        type: FieldType.string,
        lookupCode: 'SBSM.PREP_STATUS',
        label: viewType ==='STAGE' ? intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepareStatusStage').d('阶段编制状态') :
              intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepareStatusStageSource').d('编制状态'),
      },
      {
        name: 'prepPaymentDate',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.payAmountDateFirst').d('编制付款日期(最早)'),
      },
      {
        name: 'prepPaymentDateLast',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.payAmountDateLast').d('编制付款日期(最晚)'),
      },
      // 编制规则
      {
        name: 'prepSource',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedSource').d('编制来源'),
        lookupCode: 'SBSM.PREP_SOURCE',
      },
      {
        name: 'prefabRule',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedRule').d('预制规则'),
        lookupCode: 'SBSM.PREFAB_RULE',
      },
      {
        name: 'prepProcess',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedProcess').d('编制流程'),
        lookupCode: 'SBSM.PREP_PROCESS',
      },
      // 汇总信息
      {
        name: 'balOccupyPayAmount',
        type: FieldType.number,
        label: viewType ==='STAGE' ? intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balOccupyPayAmount').d('阶段汇总占用付款金额') :
              intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balOccupyPayAmountSource').d('汇总占用付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balCompletePayAmount',
        type: FieldType.number,
        label: viewType ==='STAGE' ? intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balCompletePayAmount').d('阶段汇总完成付款金额') :
              intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balCompletePayAmountSource').d('汇总完成付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balEnablePayAmount',
        type: FieldType.number,
        label: viewType ==='STAGE' ? intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balEnablePayAmount').d('阶段可汇总付款金额') :
              intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balEnablePayAmountSource').d('可汇总付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balOccupyApplyAmount',
        type: FieldType.string,
        label: viewType ==='STAGE' ? intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balOccupyApplyAmount').d('阶段汇总占用核销金额') :
              intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balOccupyApplyAmountSource').d('汇总占用核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balCompleteApplyAmount',
        type: FieldType.number,
        label: viewType ==='STAGE' ? intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balCompleteApplyAmount').d('阶段汇总完成核销金额') :
              intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balCompleteApplyAmountSource').d('汇总完成核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balEnableApplyAmount',
        type: FieldType.number,
        label: viewType ==='STAGE' ? intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balEnableApplyAmount').d('阶段可汇总核销金额') :
              intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balEnableApplyAmountSource').d('可汇总核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balStatus',
        type: FieldType.string,
        label: viewType ==='STAGE' ? intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balStatus').d('阶段汇总状态') :
              intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balStatusSource').d('汇总状态'),
        lookupCode: 'SBSM.ROUTINE_BAL_STATUS',
      },
      {
        name: 'balPaymentDate',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balPaymentDate').d('汇总付款日期(最早)'),
      },
      {
        name: 'balPaymentDateLast',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.balPaymentDateLast').d('汇总付款日期(最晚)'),
      },
      // 付款 预付款
      {
        name: 'actualPrePaymentOccupyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepaymentOccupyPayAmount').d('预付款申请占用付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'actualPrePaymentCompleteAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepaymentCompletePayAmount').d('预付款申请完成付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'actualPaymentOccupyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.paymentOccupyPayAmount').d('付款申请占用付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'actualPaymentCompleteAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.paymentCompletePayAmount').d('付款申请完成付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'actualApplyOccupyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.paymentOccupyApplyAmount').d('付款申请占用核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'actualApplyCompleteAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.paymentCompleteApplyAmount').d('付款申请完成核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      // 来源单据信息
      // {
      //   name: 'prepSource',
      //   type: FieldType.string,
      //   label: intl.get('sbsm.fundPlan.model.fundPlan.prepSourceDocType').d('编制来源单据类型'),
      //   lookupCode: 'SBSM.PREP_SOURCE',
      // },
      {
        name: 'documentNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepSourceDocNum').d('编制来源单据编号'),
      },
      {
        name: 'prepSourceAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepSourceDocAmount').d('编制来源单据金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const url = viewType === 'STAGE' ? `/sbdm/v1/${organizationId}/prep-pool-stages/detail/${poolStageId}` : `/sbdm/v1/${organizationId}/prep-pool-headers/detail/${poolHeaderId}`;
        return {
          url: `${url}?customizeUnitCode=${[StageAllDetailBasicCode, StageAllDetailLineCode, StageAllDetailPreLineCode, StageAllPrepRuleCode, StageAllPrefabInfoCode, StageAllPrepInfoCode, summaryInfoCode, prePaymentInfoCode, paymentInfoCode].join()}`,
          method: 'POST',
          params: {
            ...data,
            ...params,
          },
          data: {},
          transformResponse: (response) => {
            let res: any = {};
            try {
              res = JSON.parse(response);
            } catch(e) {
              throw e;
            }
            if (!getResponse(res)) return;
            if (viewType !== 'STAGE') return res;
            const { stageEffectiveDate, documentTermHeader, currencyCode, prepRule } = res || {};
            const { docTermLineList = [] } = documentTermHeader || {};
            return {
              ...prepRule,
              ...res,
              documentTermList: documentTermHeader ? [{...documentTermHeader, stageEffectiveDate, currencyCode }] : [],
              currentStageList: docTermLineList?.filter((v) => v?.stageNum === stageNum),
            };
          },
        };
      },
    },
  };
};


export const termDetailDS = (): DataSetProps => {
  return {
    autoQuery: false,
    selection: false,
    primaryKey: 'docTermHeaderId',
    fields: [
      {
        name: 'docTermStatus',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.status').d('状态'),
        lookupCode: 'SBSM.DOC_TERM_STATUS',
      },
      {
        name: 'docTermNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.sourceDocCode').d('来源单据条款编号'),
      },
      {
        name: 'termVersionNumber',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.vision').d('版本'),
      },
      {
        name: 'controlDimension',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.termSource').d('条款来源'),
        lookupCode: 'SBSM.CONTROL_DIMENSION',
      },
      {
        name: 'sourceDocNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.docNumCode').d('来源单据编号'),
      },
      {
        name: 'sourceDocLineNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.docNumCodeAndLineNo').d('来源单据编号-行号'),
      },
      {
        name: 'amountComputeRule',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stageAmountRule').d('阶段金额计算规则'),
        lookupCode: 'SBSM.AMOUNT_COMPUTE_MODE',
      },
      {
        name: 'termNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.payTermCode').d('付款条款编码'),
      },
      {
        name: 'termName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.payTermDesc').d('付款条款描述'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.currencyCode').d('币种'),
      },
      {
        name: 'sourceDocAmount',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.docNumAmount').d('来源单据金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      // {
      //   name: 'dtLineAmount',
      //   type: FieldType.string,
      //   label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.docNumAmount').d('来源单据金额'),
      // },
      {
        name: 'docTermAmount',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.docTermAmount').d('单据条款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'diffAmount',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.diffAmount').d('差异金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'stageEffectiveDate',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.docEffectDate').d('单据条款生效日期'),
      },
    ],
  };
};

export const termTableDS = (): DataSetProps => {
  return {
    autoQuery: false,
    selection: false,
    primaryKey: 'docTermLineId',
    paging: false,
    fields: [
      {
        name: 'lineNum',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.orderNumber').d('序号'),
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentStageCode').d('付款阶段编号'),
      },
      {
        name: 'stageDesc',
        type: FieldType.intl,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentStageDesc').d('付款阶段描述'),
      },
      {
        name: 'stageType',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentStageType').d('阶段类型'),
        lookupCode: 'SBSM.STAGE_TYPE',
      },
      {
        name: 'stagePercent',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.stageProportion').d('阶段比例（%）'),
      },
      {
        name: 'stageAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stageAmount').d('阶段金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'fcDateRule',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.predictPayRulePlan').d('预测付款日期规则'),
        lookupCode: 'SBSM.FC_DATE_RULE',
      },
      {
        name: 'fcBaseDateType',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.predictBaseDateFieldCode').d('预测付款基准日期'),
        lookupCode: 'SBSM.FC_BASE_DATE_TYPE',
      },
      {
        name: 'fcDeadLine',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.predictDeadLineDate').d('预测付款基准日期截止日'),
      },
      {
        name: 'fcFixedDay',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.predictPayFixedDay').d('预测付款固定日'),
      },
      {
        name: 'fcAddMonth',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.predictAddExtraMonth').d('预测付款附加月数'),
      },
      {
        name: 'fcAccountPeriod',
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.predictAddDays').d('预测付款账期天数'),
        type: FieldType.number,
      },
      {
        name: 'exDateRule',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectPayRulePlan').d('期望付款日期规则'),
        lookupCode: 'SBSM.EX_DATE_RULE',
      },
      {
        name: 'exBaseDateType',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectBaseDateFieldCode').d('期望付款基准日期'),
        lookupCode: 'SBSM.EX_BASE_DATE_TYPE',
      },
      {
        name: 'exDeadLine',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectDeadLineDate').d('期望付款基准日期截止日'),
      },
      {
        name: 'exFixedDay',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectPayFixedDays').d('期望付款固定日'),
      },
      {
        name: 'exAddMonth',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectAddExtraMonth').d('期望付款附加月数'),
      },
      {
        name: 'exAccountPeriod',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectAddExtraDays').d('期望付款账期天数'),
      },
    ],
  };
};

export const preTableDS = (queryParameter): DataSetProps => {
  return {
    autoQuery: true,
    pageSize: 20,
    selection: false,
    primaryKey: 'stageId',
    fields: [
      {
        name: 'prepSourceMeaning',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.affairOriginType').d('事务来源类型'),
      },
      {
        name: 'documentNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.preparedSourceNumAndLine').d('编制来源单据编号-行号'),
      },
      {
        name: 'documentNumAndLineNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.docTermNumAndLineNum').d('条款来源单据编号-行号'),
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.docTermStageNum').d('阶段编号'),
      },
      {
        name: 'stageDesc',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.docTermStageDesc').d('阶段描述'),
      },
      {
        name: 'stageAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stageAmount').d('阶段金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepSourceAmount',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepLineAmount').d('编制来源单据行金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prefabPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prePayAmount').d('预制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prefabApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.preWriteOffAmount').d('预制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prefabPaymentDate',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.fcPaymentDate').d('预制付款日期'),
      },
      {
        label: intl.get(`sbsm.common.model.common.processUser`).d('操作人'),
        type: FieldType.string,
        name: 'createdUserName',
      },
      {
        label: intl.get(`sbsm.common.model.common.processTime`).d('操作时间'),
        type: FieldType.string,
        name: 'creationDate',
      },
    ],
    queryParameter,
    transport: {
      read: (): any => {
        return {
          url: `/sbdm/v1/${organizationId}/prefab-relations/link-prefab-relation?customizeUnitCode=${StageAllDetailPreLineCode}`,
          method: 'get',
        };
      },
    },
  };
};

export const viewTermTypDS = (): DataSetProps => {
  return {
    autoQuery: false,
    autoCreate: true,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'viewType',
        type: FieldType.boolean,
        label: intl.get('sbsm.common.model.payTermsCtrl.viewType').d('仅查看当前阶段'),
        defaultValue: true,
      },
    ],
  };
};

// 编制信息 行
export const prepListDS = (queryParameter): DataSetProps => {
  return {
    autoQuery: true,
    pageSize: 20,
    selection: false,
    primaryKey: 'prepHeaderId',
    fields: [
      {
        name: 'prepProcessStatusMeaning',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedStatus').d('编制状态'),
      },
      {
        name: 'prepNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepNum').d('编制提报单编号'),
      },
      {
        name: 'prepViewType',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.controlDimension').d('编制视图'),
        lookupCode: 'SBSM.PREP_VIEW_TYPE',
      },
      {
        name: 'sumPrepPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepPayAmount').d('编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'sumPrepApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepApplyAmount').d('编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        label: intl.get(`sbsm.common.model.common.processUser`).d('操作人'),
        type: FieldType.string,
        name: 'createdUserName',
      },
      {
        label: intl.get(`sbsm.common.model.common.processTime`).d('操作时间'),
        type: FieldType.string,
        name: 'creationDate',
      },
      {
        name: 'operate',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.operate').d('操作'),
      },
    ],
    queryParameter,
    transport: {
      read: (): any => {
        return {
          url: `/sbdm/v1/${organizationId}/prep-relations/link-prep-header?customizeUnitCode=${PrepLineCode}`,
          method: 'get',
        };
      },
    },
  };
};
export const prepListDetailDS = (queryParameter): DataSetProps => {
  return {
    autoQuery: true,
    pageSize: 20,
    primaryKey: 'prepLineId',
    selection: false,
    fields: [
      {
        name: 'prepNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepNumAndLineNum').d('编制单编号-行号'),
      },
      {
        name: 'prepSource',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedSource').d('编制来源'),
        lookupCode: 'SBSM.PREP_SOURCE',
      },
      {
        name: 'documentNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepSourceDocNumAndLineNum').d('编制来源单据编号-行号'),
      },
      {
        name: 'termSourceDocumentNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.docTermNumAndLineNum').d('条款来源单据编号-行号'),
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.docTermStageNum').d('阶段编号'),
      },
      {
        name: 'stageDesc',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.docTermStageDesc').d('阶段描述'),
      },
      {
        name: 'prepPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepPayAmount').d('编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepApplyAmount').d('编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepPaymentDate',
        type: FieldType.date,
        format: 'YYYY-MM-DD',
        label: intl.get('sbsm.common.model.fundPlan.exPaymentDate').d('编制付款日期'),
      },
    ],
    transport: {
      read: ({ data, params }): any => {
        return {
          url: `/sbdm/v1/${organizationId}/prep-relations/list?customizeUnitCode=${PrepLineDetailCode}`,
          method: 'POST',
          params: {
            ...data,
            ...params,
          },
          data: {
            ...queryParameter,
          },
        };
      },
    },
  };
};

export const summaryListDS = (queryParameter): DataSetProps => {
  return {
    autoQuery: true,
    pageSize: 20,
    selection: false,
    primaryKey: 'balHeaderId',
    fields: [
      {
        name: 'balProcessStatusMeaning',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.summaryStatus').d('汇总状态'),
      },
      {
        name: 'balNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.summaryNum').d('汇总单编号'),
      },
      {
        name: 'prepViewType',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.controlDimension').d('编制视图'),
        lookupCode: 'SBSM.PREP_VIEW_TYPE',
      },
      {
        name: 'sumBalPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.sumPaymentAmount').d('汇总付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'sumBalApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.sumApplyAmount').d('汇总核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        label: intl.get(`sbsm.common.model.common.processUser`).d('操作人'),
        type: FieldType.string,
        name: 'createdUserName',
      },
      {
        label: intl.get(`sbsm.common.model.common.processTime`).d('操作时间'),
        type: FieldType.string,
        name: 'creationDate',
      },
      {
        name: 'operate',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.operate').d('操作'),
      },
    ],
    queryParameter,
    transport: {
      read: (): any => {
        return {
          url: `/sbdm/v1/${organizationId}/balance-relations/link-bal-header?customizeUnitCode=${summaryLineCode}`,
          method: 'get',
        };
      },
    },
  };
};

export const summaryListDetailDS = (queryParameter): DataSetProps => {
  return {
    pageSize: 20,
    autoQuery: true,
    primaryKey: 'balLineId',
    selection: false,
    fields: [
      {
        name: 'balNum',
        label: intl.get('sbsm.fundPlan.model.summary.balNumAndLineNum').d('汇总单编号-行号'),
      },
      {
        name: 'prepSource',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedSource').d('编制来源'),
        lookupCode: 'SBSM.PREP_SOURCE',
      },
      {
        name: 'documentNumAndLineNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepSourceDocNumAndLineNum').d('编制来源单据编号-行号'),
      },
      {
        name: 'termSourceNumAndLine',
        label: intl.get('sbsm.fundPlan.model.summary.termSourceDocNumAndLineNum').d('条款来源单据编号-行号'),
      },
      {
        name: 'stageNum',
        label: intl.get('sbsm.fundPlan.model.summary.stageNum').d('阶段编号'),
      },
      {
        name: 'stageDesc',
        label: intl.get('sbsm.fundPlan.model.summary.stageDesc').d('阶段描述'),
      },
      {
        name: 'balPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.sumPaymentAmount').d('汇总付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.sumApplyAmount').d('汇总核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balPaymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.summary.sumPaymentDate').d('汇总付款日期'),
      },
    ],
    transport: {
      read: (): any => {
        return {
          url: `/sbdm/v1/${organizationId}/balance-relations/list?customizeUnitCode=${summaryLineDetailCode}`,
          method: 'POST',
          data: {
            ...queryParameter,
          },
        };
      },
    },
  };
};

export const settleListDS = (queryParameter): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    selection: false,
    fields: [
      {
        name: 'settleStatus',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.settleStatus').d('结算单状态'),
        lookupCode: 'SSTA.SETTLE_STATUS',
      },
      {
        name: 'settleNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.settleNum').d('结算单编号'),
        // intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.settlePayNum').d('付款申请结算单编号')
      },
      {
        name: 'prepaymentType',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepaymentType').d('预付款类型'),
        lookupCode: 'SSTA.PREPAYMENT_TYPE',
      },
      {
        name: 'prepaymentAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prePaymentAmount').d('预付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.settleCompany').d('结算公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.settleSupplier').d('结算供应商'),
      },
      {
        name: 'camp',
        lookupCode: 'SSTA.CAMP',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.campCreate').d('创建方阵营'),
      },
      {
        name: 'creationDate',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.createDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.creator').d('创建人'),
      },
      {
        name: 'operate',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.operate').d('操作'),
      },
      {
        name: 'paymentAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.paymentAmount').d('付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'applyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.applyAmount').d('核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
    ],
    queryParameter,
    transport: {
      read: (): any => {
        return {
          url: `/ssta/v1/${organizationId}/settle-headers/link-payment-fund?customizeUnitCode=${prePaymentLineCode},${paymentLineCode}`,
          method: 'get',
        };
      },
    },
  };
};

export const settleListDetailDS = (settleHeaderId, stageNum): DataSetProps => {
  return {
    autoQuery: true,
    pageSize: 20,
    selection: false,
    fields: [
      {
        name: 'settleHeaderNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.settleNumAndLineNum').d('结算单编号-阶段明细行号'),
      },
      {
        name: 'prepSource',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedSource').d('编制来源'),
        lookupCode: 'SBSM.PREP_SOURCE',
      },
      {
        name: 'documentNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepSourceDocNumAndLineNum').d('编制来源单据编号-行号'),
      },
      {
        name: 'stageDocumentAndLineNum',
        label: intl.get('sbsm.fundPlan.model.summary.termSourceDocNumAndLineNum').d('条款来源单据编号-行号'),
      },
      {
        name: 'stageNum',
        label: intl.get('sbsm.fundPlan.model.summary.stageNum').d('阶段编号'),
      },
      {
        name: 'stageDesc',
        label: intl.get('sbsm.fundPlan.model.summary.stageDesc').d('阶段描述'),
      },
      {
        name: 'paymentAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.actualPaymentAmountThisTime').d('本次实际付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'applyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.actualApplyAmountThisTime').d('本次实际核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'creationDate',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.createDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.creator').d('创建人'),
      },
    ],
    queryParameter: filterNullValueObject({
      settleHeaderId,
      stageNum,
    }),
    transport: {
      read: (): any => {
        return {
          url: `/ssta/v1/${organizationId}/payment-stage-headers/list?customizeUnitCode=${prePaymentLineDetailCode},${paymentLineDetailCode}`,
          method: 'get',
        };
      },
    },
  };
};

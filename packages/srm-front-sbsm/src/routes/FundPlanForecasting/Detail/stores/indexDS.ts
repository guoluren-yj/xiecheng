import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import { DetailBasicCode, DetailLineCode } from '../../utils/type';
import { amountFormatterPrecision } from '../../../../utils/utils';

const organizationId = getCurrentOrganizationId();

export const stageTermDetailDS = (fcHeaderId, stageNum): DataSetProps => {
  return {
    autoQuery: true,
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
      // {
      //   name: 'dtAmount',
      //   type: FieldType.string,
      //   label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.docNumAmount').d('来源单据金额'),
      // },
      {
        name: 'sourceAmount',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.docNumAmount').d('来源单据金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
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
        name: 'poConfirmedDate',
        type: FieldType.dateTime,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.docEffectDate').d('单据条款生效日期'),
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `/sbdm/v1/${organizationId}/forecast-headers/detail?customizeUnitCode=${[DetailBasicCode, DetailLineCode].join()}`,
          method: 'POST',
          params: {
            fcHeaderId,
            ...params,
          },
          data: { fcHeaderId },
          transformResponse: (response) => {
            let res: any = {};
            try {
              res = JSON.parse(response);
            } catch(e) {
              throw e;
            }
            if (!getResponse(res)) return;
            const { docTermLineList = [] } = res[0] || {};
            return {
              ...res[0],
              currentStageList: docTermLineList?.filter((v) => v?.stageNum === stageNum),
            };
          },
        };
      },
    },
  };
};

export const stageTermTableDS = (): DataSetProps => {
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

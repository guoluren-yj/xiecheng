import { DataSetSelection, FieldType, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import { WholeListCode, WholeSearchCode, DetailListCode, DetailSearchCode, ActiveKey, DetailListLineCode } from '../../utils/type';
import { amountFormatterPrecision } from '../../../../utils/utils';

const organizationId = getCurrentOrganizationId();

export const wholeTableDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    primaryKey: 'prepHeaderId',
    cacheSelection: true,
    selection: DataSetSelection.multiple,
    dataToJSON: DataToJSON.selected,
    fields: [
      {
        name: 'prepReportStatus',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPreparation.status').d('状态'),
        lookupCode: 'SBSM.PREP_REPORT_STATUS',
      },
      {
        name: 'operate',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPreparation.operate').d('操作'),
      },
      {
        name: 'prepNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPreparation.preparDocNum').d('资金计划编制单号'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.companyName').d('公司'),
      },
      {
        name: 'prepPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPreparation.preparePayAmount').d('编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPreparation.prepApplyPayAmount').d('编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepViewType',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPreparation.prepView').d('编制视图'),
        lookupCode: 'SBSM.PREP_VIEW_TYPE',
      },
      {
        name: 'prepReturnStatus',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPreparation.prepReturnStatus').d('汇总退回待编制'),
        lookupCode: 'SBSM.PREP_RETURN_STATUS',
      },
      {
        name: 'createdUserName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPreparation.creator').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get('sbsm.fundPlan.model.fundPlanPreparation.createTime').d('创建时间'),
      },
      {
        name: 'currentApprover',
        type: FieldType.string,
        label: intl.get('hzero.common.button.approve.process').d('审批进度'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const urls = {
          [ActiveKey.WholeAll]: `/sbdm/v1/${organizationId}/prep-headers/list`,
          [ActiveKey.WholeApprove]: `/sbdm/v1/${organizationId}/prep-headers/list-approve-able`,
          [ActiveKey.WholePending]: `/sbdm/v1/${organizationId}/prep-headers/list-submit-able`,
        };
        const url = urls[activeKey];
        if (!url) return {};
        return {
          url: `${url}?customizeUnitCode=${[WholeListCode[activeKey], WholeSearchCode[activeKey]].join()}`,
          method: 'POST',
          params: {
            ...data,
            ...params,
          },
        };
      },
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        switch (submitType) {
          case 'submit':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-headers/async-batch-submit`,
              method: 'POST',
            };
          default:
        }
      },
    },
    feedback: {
      submitSuccess: () => {},
    },
  };
};


export const detailTableDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    selection: DataSetSelection.multiple,
    primaryKey: 'prepLineId',
    fields: [
      {
        name: 'prepReportStatus',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPreparation.status').d('状态'),
        lookupCode: 'SBSM.PREP_REPORT_STATUS',
      },
      {
        name: 'prepNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPreparation.preparDocNumAndLineNum').d('资金计划编制单号-行号'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.companyName').d('公司'),
      },
      {
        name: 'supplierCompanyNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.supplierCompanyNum').d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.supplierCompanyName').d('供应商'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.currencyCode').d('币种'),
      },
      {
        name: 'prepViewType',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPreparation.prepView').d('编制视图'),
        lookupCode: 'SBSM.PREP_VIEW_TYPE',
      },
      {
        name: 'termSourceDocumentNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPreparation.documentNumAndLineNum').d('条款来源单据编号-行号'),
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
        label: intl.get('sbsm.fundPlan.model.fundPlan.stageAmount').d('阶段金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepSource',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepSourceDocType').d('编制来源单据类型'),
        lookupCode: 'SBSM.PREP_SOURCE',
      },
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
      {
        name: 'prepPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prePayAmount').d('本次编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prePayApplyAmount').d('本次编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepPaymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prePayAmountDateFirst').d('编制付款日期（最早）'),
      },
      {
        name: 'prepPaymentDateLast',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prePayAmountDateLast').d('编制期望付款日期（最晚）'),
      },
      {
        name: 'lineRemark',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.remark').d('备注'),
      },
      {
        name: 'operate',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.operate').d('操作'),
      },
      {
        name: 'prefabPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prePayAmount').d('预制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepOccupyPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.preparedPayAmount').d('已编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepEnablePayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.canPreparedPayAmount').d('可编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prefabApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.preWriteOffAmount').d('预制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepOccupyApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.preparedWriteOffAmount').d('已编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepEnableApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.canPreparedWriteOffAmount').d('可编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prefabPaymentDate',
        type: FieldType.date,
        format: DEFAULT_DATE_FORMAT,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prePayAmountDateFirst').d('预制付款日期(最早)'),
      },
      {
        name: 'prefabPaymentDateLast',
        type: FieldType.date,
        format: DEFAULT_DATE_FORMAT,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prePayAmountDateLast').d('预制付款日期(最晚)'),
      },
      {
        name: 'orgPrepPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.orgPrepPayAmount').d('原始编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'orgPrepApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.orgPrepApplyAmount').d('原始编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'rtnPrepPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.rtnPrepPayAmount').d('退回付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'rtnPrepApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.rtnPrepApplyAmount').d('退回核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `/sbdm/v1/${organizationId}/prep-lines/list/all?customizeUnitCode=${[DetailListCode[activeKey], DetailSearchCode[activeKey]].join()}`,
          method: 'POST',
          params: {
            ...data,
            ...params,
          },
        };
      },
    },
  };
};

// 编制来源单据行匹配阶段明细
export const prepLineDS = (param): DataSetProps => {
  return {
    autoQuery: true,
    pageSize: 20,
    primaryKey: 'prepRelationId',
    cacheSelection: true,
    forceValidate: true,
    selection: false,
    fields: [
      {
        name: 'prepSource',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedSource').d('编制来源'),
        lookupCode: 'SBSM.PREP_SOURCE',
      },
      {
        name: 'documentNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.preparedSourceNumAndLine').d('编制来源单据编号-行号'),
      },
      {
        name: 'prepSourceAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepLineAmount').d('编制来源单据行金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prePayAmount').d('本次编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prePayApplyAmount').d('本次编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepPaymentDate',
        type: FieldType.date,
        format: DEFAULT_DATE_FORMAT,
        label: intl.get('sbsm.common.model.fundPlan.exPaymentDate').d('编制付款日期'),
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.remark').d('备注'),
      },
      {
        name: 'operate',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.operate').d('操作'),
      },
      {
        name: 'prefabPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prePayAmount').d('预制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'displayPrepOccupyPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedPayAmount').d('已编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'displayPrepEnablePayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.canPreparedPayAmount').d('可编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prefabApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.preWriteOffAmount').d('预制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'displayPrepOccupyApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedWriteOffAmount').d('已编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'displayPrepEnableApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.canPreparedWriteOffAmount').d('可编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prefabPaymentDate',
        type: FieldType.date,
        format: DEFAULT_DATE_FORMAT,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prePayDate').d('预制付款日期'),
      },
      {
        name: 'termSourceDocumentNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.termSourceNumAndLine').d('条款来源单据编号-行号'),
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stageNum').d('阶段编码'),
      },
      {
        name: 'stageDesc',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stageDesc').d('阶段描述'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `/sbdm/v1/${organizationId}/prep-relations/list?customizeUnitCode=${DetailListLineCode}`,
          method: 'POST',
          params: {
            ...data,
            ...params,
          },
          data: param,
        };
      },
    },
  };
};

import { DataSetSelection, FieldType, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';

import { SourceListCode, SourceSearchCode, StageListCode, StageSearchCode, ActiveKey, SourcePrimaryKey } from '../../utils/type';
import { amountFormatterPrecision } from '../../../../utils/utils';

const organizationId = getCurrentOrganizationId();

export const sourceTableDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    primaryKey: SourcePrimaryKey[activeKey] || 'poolHeaderId',
    cacheSelection: true,
    selection: DataSetSelection.multiple,
    dataToJSON: DataToJSON.selected,
    autoQueryAfterSubmit: false,
    fields: [
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.companyName').d('公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.supplierCompanyName').d('供应商'),
      },
      // 全部
      {
        name: 'prepSource',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedSource').d('编制来源'),
        lookupCode: 'SBSM.PREP_SOURCE',
      },
      {
        name: 'prepFinalPaymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPaymentConfirmDate').d('编制确认付款日期(最早)'),
        help: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPaymentConfirmTips').d('根据「编制流程：仅预制/仅编制提报/编制提报后汇总」，可在编制流程结束后查看阶段中编制的最早付款日期'),
      },
      {
        name: 'prepFinalPaymentDateLast',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPaymentConfirmDateLast').d('编制确认付款日期(最晚)'),
        help: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPaymentConfirmLastTips').d('根据「编制流程：仅预制/仅编制提报/编制提报后汇总」，可在编制流程结束后查看阶段中编制的最晚付款日期'),
      },
      // 所有页签
      {
        name: 'documentNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.preparedSourceNum').d('编制来源单据编号'),
      },
      {
        name: 'documentLineNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.preparedSourceNumAndLine').d('编制来源单据编号-行号'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.currencyCode').d('币种'),
      },
      {
        name: 'prepSourceAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.preparedDocAmount').d('编制来源单据金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
        help: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.prepSourceAmountHelps').d('接入编制池的编制来源单据行编制金额汇总，非编制来源单据原始总金额。例，共计10行的发票申请结算单接入编制池，3行来源订单配置接入，或仅成功接入3行，则仅汇总其中3行的行金额'),
      },
      {
        name: 'prepSourceLineAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.preparedDocLineAmount').d('编制来源单据行金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      // 可编制、全部
      {
        name: 'prefabPaymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prePayAmountDateFirst').d('预制付款日期(最早)'),
      },
      {
        name: 'prefabPaymentDateLast',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prePayAmountDateLast').d('预制付款日期(最晚)'),
      },
      {
        name: 'operate',
        type: FieldType.string,
        label: intl.get('sbsm.common.model.fundPlanPrefabrication.watchDetails').d('执行情况'),
      },
      // 全部
      // {
      //   name: 'prefabStatus',
      //   type: FieldType.string,
      //   label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stagePreStatus').d('阶段预制状态'),
      //   help: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preStatusTips').d('「预制」概念说明：订单/协议生效时，以单据条款阶段接入【编制池-阶段】预制阶段；收货/发票申请事务接入编制池后，将编制来源单据行含税金额，依预制的阶段顺序，匹配填充至阶段的过程。'),
      // },
      {
        name: 'prepStatus',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedStatus').d('编制状态'),
        help: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.prepStatusTips').d('「编制」概念说明：编制提报单缩写'),
      },
      {
        name: 'balStatus',
        type: FieldType.string,
        lookupCode: 'SBSM.ROUTINE_BAL_STATUS',
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.summaryStatus').d('汇总状态'),
        help: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.summaryStatusTips').d('「汇总」概念说明：编制汇总单缩写'),
      },
      {
        name: 'paymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.payAmountDateFirst').d('付款日期(最早)'),
      },
      {
        name: 'paymentDateLast',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.payAmountDateLast').d('付款日期(最晚)'),
      },
      // 可编制
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
      // 可编制 可汇总
      {
        name: 'prepOccupyPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedPayAmount').d('已编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepOccupyApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedWriteOffAmount').d('已编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      // 可编制
      {
        name: 'prepEnablePayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.canPreparedPayAmount').d('可编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepEnableApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.canPreparedWriteOffAmount').d('可编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      // 可汇总
      {
        name: 'balEnablePayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.canSumPayAmount').d('可汇总付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balEnableApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.canSumWriteOffAmount').d('可汇总核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'errorMessage',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.errorMessage').d('错误原因'),
      },
      {
        name: 'prepPaymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPayAmountDateFirst').d('编制付款日期(最早)'),
      },
      {
        name: 'prepPaymentDateLast',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPayAmountDateLast').d('编制付款日期(最晚)'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const urls = {
          [ActiveKey.SourceAll]: `/sbdm/v1/${organizationId}/prep-pool-headers/page-all`,
          [ActiveKey.SourceCompile]: `/sbdm/v1/${organizationId}/prep-pool-headers/page-prep-able`,
          [ActiveKey.SourceSummary]: `/sbdm/v1/${organizationId}/prep-pool-headers/page-balance-able`,
          [ActiveKey.SourceLines]: `/sbdm/v1/${organizationId}/prep-pool-lines/page-all`,
          [ActiveKey.SourceError]: `/sbdm/v1/${organizationId}/prep-pool-errors/page-all`,
        };
        const url = urls[activeKey];
        if (!url) return {};
        return {
          url: `${url}?customizeUnitCode=${[SourceListCode[activeKey], SourceSearchCode[activeKey]].join()}`,
          method: 'POST',
          params: {
            ...data,
            ...params,
          },
        };
      },
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        const createUrl = {
          [ActiveKey.SourceSummary]: `/sbdm/v1/${getCurrentOrganizationId()}/balance-headers/create-prep-by-document?customizeUnitCode=${[SourceListCode[activeKey], SourceSearchCode[activeKey]].join()}`,
          [ActiveKey.SourceCompile]: `/sbdm/v1/${getCurrentOrganizationId()}/prep-headers/create-prep-by-document?customizeUnitCode=${[SourceListCode[activeKey], SourceSearchCode[activeKey]].join()}`,
        };
        switch (submitType) {
          case 'create':
            return {
              url: createUrl[activeKey],
              method: 'POST',
            };
          case 'return':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-pool-lines/return-back?customizeUnitCode=${[SourceListCode[activeKey], SourceSearchCode[activeKey]].join()}`,
              method: 'POST',
            };
          case 'returnPrePool':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-pool-headers/return-to-prep`,
              method: 'POST',
            };
          case 'allCreate':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/balance-headers/create-prep-by-document-batch?customizeUnitCode=${[SourceListCode[activeKey], SourceSearchCode[activeKey]].join()}`,
              method: 'POST',
              data: dataSet?.queryDataSet?.current?.toData(),
            };
          case 'allCreateCompile':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-headers/create-prep-by-document-all?customizeUnitCode=${[SourceListCode[activeKey], SourceSearchCode[activeKey]].join()}`,
              method: 'POST',
              data: dataSet?.queryDataSet?.current?.toData(),
            };
          default:
        }
      },
    },
    feedback: {
      submitSuccess: () => { },
    },
  };
};


export const lovOptionDS = (): DataSetProps => {
  return {
    paging: false,
    queryParameter: {
      lovCode: 'SBSM.PREP_SOURCE_DOC_TYPE',
    },
    autoQuery: true,
    selection: DataSetSelection.single,
    transport: {
      read() {
        return {
          url: `${HZERO_PLATFORM}/v1/${organizationId}/lovs/data`,
          method: 'get',
        };
      },
    },
  };
};

export const stageTableDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    selection: DataSetSelection.multiple,
    dataToJSON: DataToJSON.selected,
    primaryKey: 'poolStageId',
    autoQueryAfterSubmit: false,
    cacheSelection: true,
    fields: [
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.companyName').d('公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.supplierCompanyName').d('供应商'),
      },
      {
        name: 'displayDocumentNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.termSourceNumAndLine').d('条款来源单据编号-行号'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.currencyCode').d('币种'),
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.stageNum').d('阶段编码'),
      },
      {
        name: 'stageDesc',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.stageDoc').d('阶段描述'),
      },
      {
        name: 'stageAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.stageAmount').d('阶段金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      // 全部
      {
        name: 'prefabStatus',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preStatus').d('预制状态'),
        help: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preStatusHelps').d('「预制」概念说明：订单/协议生效时，以单据条款阶段接入【编制池-阶段】预制阶段；收货/发票申请事务接入编制池后，将编制来源单据行含税金额，依预制的阶段顺序，匹配填充至阶段的过程。1.预付款阶段（付款金额完成，且核销金额完成视为预制完成）；1.1当预制付款金额=预制核销金额=阶段金额时，预制完成；1.2 否则，预制中；2.非预付款阶段（无核销场景）；2.1当预制付款金额=0时，未预制；2.2 预制付款金额<阶段金额，预制中；2.3 预制付款金额≧阶段金额，预制完成；'),
      },
      {
        name: 'prepStatus',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedStatus').d('编制状态'),
        help: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.prepStatusHelps').d('预付款阶段需编制2次（付款金额编制、预付款核销金额编制），非预付款阶段仅编制1次，故而「编制状态」区分预付款阶段、非预付款阶段；1.预付款阶段（付款金额编制完成，且核销金额编制完成视为编制完成）；1.1未编制：编制占用付款金额=编制完成付款金额=编制占用核销金额=编制完成核销金额=0；1.2编制中：编制完成付款金额<阶段金额，或，编制完成核销金额<阶段金额；1.3已编制：编制完成付款金额≧阶段金额，且，编制完成核销金额≧阶段金额；2.非预付款阶段（仅编一次）；2.1未编制：编制占用付款金额=编制完成付款金额=0，不存在核销无需判断「编制完成核销金额」；2.2编制中：编制完成付款金额<阶段金额，不存在核销无需判断「编制完成核销金额」；2.3已编制：编制完成付款金额≧阶段金额，不存在核销无需判断「编制完成核销金额」；'),
      },
      {
        name: 'balStatus',
        type: FieldType.string,
        lookupCode: 'SBSM.ROUTINE_BAL_STATUS',
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.summaryStatus').d('汇总状态'),
        help: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.summaryStatusHelps').d('编制流程=编制提报且汇总时，可通过编制汇总单进行编制金额/日期的汇总调整，汇总调整进度体现为「汇总状态」'),
      },
      // 可编制
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
      // 可编制 可汇总
      {
        name: 'prepOccupyPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedPayAmount').d('已编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepOccupyApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedWriteOffAmount').d('已编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      // 可编制
      {
        name: 'prepEnablePayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.canPreparedPayAmount').d('可编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepEnableApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.canPreparedWriteOffAmount').d('可编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      // 可汇总
      {
        name: 'balEnablePayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.canSumPayAmount').d('可汇总付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balEnableApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.canSumWriteOffAmount').d('可汇总核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      // 全部可编制 可汇总
      {
        name: 'prefabPaymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prePayAmountDateFirst').d('预制付款日期(最早)'),
      },
      {
        name: 'prefabPaymentDateLast',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prePayAmountDateLast').d('预制付款日期(最晚)'),
      },
      {
        name: 'prepFinalPaymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPaymentConfirmDate').d('编制确认付款日期(最早)'),
      },
      {
        name: 'prepFinalPaymentDateLast',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPaymentConfirmDateLast').d('编制确认付款日期(最晚)'),
      },
      {
        name: 'prepPaymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPayAmountDateFirst').d('编制付款日期(最早)'),
      },
      {
        name: 'prepPaymentDateLast',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPayAmountDateLast').d('编制付款日期(最晚)'),
      },
    ],
    queryParameter: {
      customizeUnitCode: `${[StageListCode[activeKey], StageSearchCode[activeKey]].join()}`,
    },
    transport: {
      read: ({ data, params }) => {
        const urls = {
          [ActiveKey.StageAll]: `/sbdm/v1/${organizationId}/prep-pool-stages/page-all`,
          [ActiveKey.StageCompile]: `/sbdm/v1/${organizationId}/prep-pool-stages/page-prep-able`,
          [ActiveKey.StageSummary]: `/sbdm/v1/${organizationId}/prep-pool-stages/page-balance-able`,
        };
        const url: any = urls[activeKey];
        if (!url) return {};
        return {
          url: `${url}?customizeUnitCode=${[StageListCode[activeKey], StageSearchCode[activeKey]].join()}`,
          method: 'POST',
          params: {
            ...params,
            ...data,
          },
        };
      },
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        const createUrl = {
          [ActiveKey.StageSummary]: `/sbdm/v1/${getCurrentOrganizationId()}/balance-headers/create-prep-by-stage?customizeUnitCode=${[StageListCode[activeKey], StageSearchCode[activeKey]].join()}`,
          [ActiveKey.StageCompile]: `/sbdm/v1/${getCurrentOrganizationId()}/prep-headers/create-prep-by-stage?customizeUnitCode=${[StageListCode[activeKey], StageSearchCode[activeKey]].join()}`,
        };
        switch (submitType) {
          case 'create':
            return {
              url: createUrl[activeKey],
              method: 'POST',
            };
          default:
        }
      },
    },
    feedback: {
      submitSuccess: () => { },
    },
  };
};


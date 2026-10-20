import { FieldType, DataSetSelection, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { ActiveKey, ListGridCode, ListFilterCode } from '../../utils/type';
import { amountFormatterPrecision } from '../../../../utils/utils';

const organizationId = getCurrentOrganizationId();

export const wholeTableDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    selection: DataSetSelection.multiple,
    dataToJSON: DataToJSON.selected,
    cacheSelection: true,
    primaryKey: 'balHeaderId',
    fields: [
      {
        name: 'balStatus',
        label: intl.get('sbsm.fundPlan.model.summary.status').d('状态'),
        lookupCode: 'SBSM.BALANCE_STATUS',
      },
      {
        name: 'operation',
        label: intl.get('sbsm.fundPlan.model.summary.operate').d('操作'),
      },
      {
        name: 'balNum',
        label: intl.get('sbsm.fundPlan.model.summary.fundPlanSumNum').d('资金计划汇总单号'),
      },
      {
        name: 'companyName',
        label: intl.get('sbsm.fundPlan.model.summary.company').d('公司'),
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
        name: 'prepViewTypeMeaning',
        label: intl.get('sbsm.fundPlan.model.summary.preparationView').d('编制视图'),
      },
      {
        name: 'createdByName',
        label: intl.get('sbsm.fundPlan.model.summary.creator').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get('sbsm.fundPlan.model.summary.createTime').d('创建时间'),
      },
    ],
    queryParameter: {
      customizeUnitCode: [ListGridCode[activeKey], ListFilterCode[activeKey]].join(),
    },
    transport: {
      read: ({ data, params }) => {
        const urlMap = {
          [ActiveKey.WholeAll]: `/sbdm/v1/${organizationId}/balance-headers/page/all`,
          [ActiveKey.WholeApprove]: `/sbdm/v1/${organizationId}/balance-headers/page/approve-able`,
          [ActiveKey.WholePending]: `/sbdm/v1/${organizationId}/balance-headers/page/submit-able`,
        };
        const { customizeUnitCode } = data;
        return {
          url: urlMap[activeKey],
          method: 'POST',
          params: { ...params, customizeUnitCode },
        };
      },
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        switch (submitType) {
          case 'submit':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/balance-headers/async-batch-submit`,
              method: 'POST',
            };
          default:
        }
      },
    },
  };
};


export const detailTableDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    selection: DataSetSelection.multiple,
    cacheSelection: true,
    primaryKey: 'balLineId',
    fields: [
      {
        name: 'balStatus',
        label: intl.get('sbsm.fundPlan.model.summary.status').d('状态'),
        lookupCode: 'SBSM.BALANCE_STATUS',
      },
      {
        name: 'balNumAndLineNum',
        label: intl.get('sbsm.fundPlan.model.summary.fundPlanSumNumAndLineNum').d('资金计划汇总单号-行号'),
      },
      {
        name: 'companyName',
        label: intl.get('sbsm.fundPlan.model.summary.company').d('公司'),
      },
      {
        name: 'supplierCompanyNum',
        label: intl.get('sbsm.fundPlan.model.summary.supplierCompanyNum').d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('sbsm.fundPlan.model.summary.supplierCompanyName').d('供应商名称'),
      },
      {
        name: 'prepSourceMeaning',
        label: intl.get('sbsm.fundPlan.model.summary.prepSourceDocType').d('编制来源单据类型'),
      },
      {
        name: 'documentNum',
        label: intl.get('sbsm.fundPlan.model.summary.prepSourceDocNum').d('编制来源单据编号'),
      },
      {
        name: 'documentAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.prepSourceDocAmount').d('编制来源单据金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
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
        name: 'stageAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.stageAmount').d('阶段金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.thisSumPaymentAmount').d('本次汇总付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.thisSumApplyAmount').d('本次汇总核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balPaymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.summary.sumExpectedPaymentDateFirst').d('汇总期望付款日期（最早）'),
      },
      {
        name: 'balPaymentDateLast',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.summary.sumExpectedPaymentDateLast').d('汇总期望付款日期（最晚）'),
      },
      {
        name: 'remainAmountProcessMeaning',
        label: intl.get('sbsm.fundPlan.model.summary.unSummaryAmountHandle').d('未汇总金额处理'),
      },
      {
        name: 'lineRemark',
        label: intl.get('sbsm.fundPlan.model.summary.remark').d('备注'),
      },
      {
        name: 'operation',
        label: intl.get('sbsm.fundPlan.model.summary.operate').d('操作'),
      },
      {
        name: 'prepPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.prepPayAmount').d('编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balOccupyPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.sumedPayAmount').d('已汇总付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balEnablePayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.sumablePayAmount').d('可汇总付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.prepApplyAmount').d('编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balOccupyApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.sumedApplyAmount').d('已汇总核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balEnableApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.sumableApplyAmount').d('可汇总核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepPaymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.summary.prepPaymentDateFirst').d('编制付款日期(最早)'),
      },
      {
        name: 'prepPaymentDateLast',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.summary.prepPaymentDateLast').d('编制付款日期(最晚)'),
      },
    ],
    queryParameter: {
      customizeUnitCode: [ListGridCode[activeKey], ListFilterCode[activeKey]].join(),
    },
    transport: {
      read: ({ data, params }) => {
        const { customizeUnitCode } = data;
        return {
          url: `/sbdm/v1/${organizationId}/balance-lines/list-all`,
          method: 'POST',
          params: { ...params, customizeUnitCode },
        };
      },
    },
  };
};

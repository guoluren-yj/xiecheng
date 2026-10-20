import type { DataSet } from 'choerodon-ui/pro';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { DataSetSelection, FieldType, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { amountFormatterPrecision } from '../../../../utils/utils';

const organizationId = getCurrentOrganizationId();

export const sourceTableDS = ({ headerDs } : { headerDs?: DataSet } = {}): DataSetProps => {
  const lineAddParams = headerDs
  ? headerDs.current?.get(['companyId', 'balHeaderId', 'currencyCode']) || {}
  : {};
  return {
    autoQuery: false,
    pageSize: 20,
    primaryKey: 'poolHeaderId',
    cacheSelection: true,
    selection: DataSetSelection.multiple,
    dataToJSON: DataToJSON.selected,
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
        name: 'prepSource',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedSource').d('编制来源'),
        lookupCode: 'SBSM.PREP_SOURCE',
      },
      {
        name: 'documentNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.preparedSourceNum').d('编制来源单据编号'),
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
        name: 'prepPaymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPayAmountDateFirst').d('编制付款日期(最早)'),
      },
      {
        name: 'prepPaymentDateLast',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPayAmountDateLast').d('编制付款日期(最晚)'),
      },
      {
        name: 'operate',
        type: FieldType.string,
        label: intl.get('sbsm.common.model.fundPlanPrefabrication.watchDetails').d('执行情况'),
      },
    ],
    queryParameter: lineAddParams,
    transport: {
      read: ({ data, params }) => {
        const { customizeUnitCode } = data;
        return {
          url: `/sbdm/v1/${organizationId}/prep-pool-headers/page-balance-able`,
          method: 'POST',
          params: {...params, customizeUnitCode },
        };
      },
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        const balHeaderId = dataSet?.getQueryParameter('balHeaderId');
        const customizeUnitCode = dataSet?.getQueryParameter('customizeUnitCode');

        switch (submitType) {
          case 'create':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/balance-headers/create-prep-by-document`,
              method: 'POST',
            };
          case 'addLine':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/balance-lines/create-by-document/${balHeaderId}`,
              method: 'POST',
            };
          case 'returnPrePool':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-pool-headers/return-to-prep`,
              method: 'POST',
            };
          case 'allCreate':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/balance-headers/create-prep-by-document-batch?customizeUnitCode=${customizeUnitCode}`,
              method: 'POST',
              data: dataSet?.queryDataSet?.current?.toData(),
            };
          default:
        }
      },
    },
  };
};


export const stageTableDS = ({ headerDs } : { headerDs?: DataSet } = {}): DataSetProps => {
  const lineAddParams = headerDs
    ? headerDs.current?.get(['companyId', 'balHeaderId', 'currencyCode']) || {}
    : {};
  return {
    autoQuery: false,
    pageSize: 20,
    selection: DataSetSelection.multiple,
    primaryKey: 'poolStageId',
    cacheSelection: true,
    dataToJSON: DataToJSON.selected,
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
    queryParameter: lineAddParams,
    transport: {
      read: ({ data, params }) => {
        const { customizeUnitCode } = data;
        return {
          url: `/sbdm/v1/${organizationId}/prep-pool-stages/page-balance-able`,
          method: 'POST',
          params: {...params, customizeUnitCode },
        };
      },
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        const balHeaderId = dataSet?.getQueryParameter('balHeaderId');
        switch (submitType) {
          case 'create':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/balance-headers/create-prep-by-stage`,
              method: 'POST',
            };
          case 'addLine':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/balance-lines/create-by-stage/${balHeaderId}`,
              method: 'POST',
            };
          default:
        }
      },
    },
  };
};

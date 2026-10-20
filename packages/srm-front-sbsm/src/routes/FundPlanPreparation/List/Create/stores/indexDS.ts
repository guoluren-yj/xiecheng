import { DataSetSelection, FieldType, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { CreateSourceCode, CreateStageCode } from '../../../utils/type';
import { amountFormatterPrecision } from '../../../../../utils/utils';

const organizationId = getCurrentOrganizationId();

export const sourceTableDS = (): DataSetProps => {
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
      // 所有页签
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
      },
      // 可编制
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
        name: 'prepPaymentDate',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPayAmountDateFirst').d('编制付款日期(最早)'),
      },
      {
        name: 'prepPaymentDateLast',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPayAmountDateLast').d('编制付款日期(最晚)'),
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
      {
        name: 'prepSource',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.preparedSource').d('编制来源'),
        lookupCode: 'SBSM.PREP_SOURCE',
      },
      {
        name: 'operate',
        type: FieldType.string,
        label: intl.get('sbsm.common.model.fundPlanPrefabrication.watchDetails').d('执行情况'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `/sbdm/v1/${organizationId}/prep-pool-headers/page-prep-able?customizeUnitCode=${Object.values(CreateSourceCode).join()}`,
          method: 'POST',
          params: {
            ...data,
            ...params,
          },
        };
      },
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        const prepHeaderId = dataSet?.getState('prepHeaderId');
        switch (submitType) {
          case 'create':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-headers/create-prep-by-document?customizeUnitCode=${Object.values(CreateSourceCode).join()}`,
              method: 'POST',
            };
          case 'createLine':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-lines/create-by-document/${prepHeaderId}?customizeUnitCode=${Object.values(CreateSourceCode).join()}`,
              method: 'POST',
            };
          default:
        }
      },
    },
  };
};

export const stageTableDS = (): DataSetProps => {
    return {
      autoQuery: false,
      pageSize: 20,
      selection: DataSetSelection.multiple,
      primaryKey: 'poolStageId',
      dataToJSON: DataToJSON.selected,
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
          name: 'documentNum',
          type: FieldType.string,
          label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.termSourceNum').d('条款来源单据编号'),
        },
        {
          name: 'currencyCode',
          type: FieldType.string,
          label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.currencyCode').d('币种'),
        },
        {
          name: 'stageNum',
          type: FieldType.string,
          label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.stageNum').d('阶段编号'),
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
      ],
      transport: {
        read: ({ data, params }) => {
          return {
            url: `/sbdm/v1/${organizationId}/prep-pool-stages/page-prep-able?customizeUnitCode=${Object.values(CreateStageCode).join()}`,
            method: 'POST',
            params: {
              ...data,
              ...params,
            },
          };
        },
        submit: ({ dataSet }): any => {
          const submitType = dataSet?.getState('submitType');
          const prepHeaderId = dataSet?.getState('prepHeaderId');
          switch (submitType) {
            case 'create':
              return {
                url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-headers/create-prep-by-stage?customizeUnitCode=${Object.values(CreateStageCode).join()}`,
                method: 'POST',
              };
            case 'createLine':
              return {
                url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-lines/create-by-stage/${prepHeaderId}?customizeUnitCode=${Object.values(CreateStageCode).join()}`,
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

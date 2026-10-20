import { DataToJSON, FieldType, DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { math } from 'choerodon-ui/dataset';

import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { DetailCustomizeCode } from '../../utils/type';
import { amountFormatterPrecision } from '../../../../utils/utils';

const organizationId = getCurrentOrganizationId();
interface MyDataSetProps extends DataSetProps {
  validationCode?: string,
  validationTitle?: string,
};


export const headerDS = (prepHeaderId): MyDataSetProps => {
  return {
    forceValidate: true,
    cacheSelection: false,
    autoQueryAfterSubmit: false,
    autoCreate: true,
    autoQuery: true,
    primaryKey: 'prepHeaderId',
    validationCode: 'header',
    dataToJSON: DataToJSON.all,
    validationTitle: intl.get(`sbsm.fundPlan.view.title.basicInfo`).d('基本信息'),
    queryParameter: {
      prepHeaderId,
    },
    fields: [
      {
        name: 'prepReportStatus',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.status').d('状态'),
        lookupCode: 'SBSM.PREP_REPORT_STATUS',
      },
      {
        name: 'createdUserName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.createName').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get('sbsm.fundPlan.model.fundPlan.createTime').d('创建时间'),
      },
      {
        name: 'prepViewType',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.controlDimension').d('编制视图'),
        lookupCode: 'SBSM.PREP_VIEW_TYPE',
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.companyName').d('公司名称'),
      },
      {
        name: 'companyNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.companyNum').d('公司编码'),
      },
      {
        name: 'autoSplitRule',
        type: FieldType.string,
        lookupCode: 'SBSM.AUTO_SPLIT_RULE',
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepSplitRule').d('编制金额自动拆分规则'),
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.remark').d('备注'),
      },
      {
        name: 'prepNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepNum').d('资金计划编制单号'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return{
          url: `/sbdm/v1/${organizationId}/prep-headers/detail/${prepHeaderId}?customizeUnitCode=${DetailCustomizeCode.BasicFormCode}`,
          method: 'POST',
          params: {
            ...data,
            ...params,
          },
          data: {},
        };
      },
      submit: ({ dataSet, data }): any => {
        const submitType = dataSet?.getState('submitType');
        switch (submitType) {
          case 'save':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-headers/save?customizeUnitCode=${DetailCustomizeCode.BasicFormCode},${DetailCustomizeCode.LineTableCode}`,
              method: 'POST',
              data: data[0],
            };
          case 'submit':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-headers/submit?asyncSubmitFlag=true&customizeUnitCode=${DetailCustomizeCode.BasicFormCode},${DetailCustomizeCode.LineTableCode}`,
              method: 'POST',
              data: data[0],
            };
          case 'confirm':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-headers/confirm`,
              method: 'POST',
              data: data[0],
            };
          case 'validate':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-headers/valid/submit`,
              method: 'POST',
              data: data[0],
            };
          case 'cancel':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-headers/cancel`,
              method: 'POST',
              data: data[0],
            };
          case 'delete':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-headers/delete`,
              method: 'POST',
              data: data[0],
            };
          case 'updateLine':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-lines/associate-field-update?customizeUnitCode=${DetailCustomizeCode.BasicFormCode},${DetailCustomizeCode.LineTableCode}`,
              method: 'POST',
              data: data[0],
            };
          case 'validateLine':
              return {
                url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-lines/validate?customizeUnitCode=${DetailCustomizeCode.BasicFormCode},${DetailCustomizeCode.LineTableCode}`,
                method: 'POST',
                data: data[0],
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

// 编制明细

export const preLineDS = (prepHeaderId): MyDataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    primaryKey: 'prepLineId',
    cacheSelection: true,
    autoQueryAfterSubmit: false,
    forceValidate: true,
    validationTitle: intl.get(`sbsm.fundPlan.view.title.preStageLine`).d('编制行信息'),
    validationCode: 'line',
    fields: [
      {
        name: 'lineNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.lineNum').d('行号'),
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
        name: 'termSourceDocNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.docTermNum').d('条款来源单据编号'),
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
        name: 'documentAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepSourceDocAmount').d('编制来源单据金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prePayAmount').d('本次编制付款金额'),
        required: true,
        dynamicProps: {
          disabled: ({ record }) => math.eq(record?.get('prepEnablePayAmount'), 0),
          formatterOptions: amountFormatterPrecision,
        },
        validator: (value, name, record: any) => {
          const { stageAmount, documentAmount, prepViewType } = record?.get(['stageAmount', 'documentAmount', 'prepViewType']) || {};
          const baseAmount = ['STAGE'].includes(prepViewType) ? stageAmount : documentAmount;
          if (!math.isNaN(baseAmount) && !math.isNaN(value) && math.lt(math.multipliedBy(baseAmount, value), 0)) {
            if (prepViewType === 'STAGE') {
              return intl.get(`sbsm.common.message.validate.sameSign.stageAmountPrep`).d(`本次编制付款金额需与阶段金额同号，即同为正数/负数/0，请检查`);
            } else {
              return intl.get(`sbsm.common.message.validate.sameSign.documentAmount`).d(`本次编制付款金额需与编制来源单据金额同号，即同为正数/负数/0，请检查`);
            }
          }
          return true;
        },
      },
      {
        name: 'prepApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prePayApplyAmount').d('本次编制核销金额'),
        dynamicProps: {
          disabled: ({ record }) => math.eq(record?.get('prepEnableApplyAmount'), 0),
          formatterOptions: amountFormatterPrecision,
        },
        validator: (value, name, record: any) => {
          const { prepEnableApplyAmount } = record?.get(['prepEnableApplyAmount']) || {};
          if (!math.isNaN(value) && !math.isNaN(prepEnableApplyAmount) && math.lt(math.multipliedBy(prepEnableApplyAmount, value), 0)) {
            return intl
              .get(`sbsm.common.message.validate.sameSign.prepApplyCompare`)
              .d(`本次核销金额需与可编制核销金额同号`);
          }
          return true;
        },
      },
      {
        name: 'prepPaymentDate',
        type: FieldType.date,
        format: 'YYYY-MM-DD',
        label: intl.get('sbsm.fundPlan.model.fundPlan.payAmountDateFirst').d('编制期望付款日期（最早）'),
        // required: true,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'prepPaymentDateLast',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlan.payAmountDateLast').d('编制期望付款日期（最晚）'),
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
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prePayAmountDateFirst').d('预制付款日期(最早)'),
      },
      {
        name: 'prefabPaymentDateLast',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prePayAmountDateLast').d('预制付款日期(最晚)'),
      },
      {
        name: 'execute',
        type: FieldType.string,
        label: intl.get('sbsm.common.model.fundPlanPrefabrication.watchDetails').d('执行情况'),
      },
    ],
    transport: {
      read: ({ data, params, dataSet }): any => {
        if (dataSet?.getState('queryStatus') !== 'ready') return;
        const { supplierLovKeysStr, ...others } = data || {};
        return {
          url: `/sbdm/v1/${organizationId}/prep-lines/list/${prepHeaderId}?customizeUnitCode=${[DetailCustomizeCode.LineSearchTableCode, DetailCustomizeCode.LineTableCode].join()}`,
          method: 'POST',
          params: {
            ...others,
            ...params,
          },
          data: {
            supplierLovKeysStr,
          },
        };
      },
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        switch (submitType) {
          case 'autoShare':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-lines/auto-share?customizeUnitCode=${[DetailCustomizeCode.LineSearchTableCode, DetailCustomizeCode.LineTableCode].join()}`,
              method: 'POST',
            };
          case 'deleteLine':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-lines/cancel`,
              method: 'POST',
            };
          default:
        }
      },
      destroy: () => {
        return {
          url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-lines/cancel`,
          method: 'POST',
        };
      },
    },
    feedback: {
      submitSuccess: () => {},
    },
  };
};
// 调整批量详情DS
// 编制阶段信息
export const preStageInfoDS = (): DataSetProps => {
  return {
    autoQuery: false,
    primaryKey: 'poolStageId',
    fields: [
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
        name: 'stageType',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.paymentStageType').d('阶段类型'),
        lookupCode: 'SBSM.STAGE_TYPE',
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
        label: intl.get('sbsm.fundPlan.model.fundPlan.preparedPayAmount').d('已编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepEnablePayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.canPreparedPayAmount').d('可编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prePayAmount').d('本次编制付款金额'),
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
    ],
    transport: {
      // read: () => {
      //   const { poolHeaderId, poolStageId } = recordInfo?.get(['poolHeaderId', 'poolStageId']) || {};
      //   const url = prepViewType === 'STAGE' ? `/sbdm/v1/${organizationId}/prep-pool-stages/detail/${poolStageId}` : `/sbdm/v1/${organizationId}/prep-pool-headers/detail/${poolHeaderId}`;
      //   return {
      //     url: `${url}?customizeUnitCode=${DetailCustomizeCode.PreStageInfoCode}`,
      //     method: 'POST',
      //     data: {
      //       prepViewType,
      //     },
      //   };
      // },
    },
  };
};
// 编制来源单据行匹配阶段明细
export const preStageLineDS = (param): DataSetProps => {
  return {
    autoQuery: true,
    pageSize: 20,
    primaryKey: 'prepRelationId',
    cacheSelection: true,
    forceValidate: true,
    selection: DataSetSelection.multiple,
    paging: 'server',
    childrenField: 'children',
    parentField: 'parentId',
    idField: 'prepRelationId',
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
        required: true,
        dynamicProps: {
          disabled: ({ record }) => math.eq(record?.get('displayPrepEnablePayAmount'), 0),
        },
        computedProps: {formatterOptions: amountFormatterPrecision},
        validator: (value, name, record: any) => {
          const { prepSourceAmount } = record?.get(['prepSourceAmount']) || {};
          if (!math.isNaN(prepSourceAmount) && !math.isNaN(value) && math.lt(math.multipliedBy(prepSourceAmount, value), 0)) {
            if (param.prepViewType === 'STAGE') {
              return intl.get(`sbsm.common.message.validate.sameSign.stageAmountPrep`).d(`本次编制付款金额需与阶段金额同号，即同为正数/负数/0，请检查`);
            } else return intl.get(`sbsm.common.message.validate.sameSign.documentAmount`).d(`本次编制付款金额需与编制来源单据金额同号，即同为正数/负数/0，请检查`);
          }
          return true;
        },
      },
      {
        name: 'prepApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prePayApplyAmount').d('本次编制核销金额'),
        dynamicProps: {
          disabled: ({ record }) => math.eq(record?.get('displayPrepEnableApplyAmount'), 0),
        },
        computedProps: {formatterOptions: amountFormatterPrecision},
        validator: (value, name, record: any) => {
          const { prepEnableApplyAmount } = record?.get(['prepEnableApplyAmount']) || {};
          if (!math.isNaN(value) && !math.isNaN(prepEnableApplyAmount) && math.lt(math.multipliedBy(prepEnableApplyAmount, value), 0)) {
            return intl
              .get(`sbsm.common.message.validate.sameSign.prepApplyCompare`)
              .d(`本次核销金额需与可编制核销金额同号`);
          }
          return true;
        },
      },
      {
        name: 'prepPaymentDate',
        type: FieldType.date,
        format: DEFAULT_DATE_FORMAT,
        label: intl.get('sbsm.common.model.fundPlan.exPaymentDate').d('编制付款日期'),
        required: true,
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
        const { supplierLovKeysStr, ...others } = data || {};
        return {
          url: `/sbdm/v1/${organizationId}/prep-relations/tree-list?customizeUnitCode=${DetailCustomizeCode.PreStageLineCode}`,
          method: 'POST',
          params: {
            ...others,
            ...params,
          },
          data: {
            ...param,
            supplierLovKeysStr,
          },
          transformResponse: (response) => {
            let res: any = {};
            try {
              res = JSON.parse(response);
            } catch(e) {
              throw e;
            }
            if (!getResponse(res)) return;
            const { content = [] } = res || {};
            return {
              ...res,
              content: content.map((item) => {
                item.parentFlag = 1;
                item.children = item?.children?.map((ele) => {
                  ele.parentFlag = 0;
                  return ele;
                });
                return item;
              }),
            };
          },
        };
      },
      submit: ({ data, dataSet }): any => {
        const lineRecordData = dataSet?.getState('lineRecordData');
        return {
          url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-relations/save?customizeUnitCode=${DetailCustomizeCode.PreStageLineCode}`,
          method: 'POST',
          data: {
            ...lineRecordData,
            prepRelationList: data,
          },
        };
      },
      destroy: ({ data, dataSet }) => {
        const lineRecordData = dataSet?.getState('lineRecordData');
        return {
          url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-relations/delete`,
          method: 'POST',
          data: {
            ...lineRecordData,
            prepRelationList: data,
          },
        };
      },
    },
  };
};

export const batchModifyDS = (selected, batchEditType): DataSetProps => {
  return {
    autoCreate: true,
    primaryKey: 'prepHeaderId',
    fields: [
      {
        name: 'prepPaymentDate',
        type: FieldType.date,
        format: 'YYYY-MM-DD',
        label: intl.get('sbsm.common.model.fundPlan.exPaymentDate').d('编制付款日期'),
        required: ['relationsLine'].includes(batchEditType),
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'lineRemark',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.remark').d('备注'),
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.remark').d('备注'),
      },
    ],
    transport: {
      submit: ({ dataSet, data }): any => {
        const submitType = dataSet?.getState('submitType');
        const list = selected?.map((item) => item?.toData());
        const recordData = dataSet?.getState('recordData');
        switch (submitType) {
          case 'line':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-lines/batch-edit?customizeUnitCode=${DetailCustomizeCode.LineBatchCode}`,
              method: 'POST',
              data: {
                ...recordData,
                batchEditPrepLineParam: data[0],
                prepLineIdList: list.map((item) => item.prepLineId),
              },
            };
          case 'relationsLine':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-relations/batch-edit?customizeUnitCode=${DetailCustomizeCode.PreStageBatchCode}`,
              method: 'POST',
              data: {
                ...recordData,
                batchEditPrepRelationParam: data[0],
                prepRelationIdList: list.map((item) => item.prepRelationId),
              },
            };
          default:
        }
      },
    },
  };
};

export const prepResultDS = (prepHeaderId): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    selection: DataSetSelection.multiple,
    fields: [
      {
        name: 'displayDimensionNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.displayDimensionNum').d('维度编码'),
      },
      {
        name: 'displayDimension',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.dimensionName').d('维度名称'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.currencyCode').d('币种编码'),
      },
      {
        name: 'currencyName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.currencyName').d('币种名称'),
      },
      {
        name: 'stageAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.stageAmount').d('阶段金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'documentAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.sourceDocAmount').d('来源单据金额'),
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
        name: 'prepEnablePayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prepEnableApplyAmount').d('可编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepEnableApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.canPreparedWriteOffAmount').d('可编制核销金额'),
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
        name: 'prepOccupyPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.preparedPayAmount').d('已编制付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepOccupyApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.fundPlan.preparedWriteOffAmount').d('已编制核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'prepPaymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prePayAmountExpectedDateFirst').d('编制期望付款日期（最早）'),
      },
      {
        name: 'prepPaymentDateLast',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.fundPlan.prePayAmountDateLast').d('编制期望付款日期（最晚）'),
      },
    ],
    transport: {
      read: ({ data, params, dataSet }) => {
        const displayDimension = dataSet?.getQueryParameter('displayDimension');
        const { supplierLovKeysStr, ...others } = data || {};
        return {
          url: `/sbdm/v1/${organizationId}/prep-lines/list/dimension?customizeUnitCode=${[DetailCustomizeCode.ResultTableCode, DetailCustomizeCode.ResultSearchTableCode].join()}`,
          method: 'POST',
          params: {
            ...others,
            ...params,
          },
          data: {
            displayDimension,
            prepHeaderId,
            supplierLovKeysStr,
          },
        };
      },
    },
  };
};

export const prepResultBarDS = () => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'displayDimension',
        label: intl.get(`sbsm.common.view.message.prepAmountDimension`).d('编制金额维度'),
        lookupCode: 'SBSM.PREP_AMOUNT_DIMENSION',
        defaultValue: 'SUPPLIER',
      },
    ],
  };
};


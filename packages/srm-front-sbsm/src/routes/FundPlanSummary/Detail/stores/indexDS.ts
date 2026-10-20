import type { DataSet } from 'choerodon-ui/pro';
import type { FieldProps } from 'choerodon-ui/dataset/data-set/Field';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import { math } from 'choerodon-ui/dataset';

import { noop } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { DetailCustomizeCode } from '../../utils/type';
import { amountFormatterPrecision } from '../../../../utils/utils';

const organizationId = getCurrentOrganizationId();
interface MyDataSetProps extends DataSetProps {
  validationCode?: string,
  validationTitle?: string,
};


export const headerDS = (balHeaderId): MyDataSetProps => {
  return {
    autoQuery: true,
    forceValidate: true,
    primaryKey: 'balHeaderId',
    validationCode: 'header',
    dataToJSON: DataToJSON.all,
    validationTitle: intl.get(`sbsm.fundPlan.view.title.basicInfo`).d('基本信息'),
    autoQueryAfterSubmit: false,
    queryParameter: {
      customizeUnitCode: DetailCustomizeCode.BasicFormCode,
      balHeaderId,
    },
    fields: [
      {
        name: 'balStatus',
        label: intl.get('sbsm.fundPlan.model.summary.status').d('状态'),
        lookupCode: 'SBSM.BALANCE_STATUS',
      },
      {
        name: 'balNum',
        label: intl.get('sbsm.fundPlan.model.summary.fundPlanSumNum').d('资金计划汇总单号'),
      },
      {
        name: 'companyName',
        label: intl.get('sbsm.fundPlan.model.summary.companyName').d('公司名称'),
      },
      {
        name: 'companyNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.summary.companyNum').d('公司编码'),
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
      {
        name: 'autoSplitRuleMeaning',
        label: intl.get('sbsm.fundPlan.model.summary.sumAmountAutoSplitRule').d('汇总金额自动拆分规则'),
      },
      {
        name: 'remark',
        label: intl.get('sbsm.fundPlan.model.summary.remark').d('备注'),
      },
      {
        name: 'balNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.summary.balNum').d('资金计划汇总单号'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { customizeUnitCode } = data;
        return {
          url: `/sbdm/v1/${organizationId}/balance-headers/detail`,
          method: 'POST',
          params: { ...params, customizeUnitCode },
        };
      },
      submit: ({ dataSet, data, params }): any => {
        const submitType = dataSet?.getState('submitType');
        const options = {
          url: '',
          method: 'POST',
          data: data[0],
          params: {
            ...params,
            customizeUnitCode: [DetailCustomizeCode.BasicFormCode, DetailCustomizeCode.LineTableCode].join(),
          },
        };
        switch (submitType) {
          case 'save':
            options.url = `/sbdm/v1/${organizationId}/balance-headers/save`;
            break;
          case 'submit':
            options.url = `/sbdm/v1/${organizationId}/balance-headers/submit?asyncSubmitFlag=true`;
            break;
          case 'confirm':
            options.url = `/sbdm/v1/${organizationId}/balance-headers/confirm`;
            break;
          case 'cancel':
            options.url = `/sbdm/v1/${organizationId}/balance-headers/cancel`;
            break;
          case 'delete':
            options.url = `/sbdm/v1/${organizationId}/balance-headers/delete`;
            break;
          default:
        }
        return options;
      },
    },
    feedback: {
      submitSuccess: noop,
    },
  };
};

export const lineDS = (): DataSetProps => {
  return {
    pageSize: 20,
    autoQuery: false,
    primaryKey: 'balLineId',
    autoQueryAfterSubmit: false,
    cascadeParams: (record) => record.get(['balHeaderId']),
    fields: [
      {
        name: 'lineNum',
        label: intl.get('sbsm.fundPlan.model.summary.lineNum').d('行号'),
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
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.currencyCode').d('币种'),
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
        required: true,
        validator: (value, name, record: any) => {
          const { balEnablePayAmount } = record?.get(['balEnablePayAmount']) || {};
          if (!math.isNaN(balEnablePayAmount) && !math.isNaN(value) && math.lt(math.multipliedBy(balEnablePayAmount, value), 0)) {
            return intl
              .get(`sbsm.common.message.validate.sameSign.balPayAmount`)
              .d(`本次汇总付款金额需与可汇总付款金额同号，即同为正数/负数/0，请检查`);
          }
          return true;
        },
      },
      {
        name: 'balApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.thisSumApplyAmount').d('本次汇总核销金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
        validator: (value, name, record: any) => {
          const { balEnableApplyAmount } = record?.get(['balEnableApplyAmount']) || {};
          if (!math.isNaN(value) && !math.isNaN(balEnableApplyAmount) && math.lt(math.multipliedBy(balEnableApplyAmount, value), 0)) {
            return intl
              .get(`sbsm.common.message.validate.sameSign.balApplyCompare`)
              .d(`本次核销金额需与可汇总核销金额同号`);
          }
          return true;
        },
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
        name: 'remainAmountProcess',
        label: intl.get('sbsm.fundPlan.model.summary.unSummaryAmountHandle').d('未汇总金额处理'),
        lookupCode: 'SBSM.UN_BAL_AMOUNT_PROCESS',
        required: true,
      },
      {
        name: 'lineRemark',
        label: intl.get('sbsm.fundPlan.model.summary.remark').d('备注'),
      },
      {
        name: 'operation',
        label: intl.get('sbsm.fundPlan.model.summary.operation').d('操作'),
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
      customizeUnitCode: [DetailCustomizeCode.LineFilterCode, DetailCustomizeCode.LineTableCode].join(),
    },
    transport: {
      read: ({ data, params, dataSet }): any => {
        if (dataSet?.getState('queryStatus') !== 'ready') return;
        const { balHeaderId, customizeUnitCode } = data;
        return {
          url: `/sbdm/v1/${organizationId}/balance-lines/list/${balHeaderId}`,
          method: 'POST',
          params: { ...params, customizeUnitCode },
        };
      },
      destroy: () => {
        return {
          url: `/sbdm/v1/${getCurrentOrganizationId()}/balance-lines/cancel`,
          method: 'POST',
        };
      },
    },
    feedback: {
      submitSuccess: () => { },
    },
  };
};

export const batchEditLineDS = (lineDs: DataSet): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'balPaymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.summary.sumPaymentDate').d('汇总付款日期'),
      },
      {
        name: 'remainAmountProcess',
        label: intl.get('sbsm.fundPlan.model.summary.unSummaryAmountHandle').d('未汇总金额处理'),
        lookupCode: 'SBSM.UN_BAL_AMOUNT_PROCESS',
      },
      {
        name: 'lineRemark',
        label: intl.get('sbsm.fundPlan.model.summary.remark').d('备注'),
      },
    ],
    transport: {
      submit: ({ data }): any => {
        const { parent, selected } = lineDs;
        const balHeaderId = parent?.current?.get('balHeaderId');
        const balLineIdList = selected?.map((item) => item?.key);
        return {
          url: `/sbdm/v1/${getCurrentOrganizationId()}/balance-lines/batch-edit`,
          method: 'POST',
          data: {
            balHeaderId,
            balLineIdList,
            batchEditBalLineParam: data[0],
          },
        };
      },
    },
  };
};

export const multiLineDS = (balHeaderId): DataSetProps => {
  return {
    pageSize: 20,
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'dimensionId',
    queryFields: [
      {
        name: 'supplierLovKeysStr',
        type: FieldType.object,
        label: intl.get('sbsm.fundPlan.model.summary.supplier').d('供应商'),
        lovCode: 'SSLM.SUPPLIER_CHOOSE',
        display: true,
      } as FieldProps,
    ],
    fields: [
      {
        name: 'dimensionCode',
        label: intl.get('sbsm.fundPlan.model.summary.dimensionCode').d('维度编码'),
      },
      {
        name: 'dimensionName',
        label: intl.get('sbsm.fundPlan.model.summary.dimensionName').d('维度名称'),
      },
      {
        name: 'stageAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.stageAmount').d('阶段金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'documentAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.prepSourceDocAmount').d('编制来源单据金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balEnablePayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.sumablePayAmount').d('可汇总付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balOccupyPayAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.sumedPayAmount').d('已汇总付款金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'balOccupyApplyAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.sumedApplyAmount').d('已汇总核销金额'),
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
    ],
    queryParameter: { balHeaderId },
    transport: {
      read: () => {
        return {
          url: `/sbdm/v1/${organizationId}/balance-lines/dim/page`,
          method: 'GET',
        };
      },
    },
  };
};


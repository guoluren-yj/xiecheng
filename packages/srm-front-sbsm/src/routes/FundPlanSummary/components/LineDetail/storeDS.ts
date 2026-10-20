import type { DataSet } from "choerodon-ui/pro";
import type { Record as DSRecord} from 'choerodon-ui/dataset';
import type { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";
import { DataToJSON, FieldType } from "choerodon-ui/dataset/data-set/enum";
import { math } from 'choerodon-ui/dataset';

import intl from "utils/intl";
import { getCurrentOrganizationId, getResponse } from "utils/utils";
import { LineDetailCuszCode } from "../../utils/type";
import { amountFormatterPrecision } from '../../../../utils/utils';

export const lineDetailDS = (topRecord: DSRecord): DataSetProps => {
  return {
    autoCreate: true,
    primaryKey: 'balLineId',
    data: [topRecord?.toJSONData() || {}],
    dataToJSON: DataToJSON.all,
    transport: {
      submit: ({ data, params, dataSet }): any => {
        const { balanceRelationList: relatedLineDs } = dataSet?.children || {};
        const customizeUnitCode = relatedLineDs?.getQueryParameter('customizeUnitCode');
        return {
          url: `/sbdm/v1/${getCurrentOrganizationId()}/balance-relations/save`,
          method: 'POST',
          data: data[0],
          params: { ...params, customizeUnitCode },
        };
      },
    },
  };
};

export const basicDS = (topRecord: DSRecord): DataSetProps => {
  return {
    autoQuery: true,
    dataToJSON: DataToJSON.all,
    fields: [
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
        name: 'termSourceNum',
        label: intl.get('sbsm.fundPlan.model.summary.termSourceDocNum').d('条款来源单据编号'),
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
        name: 'stageTypeMeaning',
        label: intl.get('sbsm.fundPlan.model.summary.stageType').d('阶段类型'),
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
    transport: {
      read: ({ data, params }) => {
        const { customizeUnitCode } = data;
        const {
          poolStageId,
          poolHeaderId,
          prepViewType,
        } = topRecord?.get([
          'poolStageId',
          'poolHeaderId',
          'prepViewType',
        ]) || {};
        return {
          url: prepViewType === 'STAGE'
            ? `/sbdm/v1/${getCurrentOrganizationId()}/prep-pool-stages/detail/${poolStageId}`
            : `/sbdm/v1/${getCurrentOrganizationId()}/prep-pool-headers/detail/${poolHeaderId}`,
          method: 'POST',
          params: { ...params, customizeUnitCode },
        };
      },
    },
  };
};

// 编制来源单据行匹配阶段明细
export const relatedLineDS = (topRecord: DSRecord): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    cacheSelection: true,
    primaryKey: 'balRelationId',
    paging: 'server',
    childrenField: 'children',
    parentField: 'parentId',
    idField: 'balRelationId',
    fields: [
      {
        name: 'prepSourceMeaning',
        label: intl.get('sbsm.fundPlan.model.summary.prepSource').d('编制来源'),
      },
      {
        name: 'documentNumAndLineNum',
        label: intl.get('sbsm.fundPlan.model.summary.prepSourceDocNumAndLineNum').d('编制来源单据编号-行号'),
      },
      {
        name: 'prepSourceLineAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlan.model.summary.prepSourceDocLineAmount').d('编制来源单据行金额'),
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
        label: intl.get('sbsm.fundPlan.model.summary.sumPaymentDate').d('汇总付款日期'),
      },
      {
        name: 'remark',
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
        label: intl.get('sbsm.fundPlan.model.summary.prepPaymentDate').d('编制付款日期'),
      },
    ],
    queryParameter: {
      customizeUnitCode: LineDetailCuszCode.RelatedGrid,
    },
    transport: {
      read: ({ data, params }) => {
        const { customizeUnitCode } = data;
        return {
          url: `/sbdm/v1/${getCurrentOrganizationId()}/balance-relations/tree-list`,
          method: 'POST',
          params: { ...params, customizeUnitCode },
          data: topRecord?.get([
            'balHeaderId',
            'poolStageId',
            'poolHeaderId',
            'prepViewType',
          ]) || {},
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
      destroy: ({ data }) => {
        return {
          url: `/sbdm/v1/${getCurrentOrganizationId()}/balance-relations/delete`,
          method: 'POST',
          data: {
            ...topRecord?.toData(),
            balanceRelationList: data,
          },
        };
      },
    },
  };
};

export const relateLineBatchEditDS = (lineDs: DataSet): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'balPaymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.fundPlan.model.summary.sumPaymentDate').d('汇总付款日期'),
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.summary.remark').d('备注'),
      },
    ],
    transport: {
      submit: ({ data }): any => {
        const { selected } = lineDs;
        const topRecordData = lineDs.parent?.current?.toJSONData() || {};
        const balRelationIdList = selected?.map((item) => item?.key);
        return {
          url: `/sbdm/v1/${getCurrentOrganizationId()}/balance-relations/batch-edit`,
          method: 'POST',
          data: {
            ...topRecordData,
            balRelationIdList,
            batchEditBalRelationParam: data[0],
          },
        };
      },
    },
  };
};

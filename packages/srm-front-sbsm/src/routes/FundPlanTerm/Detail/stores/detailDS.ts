import { FieldType, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import type { SubmitType } from '../../utils/type';
import { RegEx, DetailCustomizeCode } from '../../utils/type';

const organizationId = getCurrentOrganizationId();
interface MyDataSetProps extends DataSetProps {
  validationCode?: string,
  validationTitle?: string,
};


export const termHeaderDS = ({ termHeaderId, createFlag, copyFlag }): MyDataSetProps => {
  const customizeUnitCode = Object.values(DetailCustomizeCode).join();
  return {
    forceValidate: true,
    cacheSelection: false,
    autoCreate: createFlag,
    primaryKey: 'termHeaderId',
    validationCode: 'header',
    dataToJSON: DataToJSON.all,
    autoQuery: !createFlag && !copyFlag,
    validationTitle: intl.get(`sbsm.payTermsCtrl.view.title.payTermBasicInfo`).d('付款条款基本信息'),
    fields: [
      {
        name: 'termNum',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentTermCode').d('付款条款编码'),
        maxLength: 30,
        required: !createFlag && !copyFlag,
        disabled: !copyFlag,
        pattern: RegEx.NOCHINESE,
        defaultValidationMessages: {
          patternMismatch: intl.get('sbsm.payTermsCtrl.view.validation.noChinese').d('请输入字母、数字或字符'),
        },
      },
      {
        name: 'termName',
        type: FieldType.intl,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentTermName').d('付款条款描述'),
        required: true,
        maxLength: 240,
        dynamicProps: {
          disabled: ({ record }) => record.get('dataSource') !== 'SRM',
        },
      },
      {
        name: 'dataSource',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentTermSource').d('付款条款来源'),
        lookupCode: 'SBSM.TERM_DATA_SOURCE',
        defaultValue: 'SRM',
      },
      {
        name: 'versionNumber',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.version').d('版本'),
      },
      {
        name: 'termStatus',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.status').d('状态'),
        lookupCode: 'SBSM.TERM_HEADER_STATUS',
        defaultValue: 'UN_PUBLISH',
      },
      // {
      //   name: 'enableFlag',
      //   type: FieldType.string,
      //   label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.enableFlag').d('启用'),
      //   lookupCode: 'HPFM.FLAG',
      //   defaultValue: '1',
      // },
      {
        name: 'defaultFlag',
        type: FieldType.boolean,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.defaultFlag').d('默认'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'prepayStageFlag',
        type: FieldType.boolean,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.prePayExistFlag').d('存在预付'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      // {
      //   name: 'priority',
      //   type: FieldType.number,
      //   label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.priority').d('优先级'),
      //   min: 0,
      //   step: 1,
      //   precision: 0,
      // },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentTermRemark').d('付款条款备注'),
      },
      {
        name: 'amountComputeMode',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.stageProportionFund').d('阶段金额计算规则'),
        lookupCode: 'SBSM.AMOUNT_COMPUTE_MODE',
        required: true,
      },
      {
        name: 'publishedByName',
        label: intl.get('hzero.common.entity.publisher').d('发布人'),
        type: FieldType.string,
        transformResponse: (_, object) => {
          const { publishedByName, publishedLoginName } = object;
          return publishedLoginName ? `${publishedByName}(${publishedLoginName})` : publishedByName;
        },
      },
      {
        name: 'publishedDate',
        label: intl.get('hzero.common.date.releaseTime').d('发布时间'),
        type: FieldType.dateTime,
      },

    ],
    transport: {
      read: () => {
        const partRequestConfig: any = !copyFlag
          ? {
            url: `/sbdm/v1/${organizationId}/term-headers/detail`,
            method: 'GET',
          } : {
            url: `/sbdm/v1/${organizationId}/term-headers/copy-term`,
            method: 'POST',
          };
        return{
          ...partRequestConfig,
          params: { customizeUnitCode },
          data: {
            termHeaderId,
          },
        };
      },
      submit: ({ dataSet, data, params }) => {
        const submitType: SubmitType = dataSet?.getState('submitType');
        const urlMap: Record<SubmitType, string> = {
          create: '/create',
          copy: '/create', // 复制也调用创建接口
          save: '/update',
          release: '/release',
        };
        const suffix = urlMap[submitType] || '';
        return {
          url: `/sbdm/v1/${organizationId}/term-headers${suffix}`,
          method: submitType === 'release' ? 'PUT' : 'POST',
          data: {
            ...data[0],
            tenantId: organizationId,
          },
          params: {
            ...params,
            customizeUnitCode,
          },
        };
      },
    },
  };
};


export const termLineDS = (): MyDataSetProps => {
  return {
    autoQuery: false,
    paging: false,
    pageSize: 0,
    forceValidate: true,
    validationCode: 'line',
    primaryKey: 'termLineId',
    dataToJSON: DataToJSON.all,
    validationTitle: intl.get(`sbsm.payTermsCtrl.view.title.payPlanStage`).d('付款条款阶段'),
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
        maxLength: 30,
        // required: true,
        pattern: RegEx.NOCHINESE,
        disabled: true,
        defaultValidationMessages: {
          patternMismatch: intl.get('sbsm.payTermsCtrl.view.validation.noChinese').d('请输入字母、数字或字符'),
        },
      },
      {
        name: 'stageDesc',
        type: FieldType.intl,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentStageDesc').d('付款阶段描述'),
        required: true,
        maxLength: 240,
      },
      {
        name: 'stageType',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentStageType').d('阶段类型'),
        lookupCode: 'SBSM.STAGE_TYPE',
        defaultValue: 'PAYMENT_FOR_GOODS',
        required: true,
      },
      {
        name: 'stagePercent',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.stageProportion').d('阶段比例（%）'),
        min: 0,
        max: 100,
        dynamicProps: {
          disabled: ({ dataSet }) => {
            const { parent } = dataSet || {};
            const amountComputeMode = parent?.current?.get('amountComputeMode');
            return amountComputeMode !== 'INPUT_PERCENT';
          },
          required: ({ dataSet }) => {
            const { parent } = dataSet || {};
            const amountComputeMode = parent?.current?.get('amountComputeMode');
            return amountComputeMode === 'INPUT_PERCENT';
          },
        },
      },
      {
        name: 'fcDateRule',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.predictPayRulePlan').d('预测付款日期规则'),
        lookupCode: 'SBSM.FC_DATE_RULE',
        defaultValue: 'DYNAMIC_PAY_DATE',
        required: true,
        help: intl.get('sbsm.common.model.payTermsCtrl.predictPayRulePlanTips').d('适用于【资金计划预测】功能中的「预测付款日期」计算规则'),
      },
      {
        name: 'fcBaseDateType',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.predictBaseDateFieldCode').d('预测付款基准日期'),
        lookupCode: 'SBSM.FC_BASE_DATE_TYPE',
        dynamicProps: {
          disabled: ({ record }) => record?.get('fcDateRule') === 'NO_NEED_CALCULATE',
          required: ({ record }) => ['DYNAMIC_PAY_DATE', 'FIXED_PAY_DATE'].includes(record?.get('fcDateRule')), // 预测付款日期规则等于动态付款日期
        },
      },
      {
        name: 'fcDeadLine',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.predictDeadLineDate').d('预测付款基准日期截止日'),
        dynamicProps: {
          disabled: ({ record }) => ['NO_NEED_CALCULATE', 'DYNAMIC_PAY_DATE'].includes(record?.get('fcDateRule')),
          required: ({ record }) => ['FIXED_PAY_DATE'].includes(record?.get('fcDateRule')),
        },
        help: intl.get('sbsm.common.model.payTermsCtrl.predictDeadLineDateTips').d('参见「期望付款基准日期截止日」释义'),
      },
      {
        name: 'fcFixedDay',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.predictPayFixedDay').d('预测付款固定日'),
        dynamicProps: {
          disabled: ({ record }) => ['NO_NEED_CALCULATE', 'DYNAMIC_PAY_DATE'].includes(record?.get('fcDateRule')),
          required: ({ record }) => ['FIXED_PAY_DATE'].includes(record?.get('fcDateRule')),
        },
      },
      {
        name: 'fcAccountPeriod',
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.predictAddDays').d('预测付款账期天数'),
        type: FieldType.number,
        min: 0,
        step: 1,
        precision: 0,
        dynamicProps: {
          disabled: ({ record }) => record?.get('fcDateRule') === 'NO_NEED_CALCULATE',
          required: ({ record }) => ['DYNAMIC_PAY_DATE', 'FIXED_PAY_DATE'].includes(record?.get('fcDateRule')),
        },
      },
      {
        name: 'fcAddMonth',
        type: FieldType.number,
        min: 0,
        step: 1,
        precision: 0,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.predictAddExtraMonth').d('预测付款附加月数'),
        dynamicProps: {
          disabled: ({ record }) => ['NO_NEED_CALCULATE', 'DYNAMIC_PAY_DATE'].includes(record?.get('fcDateRule')),
        },
      },
      {
        name: 'exDateRule',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectPayRulePlan').d('期望付款日期规则'),
        lookupCode: 'SBSM.EX_DATE_RULE',
        defaultValue: 'DYNAMIC_PAY_DATE',
        required: true,
        help: intl.get('sbsm.common.model.payTermsCtrl.expectPayRulePlanTips').d('适用于【资金计划编制池】功能中的「预制付款日期」计算规则。编制事务来源单据以配置的预制规则接入【资金计划编制池】匹配付款阶段时，会以匹配阶段中配置的「期望付款日期规则」作为「预制付款日期」的计算规则'),
      },
      {
        name: 'exBaseDateType',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectBaseDateFieldCode').d('期望付款基准日期'),
        lookupCode: 'SBSM.EX_BASE_DATE_TYPE',
        dynamicProps: {
          disabled: ({ record }) => record?.get('exDateRule') === 'NO_NEED_CALCULATE',
          required: ({ record }) => ['DYNAMIC_PAY_DATE', 'FIXED_PAY_DATE'].includes(record?.get('exDateRule')), // 期望付款日期规则等于动态付款日期
        },
      },
      {
        name: 'exDeadLine',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectDeadLineDate').d('期望付款基准日期截止日'),
        dynamicProps: {
          disabled: ({ record }) => ['NO_NEED_CALCULATE', 'DYNAMIC_PAY_DATE'].includes(record?.get('exDateRule')),
          required: ({ record }) => ['FIXED_PAY_DATE'].includes(record?.get('exDateRule')),
        },
        help: intl.get('sbsm.common.model.payTermsCtrl.expectDeadLineDateTips').d('适用于「固定付款日期-月结」计算规则场景：示例1:基准日期=接收事务日期，基准日期截止日=15，固定日=25，附加月数=1，账期天数=30;1.编制池编制来源单据行接收事务日期在当月15号前的，于（本月+附加月数1）月25日+付款账期天数，计算得到「预制付款日期」2.如果接收事务日期在15号之后，在「期望付款日期规则=固定基准日期-月结」中“月结”的设定下，则（本月+附加月数1+1）月25日+付款账期天数，计算得到「付款到期日期」'),
      },
      {
        name: 'exFixedDay',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectPayFixedDays').d('期望付款固定日'),
        dynamicProps: {
          disabled: ({ record }) => ['NO_NEED_CALCULATE', 'DYNAMIC_PAY_DATE'].includes(record?.get('exDateRule')),
          required: ({ record }) => ['FIXED_PAY_DATE'].includes(record?.get('exDateRule')),
        },
      },
      {
        name: 'exAccountPeriod',
        type: FieldType.number,
        min: 0,
        step: 1,
        precision: 0,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectAddExtraDays').d('期望付款账期天数'),
        dynamicProps: {
          disabled: ({ record }) => record?.get('exDateRule') === 'NO_NEED_CALCULATE',
          required: ({ record }) => ['DYNAMIC_PAY_DATE', 'FIXED_PAY_DATE'].includes(record?.get('exDateRule')),
        },
      },
      {
        name: 'exAddMonth',
        type: FieldType.number,
        min: 0,
        step: 1,
        precision: 0,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectAddExtraMonth').d('期望付款附加月数'),
        dynamicProps: {
          disabled: ({ record }) => ['NO_NEED_CALCULATE', 'DYNAMIC_PAY_DATE'].includes(record?.get('exDateRule')),
        },
      },
    ],
    transport: {
      destroy: () => {
        return {
          url: `/sbdm/v1/${organizationId}/term-lines/delete`,
          method: 'DELETE',
        };
      },
    },
  };
};

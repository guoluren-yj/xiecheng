/*
 * @Description: 付款条款管控详情页DataSet
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-09-16 10:20:44
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import { DataSet } from 'choerodon-ui/pro';
import { FieldType, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import type { SubmitType } from '../../utils/type';
import { RegEx, DetailCustomizeCode } from '../../utils/type';

const organizationId = getCurrentOrganizationId();
interface MyDataSetProps extends DataSetProps {
  validationCode?: string,
  validationTitle?: string,
};

const stageLineNumsOptionDs = ({ dataSet }, ruleType) => {
  const { termLineList } = dataSet.parent?.children || {};
  // 消息提醒规则和日期默认值规则适用阶段可选值，查询当前付款管控策略/付款计划中【付款条款结构化定义】中「是否计算阶段日期=是」，且「是否预付=结算单类型」定义的付款阶段描述
  // 金额默认值规则适用阶段可选值，查询当前付款管控策略/付款计划中【付款条款结构化定义】中「是否计算阶段金额=是」，且「是否预付=结算单类型」定义的付款阶段描述
  return new DataSet({
    paging: false,
    data: termLineList?.reduce((total, lineRecord) => {
      const {
        stageNum,
        prepayFlag,
        enableStageDateFlag,
        enableStageAmountFlag,
      } = lineRecord.get(['stageNum', 'prepayFlag', 'enableStageDateFlag', 'enableStageAmountFlag']);
      const enableStageFlag = ruleType === 'amount' ? enableStageAmountFlag : enableStageDateFlag;
      const concatedData = Number(enableStageFlag) === 1 && stageNum ? [{ tag: prepayFlag, value: stageNum, meaning: stageNum }] : [];
      return total.concat(concatedData);
    }, []),
  });
};

export const termHeaderDS = ({ termId, termNum, termHeaderId, createFlag, copyFlag, fetchReleasedFlag }): MyDataSetProps => {
  const customizeUnitCode = Object.values(DetailCustomizeCode).join();
  return {
    forceValidate: true,
    cacheSelection: false,
    autoCreate: createFlag,
    primaryKey: 'termHeaderId',
    validationCode: 'header',
    dataToJSON: DataToJSON.all,
    autoQuery: !createFlag && !copyFlag,
    validationTitle: intl.get(`smdm.payTermsCtrl.view.title.payTermBasicInfo`).d('付款条款基本信息'),
    fields: [
      {
        name: 'termNum',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.paymentTermCode').d('付款条款编码'),
        maxLength: 30,
        required: true,
        disabled: !createFlag && !copyFlag,
        pattern: RegEx.NOCHINESE,
        defaultValidationMessages: {
          patternMismatch: intl.get('smdm.payTermsCtrl.view.validation.noChinese').d('请输入字母、数字或字符'),
        },
      },
      {
        name: 'termName',
        type: FieldType.intl,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.paymentTermName').d('付款条款名称'),
        required: true,
        maxLength: 240,
        dynamicProps: {
          disabled: ({ record }) => record.get('sourceCode') !== 'SRM',
        },
      },
      {
        name: 'sourceCode',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.paymentTermSource').d('付款条款来源'),
        lookupCode: 'SPRP.TERM_SOURCE_CODE',
        defaultValue: 'SRM',
      },
      {
        name: 'versionNumber',
        type: FieldType.number,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.version').d('版本'),
      },
      {
        name: 'displayStatus',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.status').d('状态'),
        lookupCode: 'SPRP.TERM_HEADER_STATUS',
        defaultValue: 'UNPUBLISH',
      },
      {
        name: 'enableFlag',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.enableFlag').d('启用'),
        lookupCode: 'HPFM.FLAG',
        defaultValue: '1',
      },
      {
        name: 'defaultFlag',
        type: FieldType.boolean,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.defaultFlag').d('默认'),
        trueValue: 1,
        falseValue: 0,
        required: true,
        defaultValue: 0,
      },
      {
        name: 'prepayFlag',
        type: FieldType.boolean,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.prePayExistFlag').d('存在预付'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          // 【条款启用付款管控=是】禁用
          disabled: ({ record }) => Number(record.get('enableTermFlag')) !== 0,
        },
      },
      {
        name: 'stageFlag',
        type: FieldType.boolean,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.stageFlag').d('分期'),
        trueValue: 1,
        falseValue: 0,
        required: true,
        defaultValue: 0,
        dynamicProps: {
          // 【条款启用付款管控=是】禁用
          disabled: ({ record }) => Number(record.get('enableTermFlag')) !== 0,
        },
      },
      {
        name: 'accountPeriodType',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.payPeriodDaysType').d('付款账期天数类型'),
        lookupCode: 'SPRP.ACCOUNT_PERIOD_TYPE',
        defaultValue: 'NATURE_DAY',
        dynamicProps: {
          required: ({ dataSet }) => {
            // 付款条款结构化中存在任意一行【是否计算阶段日期=是】必输
            return dataSet?.children?.termLineList?.some(lineRecord => Number(lineRecord?.get('enableStageDateFlag')) === 1);
          },
        },
      },
      {
        name: 'priority',
        type: FieldType.number,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.priority').d('优先级'),
        min: 0,
        step: 1,
        precision: 0,
      },
      {
        name: 'termRemark',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.paymentTermRemark').d('付款条款备注'),
      },
      {
        name: 'enableTermFlag',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.controlMode').d('管控模式'),
        lookupCode: 'SPRP.TERM_CONTROL_MODE',
        defaultValue: '1',
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
        const partRequestConfig: any = fetchReleasedFlag
          ? {
            url: `${SRM_SSTA}/v1/${organizationId}/term-headers/query-term-header-all`,
            method: 'POST',
          } : {
            url: `${SRM_SSTA}/v1/${organizationId}/term-headers/detail`,
            method: 'GET',
          };
        return{
          ...partRequestConfig,
          params: { customizeUnitCode },
          data: {
            termId,
            termNum,
            termHeaderId,
          },
        };
      },
      submit: ({ dataSet, data, params }) => {
        const submitType: SubmitType = dataSet?.getState('submitType');
        const urlMap: Record<SubmitType, string> = {
          create: '',
          copy: '/copy',
          save: '/update',
          release: '/release',
        };
        const suffix = urlMap[submitType] || '';
        return {
          url: `${SRM_SSTA}/v1/${organizationId}/term-headers${suffix}`,
          method: submitType === 'release' ? 'PUT' : 'POST',
          data: data[0],
          params: {
            ...params,
            customizeUnitCode,
          },
        };
      },
    },
  };
};


export const termLineDS = ({ viewFlag }): MyDataSetProps => {
  return {
    autoQuery: false,
    paging: false,
    pageSize: 0,
    forceValidate: true,
    validationCode: 'line',
    primaryKey: 'termLineId',
    dataToJSON: DataToJSON.all,
    validationTitle: intl.get(`smdm.payTermsCtrl.view.title.payTermStructuration`).d('付款条款结构化定义'),
    record: {
      dynamicProps: {
        disabled: ({ dataSet }) => {
          if(!viewFlag) {
            const { sourceCode, enableTermFlag } = dataSet.parent?.current?.get(['sourceCode', 'enableTermFlag']);
            return sourceCode !== 'SRM' || Number(enableTermFlag) !== 1;
          }
        },
      },
    },
    fields: [
      {
        name: 'lineNum',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.orderNumber').d('序号'),
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.paymentStageCode').d('付款阶段编号'),
        maxLength: 30,
        required: true,
        pattern: RegEx.NOCHINESE,
        defaultValidationMessages: {
          patternMismatch: intl.get('smdm.payTermsCtrl.view.validation.noChinese').d('请输入字母、数字或字符'),
        },
      },
      {
        name: 'stageDesc',
        type: FieldType.intl,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.paymentStageDesc').d('付款阶段描述'),
        required: true,
        maxLength: 240,
      },
      {
        name: 'prepayFlag',
        type: FieldType.boolean,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.prePayFlag').d('预付'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'enableStageAmountFlag',
        type: FieldType.boolean,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.calcStageAmountFlag').d('计算阶段金额'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'amountMaintainCode',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.amountCalcFormula').d('金额计算公式'),
        lookupCode: 'SPRP.AMOUNT_MAINTIAN_CODE',
        defaultValue: 'COUNT_HUNDRED_PERCENT', // 比例-合计100%
        dynamicProps: {
          // 【是否计算阶段金额=是】时必输可编辑
          required: ({ record }) => Number(record.get('enableStageAmountFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableStageAmountFlag')) !== 1,
        },
      },
      {
        name: 'stagePercent',
        type: FieldType.number,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.stageProportion').d('阶段比例（%）'),
        min: 0,
        max: 100,
        dynamicProps: {
          // 【比例-合计100%、比例-阶段自定义】必输、可编辑
          required: ({ record }) => ['COUNT_HUNDRED_PERCENT', 'CUSTOMIZE_PERCENT'].includes((record.get('amountMaintainCode'))),
          disabled: ({ record }) => !['COUNT_HUNDRED_PERCENT', 'CUSTOMIZE_PERCENT'].includes((record.get('amountMaintainCode'))),
        },
      },
      {
        name: 'baseAmountFieldCode',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.benchReferAmount').d('基准参考金额'),
        lookupCode: 'SPRP.BASE_AMOUNT_FIELD',
        defaultValue: 'paymentAmount',
        dynamicProps: {
          // 【比例-合计100%、比例-阶段自定义】必输、【比例-阶段自定义】可编辑
          required: ({ record }) => ['COUNT_HUNDRED_PERCENT', 'CUSTOMIZE_PERCENT'].includes((record.get('amountMaintainCode'))),
          disabled: ({ record }) => !['CUSTOMIZE_PERCENT'].includes((record.get('amountMaintainCode'))),
        },
      },
      {
        name: 'grandFlag',
        type: FieldType.boolean,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.sumProportionFlag').d('累计比例'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          // 【金额计算公式=比例-阶段自定义】可编辑
          disabled: ({ record }) => record.get('amountMaintainCode') !== 'CUSTOMIZE_PERCENT',
        },
      },
      {
        name: 'stageAmount',
        type: FieldType.number,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.stageAmount').d('阶段金额'),
        min: 1,
        precision: 0,
        dynamicProps: {
          // 【金额计算公式=金额】必输可编辑
          required: ({ record }) => record.get('amountMaintainCode') === 'AMOUNT',
          disabled: ({ record }) => record.get('amountMaintainCode') !== 'AMOUNT',
        },
      },
      {
        name: 'enableStageDateFlag',
        type: FieldType.boolean,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.calcStageDateFlag').d('计算阶段日期'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'dateMaintainCode',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.dateCalcFormula').d('日期计算公式'),
        lookupCode: 'SPRP.DATE_MAINTAIN_CODE',
        required: true,
        defaultValue: 'DYNAMIC_BASE_DATE', // 动态基准日期
        dynamicProps: {
          // 是否计算阶段日期=是】时必输可编辑
          required: ({ record }) => Number(record.get('enableStageDateFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableStageDateFlag')) !== 1,
        },
      },
      {
        name: 'baseDateFieldCode',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.benchReferDate').d('基准参考日期'),
        lookupCode: 'SPRP.BASE_DATE_FIELD',
        dynamicProps: {
          // 【日期计算公式=动态基准日期、固定基准日期-月结】必输可编辑
          required: ({ record }) => ['DYNAMIC_BASE_DATE', 'FIXED_BASE_DATE'].includes(record.get('dateMaintainCode')),
          disabled: ({ record }) => !['DYNAMIC_BASE_DATE', 'FIXED_BASE_DATE'].includes(record.get('dateMaintainCode')),
        },
      },
      {
        name: 'deadLineDate',
        type: FieldType.number,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.benchReferDateDeadline').d('基准参考日期截止日'),
        dynamicProps: {
          // 【日期计算公式=固定基准日期-月结】必输可编辑
          required: ({ record }) => record.get('dateMaintainCode') === 'FIXED_BASE_DATE',
          disabled: ({ record }) => record.get('dateMaintainCode') !== 'FIXED_BASE_DATE',
        },
      },
      {
        name: 'fixedDate',
        type: FieldType.number,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.fixedBaseDay').d('固定基准日'),
        dynamicProps: {
          // 【日期计算公式=固定基准日期-月结】必输可编辑
          required: ({ record }) => record.get('dateMaintainCode') === 'FIXED_BASE_DATE',
          disabled: ({ record }) => record.get('dateMaintainCode') !== 'FIXED_BASE_DATE',
        },
      },
      {
        name: 'addMonth',
        type: FieldType.number,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.additionalMonths').d('附加月数'),
        min: 0,
        step: 1,
        precision: 0,
        dynamicProps: {
          // 【日期计算公式=固定基准日期-月结】可编辑
          disabled: ({ record }) => record.get('dateMaintainCode') !== 'FIXED_BASE_DATE',
        },
      },
      {
        name: 'accountPeriod',
        type: FieldType.number,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.paymentPeriodDays').d('付款账期天数'),
        min: 0,
        step: 1,
        precision: 0,
        dynamicProps: {
          // 【日期计算公式=动态基准日期、固定基准日期-月结】必输可编辑
          required: ({ record }) => ['DYNAMIC_BASE_DATE', 'FIXED_BASE_DATE'].includes(record.get('dateMaintainCode')),
          disabled: ({ record }) => !['DYNAMIC_BASE_DATE', 'FIXED_BASE_DATE'].includes(record.get('dateMaintainCode')),
        },
      },
    ],
    transport: {
      destroy: () => {
        return {
          url: `${SRM_SSTA}/v1/${organizationId}/term-lines/remove`,
          method: 'DELETE',
        };
      },
    },
  };
};

export const cuszLineDS = (): MyDataSetProps => {
  return {
    paging: false,
    pageSize: 0,
    autoQuery: false,
    selection: false,
    forceValidate: true,
    validationCode: 'cuszLine',
    primaryKey: 'termLineExpandId',
    dataToJSON: DataToJSON.all,
    validationTitle: intl.get(`smdm.payTermsCtrl.view.title.cuszExpandLine`).d('个性化扩展行'),
    fields: [],
  };
};

export const wholeAmountRuleDS = (): MyDataSetProps => {
  return {
    autoCreate: false,
    autoQuery: false,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    validationCode: 'wholeAmountRule',
    validationTitle: intl.get('smdm.payTermsCtrl.view.title.payPlanExeTotalAmountExcVerRule').d('付款计划已执行总额超额校验规则'),
    fields: [
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.enableFlag').d('启用'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'excessCheckLevel',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.verificationLevel').d('校验等级'),
        lookupCode: 'SPRP.CHECK_LEVEL',
        dynamicProps: {
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
        },
      },
      {
        name: 'tolControlType',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.toleranceControlType').d('允差控制类型'),
        lookupCode: 'SPRP.TOL_CONTROL_TYPE',
        dynamicProps: {
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
        },
      },
      {
        name: 'excessTolerance',
        type: FieldType.number,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.excessTolerance').d('超额允差'),
        min: 0,
        dynamicProps: {
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
          max: ({ record }) => record.get('tolControlType') === 'RATIO' ? 100 : undefined,
          precision: ({ record }) => record.get('tolControlType') === 'RATIO' ? 2 : undefined,
        },
      },
    ],
  };
};

export const messageRuleDS = (): MyDataSetProps => {
  return {
    paging: false,
    pageSize: 0,
    autoQuery: false,
    selection: false,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    primaryKey: 'messageRuleId',
    validationCode: 'messageRule',
    validationTitle: intl.get('smdm.payTermsCtrl.view.title.stageMsgRemindRule').d('阶段消息提醒规则'),
    fields: [
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.status').d('状态'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'settleType',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.stageType').d('阶段类型'),
        lookupCode: 'SPRP.STAGE_TYPE',
      },
      {
        name: 'messageCode',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.remindContent').d('提醒内容'),
        lookupCode: 'SPRP.TERM_MESSAGE_CODE',
        dynamicProps: {
          // 【是否启用等于是】必输可编辑
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
        },
      },
      {
        name: 'messageObject',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.msgSendObject').d('消息发送对象'),
        lookupCode: 'SPRP.TERM_MESSAGE_OBJECT',
        multiple: ',',
        dynamicProps: {
          // 【是否启用等于是】必输可编辑
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
        },
      },
      {
        name: 'messagePoint',
        type: FieldType.number,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.msgSendTime').d('消息发送时间'),
        dynamicProps: {
          // 【是否启用等于是】必输可编辑
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
        },
      },
      {
        name: 'frequency',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.msgRemindFrequency').d('消息提醒频率'),
        pattern: RegEx.FREQUENCY,
        dynamicProps: {
          // 【是否启用等于是】必输可编辑
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
        },
      },
      {
        name: 'stageLineNums',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.applicableStage').d('适用阶段'),
        multiple: ',',
        dynamicProps: {
          // 【是否启用等于是】必输可编辑
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
          options: optionsProps => stageLineNumsOptionDs(optionsProps, 'message'),
        },
      },
    ],
  };
};

export const dateRuleDS = (): MyDataSetProps => {
  return {
    paging: false,
    pageSize: 0,
    autoQuery: false,
    selection: false,
    forceValidate: true,
    primaryKey: 'dateRuleId',
    validationCode: 'dateRule',
    dataToJSON: DataToJSON.all,
    validationTitle: intl.get('smdm.payTermsCtrl.view.title.dateDefaultValidRule').d('日期默认值规则'),
    fields: [
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.status').d('状态'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'settleType',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.stageType').d('阶段类型'),
        lookupCode: 'SPRP.STAGE_TYPE',
      },
      {
        name: 'defaultRuleCode',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.defaultWriteRule').d('默认值写入规则'),
        lookupCode: 'SPRP.DATE_DEFAULT_RULE_CODE',
        dynamicProps: {
          // 【是否启用等于是】必输可编辑
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
        },
      },
      {
        name: 'stageLineNums',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.applicableStage').d('适用阶段'),
        multiple: ',',
        dynamicProps: {
          // 【是否启用等于是】必输可编辑
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
          options: optionsProps => stageLineNumsOptionDs(optionsProps, 'date'),
        },
      },
    ],
  };
};

export const amountRuleDS = (): MyDataSetProps => {
  return {
    paging: false,
    pageSize: 0,
    autoQuery: false,
    selection: false,
    forceValidate: true,
    primaryKey: 'amountRuleId',
    dataToJSON: DataToJSON.all,
    validationCode: 'amountRule',
    validationTitle: intl.get('smdm.payTermsCtrl.view.title.stageAmountExcVerRule').d('阶段金额超额校验规则'),
    fields: [
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.status').d('状态'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'settleType',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.stageType').d('阶段类型'),
        lookupCode: 'SPRP.STAGE_TYPE',
      },
      {
        name: 'defaultRuleCode',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.defaultWriteRule').d('默认值写入规则'),
        lookupCode: 'SPRP.AMOUNT_DEFAULT_RULE_CODE',
        dynamicProps: {
          // 【是否启用等于是】必输可编辑
          // required: ({ record }) => Number(record.get('enableFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
        },
      },
      {
        name: 'checkLevel',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.stageAmountExcessValidLevel').d('阶段金额超额校验等级'),
        lookupCode: 'SPRP.CHECK_LEVEL',
        dynamicProps: {
          // 【是否启用等于是】必输可编辑
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
        },
      },
      {
        name: 'checkPosition',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.checkTimePoint').d('校验时点'),
        lookupCode: 'SPRP.AMOUNT_CHECK_POSITION',
        dynamicProps: {
          // 【是否启用等于是】必输可编辑
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
        },
      },
      {
        name: 'stageLineNums',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.applicableStage').d('适用阶段'),
        multiple: ',',
        dynamicProps: {
          // 【是否启用等于是】必输可编辑
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
          options: optionsProps => stageLineNumsOptionDs(optionsProps, 'amount'),
        },
      },
    ],
  };
};

export const payDateValidRuleDS = (): MyDataSetProps => {
  return {
    paging: false,
    pageSize: 0,
    autoQuery: false,
    selection: false,
    forceValidate: true,
    primaryKey: 'dateValidRuleId',
    dataToJSON: DataToJSON.all,
    validationCode: 'dateValidRule',
    validationTitle: intl.get('smdm.payTermsCtrl.view.title.stagePayAmountVerRule').d('阶段付款日期校验规则'),
    fields: [
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.status').d('状态'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'settleType',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.stageType').d('阶段类型'),
        lookupCode: 'SPRP.STAGE_TYPE',
      },
      {
        name: 'validLevel',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.verificationLevel').d('校验等级'),
        lookupCode: 'SPRP.VALID_LEVEL',
        dynamicProps: {
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
        },
      },
      {
        name: 'validContext',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.verificationContent').d('校验内容'),
        lookupCode: 'SPRP.DATE_VALID_CONTEXT',
        dynamicProps: {
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
        },
      },
      {
        name: 'notCalcPreExpPayDateProcessMode',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.notCalcPreExpPayDateProcessMode').d('无法计算预计付款日期处理方式'),
        lookupCode: 'SPRP.NOT_CALC_PRE_EXP_PAY_DATE_PROCESS_MODE',
        dynamicProps: {
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
        },
      },
      {
        name: 'validPosition',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.checkTimePoint').d('校验时点'),
        lookupCode: 'SPRP.DATE_VALID_POSITION',
        dynamicProps: {
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
        },
      },
      {
        name: 'stageLineNums',
        type: FieldType.string,
        label: intl.get('smdm.payTermsCtrl.model.payTermsCtrl.applicableStage').d('适用阶段'),
        multiple: ',',
        dynamicProps: {
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
          options: optionsProps => stageLineNumsOptionDs(optionsProps, 'date'),
        },
      },
    ],
  };
};

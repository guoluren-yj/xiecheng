/*
 * @Description: 付款计划详情页DataSet
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-09-26 13:00:07
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import { DataSet } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { FieldType, DataToJSON, RecordStatus } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { amountFormatterOptions } from '../../../../utils/utils';
import { amountCodeEditLineStatus } from '../components/PlanLine';
import { DetailCustomizeCode, MyRecordStatus, PlanSourceCode, RegEx } from '../../utils/type';

interface MyDataSetProps extends DataSetProps {
  validationCode?: string,
  validationTitle?: string,
};

const organizationId = getCurrentOrganizationId();

const stageLineNumsOptionDs = ({ dataSet }, ruleType) => {
  const { planLineDTOS } = dataSet.parent?.children || {};
  // 消息提醒规则和日期默认值规则适用阶段可选值，查询当前付款管控策略/付款计划中【付款条款结构化定义】中「是否计算阶段日期=是」，且「是否预付=结算单类型」定义的付款阶段描述
  // 金额默认值规则适用阶段可选值，查询当前付款管控策略/付款计划中【付款条款结构化定义】中「是否计算阶段金额=是」，且「是否预付=结算单类型」定义的付款阶段描述
  return new DataSet({
    paging: false,
    data: planLineDTOS?.reduce((total, lineRecord) => {
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

export const planHeaderDS = (privateParams): MyDataSetProps => {
  // Boolean
  const { editFlag } = privateParams;
  const customizeUnitCode = Object.values(DetailCustomizeCode).join();
  return {
    autoQuery: false,
    dataToJSON: DataToJSON.all,
    forceValidate: true,
    validationCode: 'header',
    validationTitle: intl.get(`ssta.paymentPlan.view.title.basicInfo`).d('基本信息'),
    fields: [
      {
        name: 'planNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payApplyPlanNum').d('付款申请计划编号'),
      },
      {
        name: 'planDesc',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payApplyPlanDesc').d('付款申请计划说明'),
      },
      {
        name: 'versionNumber',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.version').d('版本'),
      },
      {
        name: 'planStatus',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.status').d('状态'),
        lookupCode: 'SPRP.PLAN_STATUS',
      },
      {
        name: 'realName',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.creater').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.createionDate').d('创建时间'),
      },
      {
        name: 'sourceCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paySourceType').d('付款来源类型'),
        lookupCode: 'SPRP.PLAN_SOURCE_CODE',
      },
      {
        name: 'sourceDisplayNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.sourceDocNo').d('来源单据编号'),
      },
      {
        name: 'termNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payTermNum').d('付款条款编码'),
      },
      {
        name: 'termVersionNumber',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payTermVersion').d('付款条款版本'),
      },
      {
        name: 'paymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payPlanTotalAmount').d('付款计划总额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'sourceAmount',
        type: FieldType.number,
        label: editFlag
          ? intl.get('ssta.paymentPlan.model.paymentPlan.sourceDocAmountAfterChange').d('变更后来源单据金额')
          : intl.get('ssta.paymentPlan.model.paymentPlan.sourceDocAmount').d('来源单据金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'paymentDiffAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentDiffAmount').d('付款总额差异'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'executedAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.execTotalAmount').d('已执行总额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'paymentBalance',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentBalance').d('付款余额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.currencyCode').d('币种'),
      },
      {
        name: 'companyNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.companyNum').d('公司编码'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.companyName').d('公司名称'),
      },
      {
        name: 'displaySupplierNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.supplierNum').d('供应商编码'),
      },
      {
        name: 'displaySupplierName',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.supplierName').d('供应商名称'),
      },
      {
        name: 'supplierNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.erpSupplierNum').d('ERP供应商编码'),
      },
      {
        name: 'supplierName',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.erpSupplierName').d('ERP供应商名称'),
      },
      {
        name: 'ouName',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.ouName').d('业务实体'),
      },
      {
        name: 'purchaseAgentName',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.purchaseAgentName').d('采购员'),
      },
      {
        name: 'prepayFlag',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.prePayExistFlag').d('存在预付'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'stageFlag',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.stageFlag').d('分期'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'accountPeriodType',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payPeriodDaysType').d('付款账期天数类型'),
        lookupCode: 'SPRP.ACCOUNT_PERIOD_TYPE',
        defaultValue: 'NATURE_DAY',
        dynamicProps: {
          required: ({ dataSet }) => {
            // 付款条款结构化中存在任意一行【是否计算阶段日期=是】必输
            return dataSet?.children?.planLineDTOS?.some(lineRecord => Number(lineRecord?.get('enableStageDateFlag')) === 1);
          },
        },
      },
      {
        name: 'enableTermFlag',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.controlMode').d('管控模式'),
        lookupCode: 'SPRP.TERM_CONTROL_MODE',
        defaultValue: '1',
        required: true,
      },
    ],
    queryParameter: {
      ...privateParams,
      editFlag: Number(editFlag),
      customizeUnitCode,
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SSTA}/v1/${organizationId}/plan-headers/detail`,
          method: 'GET',
        };
      },
      submit: ({ data, params, dataSet }) => {
        const JSONData = data[0] || {};
        const { sourceCode } = JSONData;
        // 订单付款计划行的数据需要自定义处理，协议不能新增删除
        if (sourceCode !== PlanSourceCode.spcm) {
          const { planLineDTOS: planLineDs } = dataSet?.children || {};
          // 1、行号由前端来重新赋值，所以需要全量保存
          // 2、行状态交由后端来判断整合，前后端约定状态值，后端仅删除fontStatus为delete的数据，其他全量更新
          const planLineDTOS = planLineDs.records.map((planLineRecord) => {
            const { status, index } = planLineRecord;
            return {
              ...planLineRecord.toJSONData(),
              // 可判断lineNum和index是否一致来判断是否修改fontStatus为update，由于全量更新，此处不做处理
              lineNum: Number(index) + 1,
              frontStatus: MyRecordStatus[status],
            };
          }, []);
          Object.assign(JSONData, { planLineDTOS });
        }
        const submitType = dataSet?.getState('submitType');
        const urlMap: Record<string, string> = {
          'update': `${SRM_SSTA}/v1/${organizationId}/plan-headers/save-draft`,
          'change': `${SRM_SSTA}/v1/${organizationId}/plan-headers/plan-control-rule-change`,
        };
        return {
          url: urlMap[submitType],
          method: 'POST',
          data: JSONData,
          params: { ...params, customizeUnitCode },
        };
      },
    },
    feedback: {
      submitSuccess: () => { },
    },
  };
};

export const planLineDS = ({ editFlag }): MyDataSetProps => {
  return {
    autoQuery: false,
    paging: false,
    pageSize: 0,
    forceValidate: true,
    validationCode: 'line',
    dataToJSON: DataToJSON.all,
    validationTitle: intl.get(`ssta.paymentPlan.view.title.paymentStageInfo`).d('付款阶段信息'),
    fields: [
      {
        name: 'lineNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.orderNum').d('序号'),
      },
      {
        name: 'lineStatus',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.stageStatus').d('阶段状态'),
        lookupCode: 'SPRP.PLAN_STATUS',
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payStageNum').d('付款阶段编号'),
        maxLength: 30,
        required: true,
        pattern: RegEx.NOCHINESE,
        defaultValidationMessages: {
          patternMismatch: intl.get('ssta.paymentPlan.view.validation.noChinese').d('请输入字母、数字或字符'),
        },
      },
      {
        name: 'stageDesc',
        type: FieldType.intl,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payStageDesc').d('付款阶段描述'),
        required: true,
        maxLength: 240,
      },
      {
        name: 'prepayFlag',
        type: FieldType.boolean,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.prePayFlag').d('预付'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'enableStageAmountFlag',
        type: FieldType.boolean,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.calcStageAmountFlag').d('计算阶段金额'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'amountMaintainCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.amountCalcFormula').d('金额计算公式'),
        lookupCode: 'SPRP.AMOUNT_MAINTIAN_CODE',
        dynamicProps: {
          // 【是否计算阶段金额=是】时必输可编辑
          required: ({ record }) => Number(record.get('enableStageAmountFlag')) === 1,
          disabled: ({ record, dataSet }) => {
            // 执行金额不等于0时金额计算公式不允许编辑
            const executedAmount = dataSet.parent?.current?.get('executedAmount');
            return !math.isZero(executedAmount) || Number(record.get('enableStageAmountFlag')) !== 1;
          },
          defaultValue: ({ dataSet }) => {
            const executedAmount = dataSet.parent?.current?.get('executedAmount');
            // 默认为比例-合计100%，当可执行金额不等于0时为金额
            return !math.isZero(executedAmount) ? 'AMOUNT' : 'COUNT_HUNDRED_PERCENT';
          },
        },
      },
      {
        name: 'adjustAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.adjustedPlanStageAmount').d('调整后计划阶段金额'),
        dynamicProps: {
          formatterOptions: amountFormatterOptions,
          precision: ({ record }) => record.get('amountPrecision'),
          // 变更付款计划场景下不显示该字段，无需必输
          required: ({ record }) => editFlag && ['AMOUNT'].includes((record.get('amountMaintainCode'))) && !amountCodeEditLineStatus.includes(record.get('lineStatus')),
          disabled: ({ record }) => !(editFlag && ['AMOUNT'].includes((record.get('amountMaintainCode')))),
        },
      },
      {
        name: 'originStagePercent',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.initStagePercent').d('初始阶段比例（%）'),
      },
      {
        name: 'originStageAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.initPlanStageAmount').d('初始计划阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'stageAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.planStageAmount').d('计划阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'stagePercent',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.stagePercent').d('阶段比例（%）'),
        min: 0,
        max: 100,
        dynamicProps: {
          // 【比例-合计100%、比例-阶段自定义】必输、可编辑
          required: ({ record }) => ['COUNT_HUNDRED_PERCENT', 'CUSTOMIZE_PERCENT'].includes((record.get('amountMaintainCode'))) && !amountCodeEditLineStatus.includes(record.get('lineStatus')),
          disabled: ({ record }) => !['COUNT_HUNDRED_PERCENT', 'CUSTOMIZE_PERCENT'].includes((record.get('amountMaintainCode'))),
        },
      },
      {
        name: 'baseAmountFieldCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.benchReferAmount').d('基准参考金额'),
        lookupCode: 'SPRP.BASE_AMOUNT_FIELD',
        defaultValue: 'paymentAmount',
        dynamicProps: {
          // 【比例-合计100%、比例-阶段自定义】必输、【比例-阶段自定义】可编辑
          // required: ({ record }) => ['COUNT_HUNDRED_PERCENT', 'CUSTOMIZE_PERCENT'].includes((record.get('amountMaintainCode'))) && !amountCodeEditLineStatus.includes(record.get('lineStatus')),
          disabled: ({ record }) => !['CUSTOMIZE_PERCENT'].includes((record.get('amountMaintainCode'))),
        },
      },
      {
        name: 'stageBalance',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.stageBalanceAmount').d('剩余阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'executedStageAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.execStageAmount').d('已执行阶段金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'enableStageDateFlag',
        type: FieldType.boolean,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.calcStageDateFlag').d('计算阶段日期'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'dateMaintainCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.dateCalcFormula').d('日期计算公式'),
        lookupCode: 'SPRP.DATE_MAINTAIN_CODE',
        required: true,
        defaultValue: 'DYNAMIC_BASE_DATE', // 动态基准日期
        dynamicProps: {
          // 是否计算阶段日期=是】时必输可编辑
          required: ({ record }) => {
            const spcmFlag = record.parent?.current?.get('sourceCode') === PlanSourceCode.spcm;
            return Number(record.get('enableStageDateFlag')) === 1 && !amountCodeEditLineStatus.includes(record.get('lineStatus')) && !spcmFlag;
          },
          disabled: ({ record }) => {
            const spcmFlag = record.parent?.current?.get('sourceCode') === PlanSourceCode.spcm;
            return Number(record.get('enableStageDateFlag')) !== 1 || spcmFlag;
          },
        },
      },
      {
        name: 'baseDateFieldCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.benchReferDate').d('基准参考日期'),
        lookupCode: 'SPRP.BASE_DATE_FIELD',
        dynamicProps: {
          // 【日期计算公式=动态基准日期、固定基准日期-月结】必输可编辑
          required: ({ record }) => ['DYNAMIC_BASE_DATE', 'FIXED_BASE_DATE'].includes(record.get('dateMaintainCode')) && !amountCodeEditLineStatus.includes(record.get('lineStatus')),
          disabled: ({ record }) => !['DYNAMIC_BASE_DATE', 'FIXED_BASE_DATE'].includes(record.get('dateMaintainCode')),
        },
      },
      {
        name: 'deadLineDate',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.benchReferDateDeadline').d('基准参考日期截止日'),
        dynamicProps: {
          // 【日期计算公式=固定基准日期-月结】必输可编辑
          required: ({ record }) => record.get('dateMaintainCode') === 'FIXED_BASE_DATE' && !amountCodeEditLineStatus.includes(record.get('lineStatus')),
          disabled: ({ record }) => record.get('dateMaintainCode') !== 'FIXED_BASE_DATE',
        },
      },
      {
        name: 'fixedDate',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.fixedBaseDay').d('固定基准日'),
        dynamicProps: {
          // 【日期计算公式=固定基准日期-月结】必输可编辑
          required: ({ record }) => record.get('dateMaintainCode') === 'FIXED_BASE_DATE' && !amountCodeEditLineStatus.includes(record.get('lineStatus')),
          disabled: ({ record }) => record.get('dateMaintainCode') !== 'FIXED_BASE_DATE',
        },
      },
      {
        name: 'addMonth',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.additionalMonths').d('附加月数'),
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
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentPeriodDays').d('付款账期天数'),
        min: 0,
        step: 1,
        precision: 0,
        dynamicProps: {
          // 【日期计算公式=动态基准日期、固定基准日期-月结】必输可编辑
          required: ({ record }) => ['DYNAMIC_BASE_DATE', 'FIXED_BASE_DATE'].includes(record.get('dateMaintainCode')) && !amountCodeEditLineStatus.includes(record.get('lineStatus')),
          disabled: ({ record }) => !['DYNAMIC_BASE_DATE', 'FIXED_BASE_DATE'].includes(record.get('dateMaintainCode')),
        },
      },
      {
        name: 'baseDate',
        type: FieldType.date,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.planPayBaseDate').d('计划付款基准日期'),
      },
      {
        name: 'stagePaymentDate',
        type: FieldType.date,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentStageDate').d('付款阶段日期'),
        dynamicProps: {
          required: ({ record }) => record.get('dateMaintainCode') === 'BASE_DATE',
        },
      },
      {
        name: 'operation',
        label: intl.get('ssta.paymentPlan.model.paymentPlan.operation').d('操作'),
      },
      {
        name: 'termNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payTermNum').d('付款条款编码'),
      },
      {
        name: 'termName',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payTermDesc').d('付款条款描述'),
      },
      {
        name: 'termVersionNumber',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payTermVersion').d('付款条款版本'),
      },
      {
        name: 'planPrepayFlag',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.existsPrepayFlag').d('存在预付'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'planStageFlag',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.stageFlag').d('分期'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'sourceCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.sourceDocType').d('来源单据类型'),
        lookupCode: 'SPRP.PLAN_SOURCE_CODE',
      },
      {
        name: 'sourceDisplayNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.sourceDocNo').d('来源单据编号'),
      },
      {
        name: 'paymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.sourceDocAmount').d('来源单据金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'grandFlag',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.sumPercentFlag').d('累计比例'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'sourceNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.sourceDocNo').d('来源单据编号'),
      },
      {
        name: 'accountPeriodType',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payPeriodDaysType').d('付款账期天数类型'),
        lookupCode: 'SPRP.ACCOUNT_PERIOD_TYPE',
      },
    ],
    record: {
      dynamicProps: {
        selectable: (record) => record.status !== RecordStatus.delete,
        disabled: ({ dataSet }) => {
          const sourceCode = dataSet?.parent?.current?.get('sourceCode');
          const spcmFlag = sourceCode === PlanSourceCode.spcm;
          return editFlag && (spcmFlag || Number(dataSet.parent?.current?.get('enableTermFlag')) === 2);
        },
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
    primaryKey: 'planLineExpandId',
    dataToJSON: DataToJSON.all,
    validationTitle: intl.get(`ssta.paymentPlan.view.title.cuszExpandLine`).d('个性化扩展行'),
    fields: [],
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
    validationTitle: intl.get('ssta.paymentPlan.view.title.stageMsgRemindRule').d('阶段消息提醒规则'),
    fields: [
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.status').d('状态'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'settleType',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.stageType').d('阶段类型'),
        lookupCode: 'SPRP.STAGE_TYPE',
      },
      {
        name: 'messageCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.remindContent').d('提醒内容'),
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
        label: intl.get('ssta.paymentPlan.model.paymentPlan.msgSendObject').d('消息发送对象'),
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
        label: intl.get('ssta.paymentPlan.model.paymentPlan.msgSendTime').d('消息发送时间'),
        dynamicProps: {
          // 【是否启用等于是】必输可编辑
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
        },
      },
      {
        name: 'frequency',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.msgRemindFrequency').d('消息提醒频率'),
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
        label: intl.get('ssta.paymentPlan.model.paymentPlan.applicableStage').d('适用阶段'),
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
    dataToJSON: DataToJSON.all,
    primaryKey: 'dateRuleId',
    validationCode: 'dateRule',
    validationTitle: intl.get('ssta.paymentPlan.view.title.dateDefaultValidRule').d('日期默认值规则'),
    fields: [
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.status').d('状态'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'settleType',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.stageType').d('阶段类型'),
        lookupCode: 'SPRP.STAGE_TYPE',
      },
      {
        name: 'defaultRuleCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.defaultWriteRule').d('默认值写入规则'),
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
        label: intl.get('ssta.paymentPlan.model.paymentPlan.applicableStage').d('适用阶段'),
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
    dataToJSON: DataToJSON.all,
    primaryKey: 'amountRuleId',
    validationCode: 'amountRule',
    validationTitle: intl.get('ssta.paymentPlan.view.title.stageAmountExcVerRule').d('阶段金额超额校验规则'),
    fields: [
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.status').d('状态'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'settleType',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.stageType').d('阶段类型'),
        lookupCode: 'SPRP.STAGE_TYPE',
      },
      {
        name: 'defaultRuleCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.defaultWriteRule').d('默认值写入规则'),
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
        label: intl.get('ssta.paymentPlan.model.paymentPlan.stageAmountExcessValidLevel').d('阶段金额超额校验等级'),
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
        label: intl.get('ssta.paymentPlan.model.paymentPlan.checkTimePoint').d('校验时点'),
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
        label: intl.get('ssta.paymentPlan.model.paymentPlan.applicableStage').d('适用阶段'),
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
    validationTitle: intl.get('ssta.paymentPlan.view.title.stagePayAmountVerRule').d('阶段付款日期校验规则'),
    fields: [
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.status').d('状态'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'settleType',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.stageType').d('阶段类型'),
        lookupCode: 'SPRP.STAGE_TYPE',
      },
      {
        name: 'validLevel',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.verificationLevel').d('校验等级'),
        lookupCode: 'SPRP.VALID_LEVEL',
        dynamicProps: {
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
        },
      },
      {
        name: 'validContext',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.verificationContent').d('校验内容'),
        lookupCode: 'SPRP.DATE_VALID_CONTEXT',
        dynamicProps: {
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
        },
      },
      {
        name: 'notCalcPreExpPayDateProcessMode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.notCalcPreExpPayDateProcessMode').d('无法计算预计付款日期处理方式'),
        lookupCode: 'SPRP.NOT_CALC_PRE_EXP_PAY_DATE_PROCESS_MODE',
        dynamicProps: {
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
        },
      },
      {
        name: 'validPosition',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.checkTimePoint').d('校验时点'),
        lookupCode: 'SPRP.DATE_VALID_POSITION',
        dynamicProps: {
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
        },
      },
      {
        name: 'stageLineNums',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.applicableStage').d('适用阶段'),
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

export const wholeAmountRuleDS = (): MyDataSetProps => {
  return {
    autoCreate: false,
    autoQuery: false,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    validationCode: 'wholeAmountRule',
    validationTitle: intl.get('ssta.paymentPlan.view.title.payPlanExeTotalAmountExcVerRule').d('付款计划已执行总额超额校验规则'),
    fields: [
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.enableFlag').d('启用'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'excessCheckLevel',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.verificationLevel').d('校验等级'),
        lookupCode: 'SPRP.CHECK_LEVEL',
        dynamicProps: {
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
        },
      },
      {
        name: 'tolControlType',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.toleranceControlType').d('允差控制类型'),
        lookupCode: 'SPRP.TOL_CONTROL_TYPE',
        dynamicProps: {
          disabled: ({ record }) => Number(record.get('enableFlag')) !== 1,
          required: ({ record }) => Number(record.get('enableFlag')) === 1,
        },
      },
      {
        name: 'excessTolerance',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.excessTolerance').d('超额允差'),
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


export const stageOccupyRecordDS = (planLineId): DataSetProps => {
  return {
    pageSize: 20,
    autoQuery: true,
    selection: false,
    fields: [
      {
        name: 'paymentAction',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentAction').d('付款动作'),
        lookupCode: 'SPRP.PLAN_PAYMENT_ACTION',
      },
      {
        name: 'settleType',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.executeDocType').d('执行单据类型'),
        lookupCode: 'SPRP.STAGE_TYPE',
      },
      {
        name: 'settleNumAndLine',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.executeDocNumAndLineNum').d('执行单据编号-行号'),
      },
      {
        name: 'executeAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentAmount').d('付款金额'),
      },
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.executeDate').d('执行时间'),
      },
      {
        name: 'realName',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.operator').d('操作人'),
      },
      {
        name: 'planVersionNumber',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payPlanVersion').d('付款计划版本'),
      },
    ],
    queryParameter: { planLineId },
    transport: {
      read: () => {
        return {
          url: `${SRM_SSTA}/v1/${organizationId}/plan-line-occupy-records/list`,
          method: 'GET',
        };
      },
    },
  };
};

export const amountRuleRecordDS = (planLineId): DataSetProps => {
  return {
    pageSize: 20,
    autoQuery: true,
    selection: false,
    fields: [
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.executeDate').d('执行时间'),
      },
      {
        name: 'executeAction',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.executeAction').d('执行动作'),
        lookupCode: 'SPRP.AMOUNT_EXECUTE_ACTION',
      },
      {
        name: 'validationResult',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.validationResult').d('校验结果'),
      },
      {
        name: 'settleNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.executeDocNum').d('执行单据编号'),
      },
      {
        name: 'userName',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.operator').d('操作人'),
      },
      {
        name: 'planAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.planStageAmount').d('计划阶段金额'),
      },
      {
        name: 'executedAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.execStageAmount').d('已执行阶段金额'),
      },
      {
        name: 'remainingAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.stageBalanceAmount').d('剩余阶段金额'),
      },
      {
        name: 'amountSourceCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.amountSourceDocType').d('金额来源单据类型'),
        lookupCode: 'SPRP.PLAN_SOURCE_CODE',
      },
      {
        name: 'sourceNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.amountSourceDocNum').d('金额来源单据编号'),
      },
      {
        name: 'sourceAmount',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.sourceDocAmount').d('来源单据金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'amountMaintainCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.amountClacFormula').d('金额计算公式'),
        lookupCode: 'SPRP.AMOUNT_MAINTIAN_CODE',
      },
      {
        name: 'baseAmountFieldCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.benchReferAmount').d('基准参考金额'),
        lookupCode: 'SPRP.BASE_AMOUNT_FIELD',
      },
      {
        name: 'stagePercent',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.stagePercent').d('阶段比例（%）'),
      },
      {
        name: 'planVersionNumber',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payPlanVersion').d('付款计划版本'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SSTA}/v1/${organizationId}/plan-amount-execute-records/${planLineId}`,
          method: 'GET',
        };
      },
    },
  };
};

export const dateRuleRecordDS = (planLineId): DataSetProps => {
  return {
    pageSize: 20,
    autoQuery: true,
    selection: false,
    fields: [
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.executeDate').d('执行时间'),
      },
      {
        name: 'executeAction',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.executeAction').d('执行动作'),
        lookupCode: 'SPRP.DATE_EXECUTE_ACTION',
      },
      {
        name: 'settleNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.executeDocNum').d('执行单据编号'),
      },
      {
        name: 'baseDate',
        type: FieldType.date,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.planPayBaseDate').d('计划付款基准日期'),
      },
      {
        name: 'planPayDueDate',
        type: FieldType.date,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.planPayDueDate').d('计划付款到期日期'),
      },
      {
        name: 'sourceCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.dateSourceDocType').d('日期来源单据类型'),
        lookupCode: 'SPRP.DATE_SOURCE_TYPE',
      },
      {
        name: 'sourceNum',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.dateSourceDocNum').d('日期来源单据编号'),
      },
      {
        name: 'dateMaintainCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.dateClacFormula').d('日期计算公式'),
        lookupCode: 'SPRP.DATE_MAINTIAN_CODE',
      },
      {
        name: 'baseDateFieldCode',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.benchReferAmount').d('基准参考日期'),
        lookupCode: 'SPRP.BASE_DATE_FIELD',
      },
      {
        name: 'deadLineDate',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.benchReferDateDeadline').d('基准参考日期截止日'),
      },
      {
        name: 'fixedDate',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.fixedBaseDay').d('固定基准日'),
      },
      {
        name: 'addMonth',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.additionalMonths').d('附加月数'),
      },
      {
        name: 'accountPeriod',
        type: FieldType.number,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.paymentPeriodDays').d('付款账期天数'),
      },
      {
        name: 'planVersionNumber',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payPlanVersion').d('付款计划版本'),
      },
      {
        name: 'accountPeriodType',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.payPeriodDaysType').d('付款账期天数类型'),
        lookupCode: 'SPRP.ACCOUNT_PERIOD_TYPE',
      },
      {
        name: 'prepayFlag',
        type: FieldType.string,
        label: intl.get('ssta.paymentPlan.model.paymentPlan.prepayFlag').d('预付'),
        lookupCode: 'HPFM.FLAG',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SSTA}/v1/${organizationId}/plan-date-execute-records/${planLineId}`,
          method: 'GET',
        };
      },
    },
  };
};


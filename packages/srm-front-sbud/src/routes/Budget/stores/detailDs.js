import moment from 'moment';
import intl from 'utils/intl';
import { isFunction, isEmpty } from 'lodash';
// import { c7nAmountFormatterOptions } from '@/routes/utils';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';
import { queryBatchSimpleApprovalHistory, queryBatchApprovaFlag } from '_utils/utils';
import { c7nAmountFormatterOptions, getBatchOperationFlag } from '@/routes/utils';
const prefix = `/sbdm/v1`;

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
const tenantId = getCurrentOrganizationId();

const HeaderDs = ({ budgetHeaderId, setCuxHeaderFields }) => {
  const fields = [
    {
      name: 'budgetNum',
      type: 'string',
      pattern: /^[a-zA-Z0-9/\-_.]*$/,
      dynamicProps: {
        disabled: () => !!budgetHeaderId,
      },
      label: intl.get(`${commonPrompt}.budgetNum`).d('预算编码'),
    },
    {
      name: 'budgetHeaderDesc',
      type: 'string',
      required: true,
      dynamicProps: {
        disabled: ({ record }) =>
          !(['NEW', 'REJECT'].includes(record.get('budgetHeaderStatus')) || !budgetHeaderId),
      },
      label: intl.get(`${commonPrompt}.budgetDesc`).d('预算说明'),
    },
    {
      name: 'budgetHeaderStatusMeaning',
      type: 'string',
      disabled: true,
      label: intl.get(`${commonPrompt}.status`).d('状态'),
    },
    {
      name: 'budgetTemplateCode',
      type: 'object',
      lovCode: 'SBDM.BUDGET_TEMPLATE',
      required: true,
      valueField: 'budgetTemplateCode',
      textField: 'budgetTemplateDesc',
      label: intl.get(`${commonPrompt}.budgetTemplate`).d('预算模板'),
      disabled: true,
      transformResponse(value, data) {
        if (value) {
          return {
            budgetTemplateCode: value,
            budgetTemplateId: data.budgetTemplateId,
            budgetTemplateDesc: data.budgetTemplateDesc,
          };
        } else {
          return null;
        }
      },
      transformRequest: value => value?.budgetTemplateCode,
    },
    {
      name: 'budgetTemplateDesc',
      bind: 'budgetTemplateCode.budgetTemplateDesc',
    },
    {
      name: 'budgetTemplateId',
      bind: 'budgetTemplateCode.budgetTemplateId',
    },
    {
      name: 'periodNum',
      type: 'object',
      valueField: 'periodNum',
      textField: 'periodNum',
      // required: true,
      lovCode: 'SBUD.BUGET_PERIOD',
      label: intl.get(`${commonPrompt}.periodNum`).d('预算周期'),
      transformRequest: value => (value ? value.periodNum : null),
      transformResponse: (value, record) => {
        const { periodNum = null, periodId } = record;
        if (periodNum) {
          return { periodNum, periodId };
        } else {
          return null;
        }
      },
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId,
          };
        },
        disabled: ({ record }) =>
          !(['NEW', 'REJECT'].includes(record.get('budgetHeaderStatus')) || !budgetHeaderId),
      },
    },
    {
      name: 'periodId',
      type: 'string',
      bind: 'periodNum.periodId',
    },
    {
      name: 'validityDate',
      type: 'dateTime',
      required: true,
      min: moment('1970-01-01'),
      label: intl.get(`${commonPrompt}.validityDate`).d('有效期'),
      range: ['startDate', 'endDate'],
      defaultValue: { start: '1984-11-22', end: new Date() },
      format: getDateTimeFormat(),
      transformRequest: value =>
        value && (value.startDate || value.endDate)
          ? {
            startDate: value.startDate,
            endDate: value.endDate,
          }
          : {},
      transformResponse: (value, record) => {
        const { startDate, endDate } = record;
        return { startDate, endDate };
      },
      validator: value => {
        if (value?.startDate || value?.endDate) {
          const label = intl.get(`${commonPrompt}.validityDate`).d('有效期');
          if (!value?.startDate || !value?.endDate) {
            return intl
              .get(`hzero.c7nProUI.ColorPicker.value_missing`, { label })
              .d(`请选择${label}`);
          }
        }
      },
      dynamicProps: {
        disabled: ({ record }) =>
          !(['NEW', 'REJECT'].includes(record.get('budgetHeaderStatus')) || !budgetHeaderId),
      },
    },
    {
      name: 'adjustPeriodNum',
      type: 'object',
      valueField: 'periodNum',
      textField: 'periodNum',
      lovCode: 'SBUD.BUGET_PERIOD',
      label: intl.get(`${commonPrompt}.adjustPeriodNum`).d('调整预算周期'),
      transformRequest: value => (value ? value.periodNum : null),
      transformResponse: (value, record) => {
        const { adjustPeriodNum: periodNum, adjustPeriodId: periodId } = record;
        if (periodNum) {
          return { periodNum, periodId };
        } else {
          return null;
        }
      },
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId,
          };
        },
        disabled: ({ record }) =>
          !['APPROVED', 'EDIT', 'EDIT_REJECT'].includes(record.get('budgetHeaderStatus')),
      },
    },
    {
      name: 'adjustPeriodId',
      type: 'string',
      bind: 'adjustPeriodNum.periodId',
    },
    {
      name: 'adjustValidityDate',
      type: 'dateTime',
      min: moment('1970-01-01'),
      label: intl.get(`${commonPrompt}.adjustValidityDate`).d('预算调整有效期'),
      range: ['adjustStartDate', 'adjustEndDate'],
      format: getDateTimeFormat(),
      transformRequest: value =>
        value && (value.adjustStartDate || value.adjustEndDate)
          ? {
            adjustStartDate: value.adjustStartDate,
            adjustEndDate: value.adjustEndDate,
          }
          : {},
      transformResponse: (value, record) => {
        const { adjustStartDate, adjustEndDate } = record;
        return { adjustStartDate, adjustEndDate };
      },
      validator: value => {
        if (value?.adjustStartDate || value?.adjustEndDate) {
          const label = intl.get(`${commonPrompt}.validityDate`).d('有效期');
          if (!value?.adjustStartDate || !value?.adjustEndDate) {
            return intl
              .get(`hzero.c7nProUI.ColorPicker.value_missing`, { label })
              .d(`请选择${label}`);
          }
        }
      },
      dynamicProps: {
        // required: ({ record }) =>
        //   ['APPROVED', 'EDIT', 'EDIT_REJECT'].includes(record.get('budgetHeaderStatus')),
        disabled: ({ record }) =>
          !['APPROVED', 'EDIT', 'EDIT_REJECT'].includes(record.get('budgetHeaderStatus')),
      },
    },
    {
      name: 'responsibleId',
      type: 'object',
      lovCode: 'SPCM.ACCEPT_USER',
      lovPara: { tenantId },
      transformResponse(value, data) {
        if (value) {
          return {
            userId: value,
            userName: data.responsibleName,
          };
        } else {
          return null;
        }
      },
      transformRequest: value => value?.userId,
      label: intl.get(`${commonPrompt}.responsibleName`).d('责任人'),
      dynamicProps: {
        disabled: ({ record }) =>
          !(['NEW', 'REJECT'].includes(record.get('budgetHeaderStatus')) || !budgetHeaderId),
      },
    },
    {
      name: 'responsibleName',
      type: 'string',
      bind: 'responsibleId.responsibleName',
      label: intl.get(`${commonPrompt}.responsibleName`).d('责任人'),
    },
    {
      name: 'approvedName',
      type: 'string',
      label: intl.get(`${commonPrompt}.approvedName`).d('审批人'),
    },
    {
      name: 'createdByName',
      disabled: true,
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
    },
    {
      name: 'version',
      disabled: true,
      label: intl.get(`${commonPrompt}.version`).d('版本'),
    },
    {
      name: 'creationDate',
      disabled: true,
      type: 'dateTime',
      label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
    },
  ];
  const cuxHeaderField = isFunction(setCuxHeaderFields)
    ? setCuxHeaderFields({ budgetHeaderId, fields })
    : fields;
  return {
    autoQuery: false,
    autoCreate: false,
    dataToJSON: 'all',
    selection: false,
    transport: {
      read: {
        url: `/sbdm/v1/${tenantId}/budget-header/detail/${budgetHeaderId}`,
        method: 'GET',
      },
    },
    events: {
      update: ({ name, record, value }) => {
        if (name === 'adjustPeriodNum' && value) {
          // if (
          //   !record.get('adjustValidityDate')?.adjustStartDate &&
          //   !record.get('adjustValidityDate')?.adjustEndDate
          // ) {
          record.set({
            adjustValidityDate: {
              adjustStartDate: value?.startDate,
              adjustEndDate: value?.endDate,
            },
          });
          // }
        }

        if (name === 'periodNum' && value) {
          // if (!record.get('validityDate')?.endDate && !record.get('validityDate')?.startDate) {
          record.set({
            validityDate: {
              startDate: value?.startDate,
              endDate: value?.endDate,
            },
          });
          // }
        }
      },
      load: async ({ dataSet }) => {
        const workFlowBussinessKeys = dataSet.reduce((acc, cur) => {
          const value = cur.get('businessKey');
          if (value) {
            acc.push(value);
          }
          return acc;
        }, []);
        if (!isEmpty(workFlowBussinessKeys)) {
          // 获取审批按钮显示状态
          const approvaFlags = await queryBatchApprovaFlag(workFlowBussinessKeys);
          // 获取撤销审批按钮状态
          const operationFlags = await getBatchOperationFlag(workFlowBussinessKeys);
          // 查询审批记录数据
          const simpleApprovalHistoryData = await queryBatchSimpleApprovalHistory(
            workFlowBussinessKeys
          );
          dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
        }
      },
    },
    fields: cuxHeaderField || fields,
  };
};

const ListDs = ({
  budgetHeaderId,
  budgetTemplateCode,
  selection = 'multiple',
  setCuxLineFields,
  setCuxLineChange,
  readOnly,
}) => {
  const fields = [
    {
      name: 'errorFlag',
      type: 'string',
      label: intl.get(`${commonPrompt}.validResult`).d('校验结果'),
    },
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.budgetLineNum`).d('预算行号'),
    },
    {
      name: 'budgetLineDesc',
      type: 'string',
      required: true,
      label: intl.get(`${commonPrompt}.budgetDesc`).d('预算说明'),
    },
    {
      name: 'budgetLineStatus',
      type: 'string',
      // lookupCode: 'SBDM.STRATEGY_STATUS',
      label: intl.get(`${commonPrompt}.status`).d('状态'),
    },
    {
      name: 'origBudgetAmount',
      required: true,
      type: 'number',
      validator: value => {
        if (value <= 0) {
          return intl
            .get(`${commonPrompt}.origBudgetAmount.notLessZero`)
            .d('预算总额不能小于等于0');
        } else {
          return true;
        }
      },
      label: intl.get(`${commonPrompt}.origBudgetAmount`).d('预算总额'),
      // dynamicProps: {
      //   formatterOptions: c7nAmountFormatterOptions(({ record }) =>
      //     record.get('financialPrecision')
      //   ),
      //   precision: ({ record }) => {
      //     if (
      //       !readOnly &&
      //       (['NEW', 'REJECT'].includes(record.get('budgetLineStatus')) ||
      //         record.status === 'add')
      //     ) {
      //       return record.get('financialPrecision');
      //     } else {
      //       return undefined;
      //     }
      //   },
      //   type: ({ record }) =>
      //     !readOnly &&
      //     (['NEW', 'REJECT'].includes(record.get('budgetLineStatus')) || record.status === 'add')
      //       ? 'number'
      //       : 'currency',
      // },
    },
    {
      name: 'occupiedAmount',
      type: 'number',
      label: intl.get(`${commonPrompt}.occupiedAmount`).d('已占用金额'),
      // dynamicProps: {
      //   formatterOptions: c7nAmountFormatterOptions(({ record }) =>
      //     record.get('financialPrecision')
      //   ),
      // },
    },
    {
      name: 'appliedAmount',
      type: 'number',
      label: intl.get(`${commonPrompt}.appliedAmount`).d('已核销金额'),
      // dynamicProps: {
      //   formatterOptions: c7nAmountFormatterOptions(({ record }) =>
      //     record.get('financialPrecision')
      //   ),
      // },
    },
    {
      name: 'budgetBalanceAmount',
      type: 'number',
      label: intl.get(`${commonPrompt}.budgetBalanceAmount`).d('预算余额'),
      // dynamicProps: {
      //   formatterOptions: c7nAmountFormatterOptions(({ record }) =>
      //     record.get('financialPrecision')
      //   ),
      // },
    },
    {
      name: 'currencyCode',
      type: 'object',
      valueField: 'currencyCode',
      textField: 'codeName',
      required: true,
      lovCode: 'SMDM.LEDGER.CURRENCY',
      label: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
      transformRequest: value => (value ? value.currencyCode : null),
      transformResponse: (value, record) => {
        const {
          currencyCode = null,
          currencyCodeMeaning = null,
          financialPrecision,
          defaultPrecision,
        } = record;
        if (currencyCode) {
          return {
            currencyCode,
            currencyName: currencyCodeMeaning,
            defaultPrecision,
            financialPrecision,
            codeName: currencyCode ? `${currencyCode}/${currencyCodeMeaning}` : null,
          };
        } else {
          return null;
        }
      },
      dynamicProps: {
        lovPara: () => ({
          tenantId: getCurrentOrganizationId(),
        }),
      },
    },
    {
      name: 'financialPrecision',
      bind: 'currencyCode.financialPrecision',
    },
    {
      name: 'defaultPrecision',
      bind: 'currencyCode.defaultPrecision',
    },
    {
      name: 'adjustAmount',
      type: 'number',
      label: intl.get(`${commonPrompt}.adjustAmount`).d('调整金额'),
      help: intl
        .get(`${commonPrompt}.adjustAmountHelp`)
        .d(
          '若您调增预算金额，它将会在该预算被审批后增加预算可用额度；而若您调减预算金额，它将会立即减少预算可用额度'
        ),
      // dynamicProps: {
      //   formatterOptions: c7nAmountFormatterOptions(({ record }) =>
      //     record.get('financialPrecision')
      //   ),
      //   precision: ({ record }) => {
      //     if (
      //       !readOnly &&
      //       ['APPROVED', 'EDIT', 'EDIT_REJECT'].includes(record.get('budgetLineStatus'))
      //     ) {
      //       return record.get('financialPrecision');
      //     } else {
      //       return undefined;
      //     }
      //   },
      //   type: ({ record }) =>
      //     !readOnly &&
      //     ['APPROVED', 'EDIT', 'EDIT_REJECT'].includes(record.get('budgetLineStatus'))
      //       ? 'number'
      //       : 'currency',
      // },
    },
    {
      name: 'adjustedAmount',
      type: 'number',
      label: intl.get(`${commonPrompt}.adjustedAmount`).d('调整后金额'),
      // dynamicProps: {
      //   formatterOptions: c7nAmountFormatterOptions(({ record }) =>
      //     record.get('financialPrecision')
      //   ),
      // },
    },
    {
      name: 'operation',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ];
  const cuxLineFields = isFunction(setCuxLineFields)
    ? setCuxLineFields({ budgetHeaderId, fields, readOnly })
    : fields;
  return {
    autoQuery: false,
    autoCreate: false,
    cacheSelection: true,
    cacheModified: true,
    selection,
    dataToJSON: 'all',
    primaryKey: 'budgetLineId',
    pageSize: 20,
    transport: {
      read: ({ data = {} }) => {
        const { creationDate = {}, validityDate = {}, ...other } = data;
        return {
          url: `${prefix}/${tenantId}/budget-line/detail?budgetHeaderId=${budgetHeaderId}&budgetTemplateCode=${budgetTemplateCode}`,
          method: 'GET',
          data: { ...other, ...creationDate, ...validityDate },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${prefix}/${tenantId}/budget-line`,
          method: 'DELETE',
          data,
        };
      },
    },
    fields: cuxLineFields || [],
    queryFields: [
      {
        name: 'lineNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.budgetLineNum`).d('预算行号'),
      },
      {
        name: 'budgetLineStatus',
        type: 'string',
        lookupCode: 'SBDM.BUDGET_LINE_STATUS',
        label: intl.get(`${commonPrompt}.status`).d('状态'),
      },
      // {
      //   name: 'createdByName',
      //   label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
      // },
      // {
      //   name: 'creationDate',
      //   type: 'dateTime',
      //   range: ['creationDateFrom', 'creationDateTo'],
      //   format: getDateTimeFormat(),
      //   label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
      // },
      {
        name: 'isAbolished',
        type: 'string',
        lookupCode: 'HPFM.FLAG',
        label: intl.get(`${commonPrompt}.abolished`).d('是否显示已作废数据'),
      },
    ],
    events: {
      update: ({ name, record, value }) => {
        if (isFunction(setCuxLineChange)) {
          setCuxLineChange({ name, record, value });
        }
      },
    },
  };
};

export { HeaderDs, ListDs };

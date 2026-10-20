import intl from 'utils/intl';
// import { SRM_SRPM } from '_utils/config';
// import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { DataSet } from 'choerodon-ui/pro';
// const organizationId = getCurrentOrganizationId();
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const baseInfoDS = ({ isMutlTemplate }) => ({
  paging: false,
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  autoLocateFirst: true,
  events: {
    update: ({ name, record, value }) => {
      if (name === 'budgetControlSelectBox') {
        if (value === 'internalBudgetFlag') {
          record.set({
            externalBudgetFlag: 0,
            internalBudgetFlag: 1,
            budgetStrategyCond: null,
          });
        } else {
          record.set({
            externalBudgetFlag: 1,
            internalBudgetFlag: 0,
            budgetStrategyCond: null,
          });
        }
      }
    },
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (record.get('internalBudgetFlag')) {
          record.init({
            budgetControlSelectBox: 'internalBudgetFlag',
          });
        } else {
          record.init({
            budgetControlSelectBox: 'externalBudgetFlag',
          });
        }
        if (record.get('budgetStrategyTemplateList')) {
          if (
            !record.get('budgetStrategyTemplateList').toJS()[0].budgetTemplateCode ||
            record.get('budgetStrategyTemplateList').toJS()[0].budgetTemplateCode === 'NONE'
          ) {
            record.init({
              newBudgetStrategyTemplateList: null,
            });
          } else {
            record.init({
              newBudgetStrategyTemplateList: record.get('budgetStrategyTemplateList').toJS(),
            });
          }
        }
      });
    },
  },
  fields: [
    {
      name: 'budgetStrategyCode',
      type: 'string',
      disabled: true,
      label: intl.get(`${commonPrompt}.budgetStrategyCode`).d('策略编码'),
    },
    {
      name: 'budgetStrategyDesc',
      required: true,
      type: 'intl',
      label: intl.get(`${commonPrompt}.budgetStrategyDesc`).d('策略名称'),
    },
    {
      name: 'enabledFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      // required: true,
      defaultValue: '1',
      // dynamicProps: {
      //   disabled: ({ record }) => {
      //     return record.get('strangeStatus') === 'NEW' || record.status === 'add';
      //   },
      // },
      label: intl.get(`${commonPrompt}.enabledFlag`).d('是否启用'),
    },
    {
      name: 'strangeStatus',
      type: 'string',
      disabled: true,
      lookupCode: 'SBDM.STRATEGY_STATUS',
      label: intl.get(`${commonPrompt}.status`).d('状态'),
    },
    {
      name: 'strangeStatusMeaning',
      disabled: true,
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'createdByName',
      disabled: true,
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
    },
    {
      name: 'creationDate',
      disabled: true,
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
      type: 'dateTime',
    },
    {
      name: 'version',
      disabled: true,
      label: intl.get(`${commonPrompt}.version`).d('版本'),
    },
    {
      name: 'updateDate',
      disabled: true,
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get(`${commonPrompt}.updateDate`).d('更新时间'),
      type: 'dateTime',
    },
    {
      name: 'internalBudgetFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`${commonPrompt}.internalBudgetFlag`).d('启用内部预算控制'),
    },
    {
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      name: 'externalBudgetFlag',
      label: intl.get(`${commonPrompt}.externalBudgetFlag`).d('启用外部预算控制'),
    },
    {
      type: 'string',
      name: 'budgetControlSelectBox',
      defaultValue: 'internalBudgetFlag',
      label: intl.get(`${commonPrompt}.budgetControl`).d('预算控制'),
    },
    {
      name: 'newBudgetStrategyTemplateList',
      type: 'object',
      multiple: true,
      lovCode: 'SBDM.BUDGET_TEMPLATE',
      label: intl.get(`${commonPrompt}.budgetTemplate`).d('预算模板'),
      dynamicProps: {
        required: ({ record }) => {
          return (
            String(record.get('internalBudgetFlag')) === '1' &&
            !(record.get('version') > 1) &&
            isMutlTemplate
          );
        },
        disabled: ({ record }) => {
          return record.get('version') > 1;
        },
      },
    },
    {
      name: 'amountField',
      // required: true,
      defaultValue: 'amount',
      label: intl.get(`${commonPrompt}.amountField`).d('金额取值字段'),
      lookupCode: 'SBDM.STRATEGY_NODE_AMOUNT_FIELD',
      help: intl
        .get(`${commonPrompt}.amountFieldHelp`)
        .d('用以维护预算校验及占用时取值的金额类型，可选含税金额或不含税金额，默认取值含税金额。'),
    },
    {
      name: 'targetCurrency',
      type: 'object',
      lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
      help: intl
        .get(`${commonPrompt}.targetCurrencyHelp`)
        .d(
          '用以维护预算币种，维护后，默认将业务模块传入的币种金额值转换成预算币种金额值，不维护则默认取值单据上的原币币种。'
        ),
      transformRequest: value => value?.currencyCode,
      transformResponse: (value, object) => {
        return object?.targetCurrency
          ? {
              currencyCode: object?.targetCurrency,
            }
          : null;
      },
      label: intl.get(`${commonPrompt}.budgetCurrency`).d('预算币种'),
    },
  ],
});

const controlRuleHeaderDs = ({}) => ({
  paging: false,
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  autoLocateFirst: true,
  events: {
    update: ({ name, record, value }) => {
      if (name === 'budgetControlSelectBox') {
        if (value === 'internalBudgetFlag') {
          record.set({
            externalBudgetFlag: 0,
            internalBudgetFlag: 1,
            budgetStrategyTemplateCond: null,
          });
        } else {
          record.set({
            externalBudgetFlag: 1,
            internalBudgetFlag: 0,
            budgetStrategyTemplateCond: null,
          });
        }
      }
    },
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (record.get('internalBudgetFlag')) {
          record.init({
            budgetControlSelectBox: 'internalBudgetFlag',
          });
        } else {
          record.init({
            budgetControlSelectBox: 'externalBudgetFlag',
          });
        }
      });
    },
  },
  fields: [
    {
      name: 'budgetStrategyCode',
      type: 'string',
      disabled: true,
      label: intl.get(`${commonPrompt}.budgetStrategyCode`).d('策略编码'),
    },
    {
      name: 'budgetStrategyDesc',
      // required: true,
      type: 'intl',
      label: intl.get(`${commonPrompt}.budgetStrategyDesc`).d('策略名称'),
    },
    {
      name: 'enabledFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      // required: true,
      defaultValue: '1',
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('strangeStatus') === 'NEW' || record.status === 'add';
        },
      },
      label: intl.get(`${commonPrompt}.enabledFlag`).d('是否启用'),
    },
    {
      name: 'strangeStatus',
      type: 'string',
      disabled: true,
      lookupCode: 'SBDM.STRATEGY_STATUS',
      label: intl.get(`${commonPrompt}.status`).d('状态'),
    },
    {
      name: 'strangeStatusMeaning',
      disabled: true,
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'createdByName',
      disabled: true,
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
    },
    {
      name: 'creationDate',
      disabled: true,
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
      type: 'dateTime',
    },
    {
      name: 'version',
      disabled: true,
      label: intl.get(`${commonPrompt}.version`).d('版本'),
    },
    {
      name: 'updateDate',
      disabled: true,
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get(`${commonPrompt}.updateDate`).d('更新时间'),
      type: 'dateTime',
    },
    {
      name: 'internalBudgetFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`${commonPrompt}.internalBudgetFlag`).d('启用内部预算控制'),
    },
    {
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      name: 'externalBudgetFlag',
      label: intl.get(`${commonPrompt}.externalBudgetFlag`).d('启用外部预算控制'),
    },
    {
      type: 'string',
      name: 'budgetControlSelectBox',
      defaultValue: 'internalBudgetFlag',
      label: intl.get(`${commonPrompt}.budgetControl`).d('预算控制'),
    },
    {
      name: 'amountField',
      required: true,
      defaultValue: 'amount',
      label: intl.get(`${commonPrompt}.amountField`).d('金额取值字段'),
      lookupCode: 'SBDM.STRATEGY_NODE_AMOUNT_FIELD',
      help: intl
        .get(`${commonPrompt}.amountFieldHelp`)
        .d('用以维护预算校验及占用时取值的金额类型，可选含税金额或不含税金额，默认取值含税金额。'),
    },
    {
      name: 'targetCurrency',
      type: 'object',
      lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
      help: intl
        .get(`${commonPrompt}.targetCurrencyHelp`)
        .d(
          '用以维护预算币种，维护后，默认将业务模块传入的币种金额值转换成预算币种金额值，不维护则默认取值单据上的原币币种。'
        ),
      transformRequest: value => value?.currencyCode,
      transformResponse: (value, object) => {
        return object?.targetCurrency
          ? {
              currencyCode: object?.targetCurrency,
            }
          : null;
      },
      label: intl.get(`${commonPrompt}.budgetCurrency`).d('预算币种'),
    },
  ],
});

const controlRuleLineDS = ({ headerDs }) => ({
  autoQuery: false,
  autoLocateFirst: false,
  selection: false,
  dataToJSON: 'all',
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'strategyNodeCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.nodeCode`).d('节点编码'),
    },
    {
      name: 'strategyNodeName',
      type: 'string',
      // help: intl
      //   .get(`${commonPrompt}.strategyNodeNameHelp`)
      //   .d(
      //     '上游单据已占用预算的采购申请，提交不会触发再次占用；上游单据已占用预算的采购订单，提交可触发更新上游占用的预算金额；上游单据未占用预算的采购订单，提交会进行预算占用'
      //   ),
      label: intl.get(`${commonPrompt}.nodeName`).d('节点名称'),
    },
    {
      name: 'controlType',
      type: 'string',
      lookupCode: 'SBDM.STRATEGY_NODE_CONTROL_TYPE',
      required: true,
      label: intl.get(`${commonPrompt}.controlType`).d('预算控制类型'),
    },
    {
      name: 'overrunTolerance',
      type: 'number',
      defaultValue: 0,
      min: 0,
      dynamicProps: {
        required: ({ record }) => {
          return record.get('controlType') === 'STRONG_CONTROL';
        },
        disabled: ({ record }) => {
          return !(record.get('controlType') === 'STRONG_CONTROL');
        },
      },
      label: intl.get(`${commonPrompt}.overrunTolerance`).d('预算超量占用允差比例(%)'),
    },
    {
      name: 'balanceRemindFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get(`${commonPrompt}.balanceRemindFlag`).d('预算占用比例提醒'),
      dynamicProps: {
        disabled: ({ record }) => {
          return !(record.get('controlType') === 'STRONG_CONTROL');
        },
      },
    },
    {
      name: 'balanceRemindNode',
      type: 'number',
      min: 0,
      max: 100,
      label: intl.get(`${commonPrompt}.balanceRemindNode`).d('预算占用提醒开启比例(%)'),
      dynamicProps: {
        required: ({ record }) => {
          return record.get('balanceRemindFlag') === 1;
        },
        disabled: ({ record }) => {
          return !(record.get('controlType') === 'STRONG_CONTROL');
        },
      },
    },
    {
      name: 'cancelNode',
      type: 'string',
      lookupCode: 'SBDM.STRATEGY_CANCEL_NODE',
      label: intl.get(`${commonPrompt}.cancelNode`).d('子节点名称'),
      help: intl.get(`${commonPrompt}.cancelNodeHelp`).d('最后一个节点为核销节点'),
      dynamicProps: {
        // 当节点为物流收货时，必填，其他节点不可填，LOV取值平台预定义的三个收货节点，一旦发布后，即版本大于等于2时，此节点不可编辑。
        required: ({ record }) => {
          return record.get('strategyNodeCode') === 'ASN';
        },
        disabled: ({ record }) => {
          return !(
            record.get('strategyNodeCode') === 'ASN' && !(headerDs.current?.get('version') > 1)
          );
        },
      },
    },
    // {
    //   name: 'amountField',
    //   required: true,
    //   defaultValue: 'amount',
    //   label: intl.get(`${commonPrompt}.amountField`).d('金额取值字段'),
    //   lookupCode: 'SBDM.STRATEGY_NODE_AMOUNT_FIELD',
    //   help: intl
    //     .get(`${commonPrompt}.amountFieldHelp`)
    //     .d('用以维护预算校验及占用使用含税/不含税金额，默认取值含税金额。'),
    // },
    // {
    //   name: 'targetCurrency',
    //   type: 'object',
    //   lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
    //   help: intl
    //     .get(`${commonPrompt}.targetCurrencyHelp`)
    //     .d(
    //       '用以维护预算校验的币种，维护后，默认将当前节点传递的币种金额值转换成目标币种金额值，不维护则默认取值单据上的原币币种。'
    //     ),
    //   transformRequest: (value) => value?.currencyCode,
    //   transformResponse: (value, object) => {
    //     return object?.targetCurrency
    //       ? {
    //           currencyCode: object?.targetCurrency,
    //         }
    //       : null;
    //   },
    //   label: intl.get(`${commonPrompt}.targetCurrency`).d('目标转换币种'),
    // },
    {
      name: 'dateField',
      help: intl
        .get(`${commonPrompt}.dateFieldHelp`)
        .d('用以维护预算占用/核销的时间字段，不维护默认取值操作时的系统时间。'),
      label: intl.get(`${commonPrompt}.dateField`).d('时间字段取值'),
    },
  ],
  events: {
    update: ({ name, record, dataSet, value }) => {
      if (name === 'controlType') {
        record.set({
          balanceRemindNode: 0,
          overrunTolerance: 0,
          balanceRemindFlag: 0,
        });
      }
      if (name === 'targetCurrency') {
        dataSet.forEach(items => {
          items.set({ targetCurrency: value });
        });
      }
      if (name === 'amountField') {
        dataSet.forEach(items => {
          items.set({ amountField: value });
        });
      }
    },
  },
});

export { controlRuleLineDS, baseInfoDS, controlRuleHeaderDs };

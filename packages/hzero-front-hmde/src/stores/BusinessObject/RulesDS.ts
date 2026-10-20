import intl from 'srm-front-boot/lib/utils/intl';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

const ruleDs = () => ({
  autoQuery: false,
  autoCreate: false,
  selection: false,
  transport: {
    read: ({ params, dataSet }) => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-validate-rules/page`,
      method: 'GET',
      params: { ...params, businessObjectCode: dataSet.getState('businessObjectCode') },
    }),
    destroy: ({ data }) => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-validate-rules/${
        data[0].validateRuleId
      }`,
      method: 'DELETE',
      params: { validateRuleId: data[0].validateRuleId },
      data: data[0], // 后端校验
    }),
  },
  fields: [
    {
      name: 'ruleName',
      label: intl.get('hmde.bo.rule.name').d('规则名称'),
      type: 'intl',
      maxLength: 20,
    },
    {
      name: 'ruleCode',
      label: intl.get('hmde.bo.rule.code').d('规则编码'),
      type: 'string',
      maxLength: 60,
    },
    {
      name: 'ruleType',
      label: intl.get('hmde.bo.rule.type').d('规则分类'),
      type: 'string',
    },
    {
      name: 'enabledFlag',
      label: intl.get('hzero.common.model.status.enabledFlag').d('状态'),
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'ruleSourceType',
      label: intl.get('hmde.bo.rule.sourceType').d('规则来源'),
      type: 'string',
    },
    {
      name: 'errorInfo',
      label: intl.get('hmde.bo.rule.notification.errorInfo').d('报错内容'),
      type: 'string',
    },
  ],
  queryFields: [
    {
      name: 'nameOrCode',
      label: intl.get('hmde.bo.rule.nameOrCode').d('规则名称/编码'),
      type: 'string',
      merge: true,
    },
    {
      name: 'ruleType',
      label: intl.get('hmde.bo.rule.type').d('规则分类'),
      type: 'string',
      lookupCode: 'HMDE.BUSINESS_OBJECT_RULE_TYPE',
      lock: true,
    },
    {
      name: 'enabledFlag',
      label: intl.get('hmde.bo.view.message.header.enabledFlag').d('启用状态'),
      // defaultValue: true,
      textField: 'meaning',
      valueField: 'value',
      lookupCode: 'HPFM.ENABLED_FLAG',
      transformValue: (res) => (res ? !!+res : undefined),
      lock: true,
    },
  ],
});

enum RuleType {
  RECHECK_RULE = 'RECHECK_RULE', // 查重规则
  REGEXP_VALIDATE = 'REGEXP_VALIDATE', // 正则校验
  CUSTOM_RULE = 'CUSTOM_RULE', // 自定义规则
}

const formDs = ({ ruleId, businessObjectId, businessObjectCode, cacheTotalCount = 0 }) => ({
  autoCreate: true,
  autoQuery: !!ruleId,
  paging: false,
  transport: {
    read: () => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/business-object-validate-rules/${ruleId}`,
      method: 'GET',
      transformResponse: (res) => {
        try {
          const data = JSON.parse(res);
          const { ruleType, validRuleFields } = data;
          if (ruleType === RuleType.REGEXP_VALIDATE && validRuleFields && validRuleFields?.[0]) {
            return { ...data, validRuleFields: validRuleFields[0] };
          }
          if (ruleType === RuleType.RECHECK_RULE && validRuleFields && validRuleFields?.[0]) {
            return {
              ...data,
              validRuleFields: validRuleFields.sort(
                (a, b) => (a.orderSeq || 0) - (b.orderSeq || 0)
              ),
            };
          }
          return data;
        } catch (error) {
          // do nothing
          return [];
        }
      },
    }),
    submit: ({ data }) => {
      const { ruleType, validRuleFields } = data[0];
      const resultValidRuleFields =
        ruleType === RuleType.REGEXP_VALIDATE && validRuleFields
          ? [validRuleFields]
          : validRuleFields;
      return {
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-validate-rules`,
        method: 'PUT',
        data: {
          ...data[0],
          ruleSourceType: 'CUSTOM',
          businessObjectCode,
          validRuleFields: resultValidRuleFields
            ? resultValidRuleFields.map(({ _token, ...rest }, idx) => ({ ...rest, orderSeq: idx }))
            : resultValidRuleFields,
        },
      };
    },
    create: ({ data }) => {
      const { ruleType, validRuleFields, ruleCode } = data[0];
      const resultValidRuleFields =
        ruleType === RuleType.REGEXP_VALIDATE && validRuleFields
          ? [validRuleFields]
          : validRuleFields;

      const changeRuleCode = `${businessObjectCode}_${ruleCode}`;

      return {
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-validate-rules`,
        method: 'POST',
        data: {
          ...data[0],
          ruleSourceType: 'CUSTOM',
          businessObjectCode,
          validRuleFields: resultValidRuleFields
            ? resultValidRuleFields.map(({ _token, ...rest }, idx) => ({ ...rest, orderSeq: idx }))
            : resultValidRuleFields,
          ruleCode: changeRuleCode,
        },
      };
    },
  },
  fields: [
    {
      name: 'ruleName',
      label: intl.get('hmde.bo.rule.name').d('规则名称'),
      type: 'intl',
      maxLength: 20,
      required: true,
    },
    {
      name: 'ruleCode',
      label: intl.get('hmde.bo.rule.code').d('规则编码'),
      type: 'string',
      pattern: !ruleId ? new RegExp('^[a-zA-Z0-9_]+$') : undefined,
      maxLength: 60,
      required: true,
      defaultValidationMessages: {
        patternMismatch: intl
          .get('hmde.bo.rule.code.patternValidation')
          .d('可用字母、数字及下划线，且仅支持字母或数字结尾'),
      },
      defaultValue: `rule${+cacheTotalCount + 1}`,
    },
    {
      name: 'ruleType',
      label: intl.get('hmde.bo.rule.type').d('规则分类'),
      type: 'string',
      lookupCode: 'HMDE.BUSINESS_OBJECT_RULE_TYPE',
      defaultValue: RuleType.RECHECK_RULE,
      required: true,
    },
    {
      name: 'remark',
      label: intl.get('hmde.bo.rule.remark').d('规则描述'),
      type: 'intl',
      maxLength: 100,
    },
    {
      name: 'enabledFlag',
      label: intl.get('hmde.bo.view.message.header.enabledFlag').d('启用状态'),
      type: 'boolean',
      required: true,
      defaultValue: true,
    },
    {
      name: 'errorInfo',
      label: intl.get('hmde.bo.rule.notification.errorInfo').d('报错内容'),
      type: 'intl',
    },
    {
      // 查重字段 或者 选择字段
      name: 'validRuleFields',
      type: 'object',
      lovCode: 'HMDE.BUSINESS_OBJECT_FIELD.SITE',
      required: true,
      computedProps: {
        lovPara: () => {
          const base = {
            businessObjectId,
            excludeComponentTypes: String(['REFERENCE_FIELD', 'FORMULA']), // 排除掉公式字段和引用字段
            ignoreWhoFlag: true,
          };
          // if (record.get('ruleType') === RuleType.REGEXP_VALIDATE) {
          //   return { ...base, ignoreWhoFlag: true };
          // }
          return base;
        },
      },
    },
    {
      name: 'regularRules',
      label: intl.get('hmde.bo.rule.select').d('选择正则规则'),
      type: 'string',
      computedProps: {
        required: ({ record }) => record.get('ruleType') === RuleType.REGEXP_VALIDATE,
      },
      lookupCode: 'HMDE.BUSINESS_OBJECT.REGEXP_VALIDATE_RULE',
      ignore: 'always',
    },
    {
      name: 'formula',
      label: intl.get('hmde.bo.rule.formula').d('正则表达式'),
      type: 'string',
      computedProps: {
        required: ({ record }) => record.get('ruleType') === RuleType.REGEXP_VALIDATE,
      },
      readOnly: true,
      bind: 'regularRules',
    },
  ],
});

export { ruleDs, formDs, RuleType };

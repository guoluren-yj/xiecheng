import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMBL } from '_utils/config';

const ResultListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/risk-define`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  // pageSize: 20,
  // primaryKey: '',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`smbl.checkRules.model.checkStatus`).d('审核状态'),
      name: 'approveStatus',
      type: 'string',
      width: 120,
      lookupCode: 'SMBL.CHECK_RESULT_STATUS',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleName`).d('审核规则名称'),
      name: 'ruleName',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.checkScope`).d('审核范围'),
      name: 'displayName',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleStrength`).d('规则强度'),
      name: 'ruleControlStrategy',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_STRATEGY',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleRequirements`).d('规则要求'),
      name: 'ruleDetail',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.matchResult`).d('匹配结果'),
      name: 'executeResult',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.modifySuggestions`).d('修改建议'),
      name: 'modifySuggestions',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.feedbackType`).d('结果反馈'),
      name: 'feedback',
      type: 'string',
    },
  ],
  events: {},
});

export { ResultListDS };

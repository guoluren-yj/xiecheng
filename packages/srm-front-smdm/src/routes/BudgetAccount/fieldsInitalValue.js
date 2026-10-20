import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_MDM } from '_utils/config';
import { CODE } from 'utils/regExp';

const organizationId = getCurrentOrganizationId();

const tableDs = () => ({
  autoQuery: true,
  selection: false,
  fields: [
    {
      name: 'companyLov',
      label: intl.get(`smdm.common.model.project.companyId`).d('公司编码'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      required: true,
      ignore: 'always',
      textField: 'companyNum',
    },
    {
      name: 'companyId',
      type: 'string',
      bind: 'companyLov.companyId',
    },
    {
      name: 'companyNum',
      type: 'string',
      bind: 'companyLov.companyNum',
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`sprm.common.model.companyName`).d('公司名称'),
      bind: 'companyLov.companyName',
    },
    {
      name: 'budgetAccountNum',
      label: intl.get(`sprm.common.model.budgetAccountNum`).d('科目编码'),
      type: 'string',
      pattern: CODE,
      required: true,
    },
    {
      name: 'budgetAccountName',
      type: 'intl',
      required: true,
      label: intl.get(`sprm.common.model.budgetAccountName`).d('科目名称'),
    },
    {
      name: 'openBudgetFlag',
      type: 'number',
      label: intl.get(`sprm.common.model.budgetAccountFlag`).d('是否启用预算'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'enabledFlag',
      type: 'number',
      label: intl.get(`sprm.common.model.common.statusCode`).d('状态'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'sourceCode',
      label: intl.get('smdm.common.model.project.sourceFromSystem').d('来源系统'),
    },
    {
      name: 'externalSystemCode',
      label: intl.get('smdm.common.model.project.externalSystemCode').d('外部系统编码'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
  queryFields: [
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`sprm.common.model.companyName`).d('公司名称'),
    },
    {
      name: 'budgetAccountName',
      type: 'string',
      label: intl.get(`sprm.common.model.budgetAccountName`).d('科目名称'),
    },
    {
      name: 'openBudgetFlag',
      type: 'string',
      label: intl.get(`sprm.common.model.budgetAccountFlag`).d('是否启用预算'),
      lookupCode: 'HPFM.FLAG',
      lovPra: { tenantId: organizationId },
    },
  ],

  transport: {
    read: () => {
      return {
        url: `${SRM_MDM}/v1/${organizationId}/budget-accounts/page`,
        method: 'GET',
      };
    },
    submit: (val) => {
      const { data } = val;
      const updateData = data.map((ele) => ({ ...ele, tenantId: organizationId }));
      return {
        url: `${SRM_MDM}/v1/${organizationId}/budget-accounts/batch-save`,
        method: 'POST',
        data: updateData,
      };
    },
  },
});

export { tableDs };

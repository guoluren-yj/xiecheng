import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const prefix = `ssta.invoiceRule`;
const mainTableDs = () => ({
  selection: 'multiple',
  cacheSelection: true,
  pageSize: 20,
  // table表单显示的字段
  dataToJSON: 'selected',
  paging: 'server',
  childrenField: 'children', // 子节点数组
  fields: [
    {
      name: 'ruleStatusMeaning',
      type: 'string',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'displayStatus',
      type: 'string',
      lookupCode: 'SDIM.RULE_STATUS',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'ruleNum',
      type: 'string',
      label: intl.get(`${prefix}.model.invoiceRule.ruleCode`).d('开票规则编码'),
    },
    {
      name: 'ruleName',
      type: 'string',
      label: intl.get(`${prefix}.model.invoiceRule.ruleName`).d('开票规则名称'),
    },

    {
      name: 'versionNumber',
      type: 'string',
      label: intl.get(`${prefix}.model.invoiceRule.versionNum`).d('版本'),
    },
    {
      name: 'enableFlag',
      type: 'number',
      label: intl.get(`hzero.common.status.enable`).d('启用'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('hzero.common.table.column.options').d('操作'),
    },
  ],
  queryFields: [],
  transport: {
    /**
     * 查询
     */
    read: () => {
      return {
        url: `/ssta/v1/${organizationId}/direct-invoice-rules/list?customizeUnitCode=SDIM.INVOICE_RULE.GRID_NEW,SDIM.INVOICE_RULE.SEARCH_BAR_NEW`,
        method: 'GET',
      };
    },
  },
});

export { mainTableDs };

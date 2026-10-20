import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const indexDS = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'investgNumber',
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.investgNumber')
        .d('调查表编号'),
    },
    {
      name: 'processStatusMeaning',
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.processStatus')
        .d('状态'),
    },
    {
      name: 'companyNum',
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.companyNum')
        .d('客户编码'),
    },
    {
      name: 'companyName',
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.companyName')
        .d('客户名称'),
    },
    {
      name: 'partnerCompanyNum',
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.partnerCompanyNum')
        .d('公司编码'),
    },
    {
      name: 'partnerCompanyName',
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.partnerCompanyName')
        .d('公司名称'),
    },
    {
      name: 'investigateTypeMeaning',
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.investigateType')
        .d('调查表类型'),
    },
    {
      name: 'investigateLevelMeaning',
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.investigateLevel')
        .d('调查表管控维度'),
    },
    {
      name: 'templateName',
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.templateName')
        .d('调查表模板名称'),
    },
    {
      name: 'realName',
      label: intl.get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.realName').d('创建人'),
    },
    {
      name: 'releaseDate',
      type: 'date',
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.releaseDate')
        .d('发布日期'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.creationDate')
        .d('创建时间'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/investigate/supplier/work/list`,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...data,
          customizeUnitCode:
            'SSLM.SUPPLIER_INVEST_WORKBENCH_LIST.TABPANE,SSLM.SUPPLIER_INVEST_WORKBENCH_LIST.TABLE_LIST,SSLM.SUPPLIER_INVEST_WORKBENCH_LIST.SEARCH_TOFILLED,SSLM.SUPPLIER_INVEST_WORKBENCH_LIST.SEARCH_ALL',
        },
      };
    },
  },
});

export { indexDS };

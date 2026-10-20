import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const headerInfoDS = ({ investgHeaderId }) => ({
  primaryKey: 'investgHeaderId',
  fields: [
    {
      name: 'investgNumber',
      disabled: true,
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.investgNumber')
        .d('调查表编号'),
    },
    {
      name: 'companyNum',
      disabled: true,
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.companyNum')
        .d('客户编码'),
    },
    {
      name: 'companyName',
      disabled: true,
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.companyName')
        .d('客户名称'),
    },
    {
      name: 'partnerCompanyNum',
      disabled: true,
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.partnerCompanyNum')
        .d('公司编码'),
    },
    {
      name: 'partnerCompanyName',
      disabled: true,
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.partnerCompanyName')
        .d('公司名称'),
    },
    {
      name: 'investigateLevelMeaning',
      disabled: true,
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.investigateLevel')
        .d('调查表管控维度'),
    },
    {
      name: 'templateName',
      disabled: true,
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.templateName')
        .d('调查表模板名称'),
    },
    {
      name: 'realName',
      disabled: true,
      label: intl.get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.realName').d('创建人'),
    },
    {
      name: 'releaseDate',
      type: 'date',
      disabled: true,
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.releaseDate')
        .d('发布日期'),
    },
    {
      name: 'partnerRemark',
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.partnerRemark')
        .d('反馈备注'),
    },
    {
      name: 'remark',
      disabled: true,
      label: intl.get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.remark').d('调查说明'),
    },
    {
      name: 'createUserRealName',
      disabled: true,
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.createUserName')
        .d('创建人'),
    },
    {
      name: 'processStatusMeaning',
      disabled: true,
      label: intl
        .get('sslm.supplierInvestWorkbench.model.purInvestWorkbench.processStatus')
        .d('调查表状态'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/investigate/${investgHeaderId}`,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...data,
          customizeUnitCode: 'SSLM.SUPPLIER_INVEST_WORKBENCH_DETAIL.BASIC_INFO',
        },
      };
    },
  },
});

export { headerInfoDS };

import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const tableDS = () => ({
  autoQuery: true,
  idField: 'unitId',
  parentField: 'parentUnitId',
  pageSize: 10,
  paging: 'server',
  // expandField: 'expend',
  queryFields: [
    {
      name: 'unitCode',
      label: intl.get('small.purchaseManage.model.unitCode').d('组织编码'),
    },
    {
      name: 'unitName',
      label: intl.get('small.purchaseManage.model.unitName').d('组织名称'),
    },
  ],
  fields: [
    {
      name: 'stock',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.INVORG',
      lovPara: { organizationId },
      ignore: 'always',
    },
    {
      name: 'purchase',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
      lovPara: { organizationId },
      ignore: 'always',
    },
    {
      name: 'company',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      lovPara: { organizationId },
      ignore: 'always',
    },
    {
      name: 'unitCode',
      label: intl.get('small.purchaseManage.model.unit').d('组织'),
    },
    {
      name: 'hasChildren',
      type: 'boolean',
    },
    {
      name: 'aliasName',
      label: intl.get('small.purchaseManage.model.alias').d('别名'),
      type: 'string',
      maxLength: 360,
    },
    {
      name: 'invLov',
      type: 'object',
      label: intl.get('small.purchaseManage.model.relevanceUnit').d('关联库存组织'),
      lovCode: 'SPFM.USER_AUTH.INVORG',
      valueField: 'organizationId',
      textField: 'organizationName',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ record }) => ({ companyId: record.get('companyId') }),
      },
      transformResponse: (_, record) =>
        record.invOrganizationName
          ? {
              organizationName: record.invOrganizationName,
              organizationId: record.invOrganizationId,
            }
          : null,
    },
    {
      name: 'invOrganizationId',
      bind: 'invLov.organizationId',
    },
    {
      name: 'purLov',
      type: 'object',
      label: intl.get('small.purchaseManage.model.relevancePur').d('关联采购组织'),
      lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
      valueField: 'purchaseOrgId',
      textField: 'organizationName',
      ignore: 'always',
      transformResponse: (_, record) =>
        record.purOrganizationName
          ? {
              organizationName: record.purOrganizationName,
              purchaseOrgId: record.purOrganizationId,
            }
          : null,
    },
    {
      name: 'purOrganizationId',
      bind: 'purLov.purchaseOrgId',
    },
    {
      name: 'comLov',
      type: 'object',
      label: intl.get('small.purchaseManage.model.relevanceCom').d('关联公司'),
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      valueField: 'companyId',
      textField: 'companyName',
      ignore: 'always',
      transformResponse: (_, record) =>
        record.companyName
          ? {
              companyName: record.companyName,
              companyId: record.companyId,
            }
          : null,
    },
    {
      name: 'companyId',
      bind: 'comLov.companyId',
    },
  ],
  transport: {
    read: ({ data }) => {
      const url = `/sagm/v1/${organizationId}/unit-refs/first-unit`;
      return {
        url,
        method: 'GET',
        data,
      };
    },
    submit: ({ data }) => {
      return {
        url: `/sagm/v1/${organizationId}/unit-refs`,
        method: 'POST',
        data,
      };
    },
  },
});

export { tableDS };

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';
import { isEmpty } from 'lodash';

const baseFormDS = ({ rfqHeaderId = '', isNewInquiry = false }) => {
  return {
    autoQuery: !isNewInquiry,
    autoCreate: isNewInquiry,
    dataToJSON: 'all',
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.companyName`).d('公司'),
        name: 'companyId',
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        textField: 'companyName',
        valueField: 'companyId',
        type: 'object',
        required: true,
        transformRequest: (value = {}) => {
          return value?.companyId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                companyId: value,
                companyName: data?.companyName,
                companyCode: data?.companyCode,
              }
            : null;
        },
      },
      {
        name: 'companyCode',
        bind: 'companyId.companyCode',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.purOrganizationName`).d('采购组织'),
        name: 'purOrganizationId',
        lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
        textField: 'organizationName',
        valueField: 'purchaseOrgId',
        type: 'object',
        transformRequest: (value = {}) => {
          return value?.purchaseOrgId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                purchaseOrgId: value,
                organizationName: data?.purOrganizationName,
              }
            : null;
        },
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.purchaseName`).d('采购员'),
        name: 'purchaseAgentId',
        lovCode: 'SSRC.USER_AUTH_PURCHASE_AGENT',
        textField: 'purchaseAgentName',
        valueField: 'purchaseAgentId',
        type: 'object',
        transformRequest: (value = {}) => {
          return value?.purchaseAgentId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
                purchaseAgentId: value,
                purchaseAgentName: data?.purchaseAgentName,
              }
            : null;
        },
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.expandResult`).d('拓展结果'),
        help: intl
          .get(`ssrc.quickInquiry.model.quickInquiry.expandResultHelp`)
          .d(
            '启用拓展结果，可以在单据发布时维护结果需要拓展给其他公司或其他库存组织；不启用则无法拓展给其他组织。'
          ),
        name: 'expandResultsFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.expandDimension`).d('拓展维度'),
        name: 'resultsExpandingDimensions',
        type: 'string',
        lookupCode: 'SSRC.RESULTS_EXPANDING_DIMENSIONS',
        defaultValue: 'WHOLE_ORDER',
        dynamicProps: {
          required({ record }) {
            return [1, '1'].includes(record.get('expandResultsFlag'));
          },
        },
        transformResponse: (value, data) =>
          !value && [1, '1'].includes(data?.expandResultsFlag) ? 'WHOLE_ORDER' : value,
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.expandHierarchy`).d('拓展层级'),
        name: 'resultsExpandingHierarchy',
        type: 'string',
        lookupCode: 'SSRC.RESULTS_EXPANDING_HIERARCHY',
        defaultValue: 'COMPANY',
        dynamicProps: {
          required({ record }) {
            return [1, '1'].includes(record.get('expandResultsFlag'));
          },
        },
        transformResponse: (value, data) =>
          !value && [1, '1'].includes(data?.expandResultsFlag) ? 'COMPANY' : value,
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.expandCompany`).d('拓展公司'),
        name: 'expandCompany',
        type: 'object',
        multiple: true,
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        transformResponse: (value, data) => {
          const { expandCompany, expandCompanyMeaning } = data || {};
          const idList = expandCompany?.split(',') || [];
          const nameList = expandCompanyMeaning?.split(',') || [];
          return value
            ? idList.map((item, index) => ({
                companyId: item,
                companyName: nameList[index],
              }))
            : null;
        },
        transformRequest: (value) => {
          if (isEmpty(value)) {
            return null;
          }
          return value && value.map((item) => item.companyId).join(',');
        },
        dynamicProps: {
          required({ record }) {
            const { expandResultsFlag, resultsExpandingHierarchy, resultsExpandingDimensions } =
              record.get([
                'expandResultsFlag',
                'resultsExpandingHierarchy',
                'resultsExpandingDimensions',
              ]) || {};
            return (
              [1, '1'].includes(expandResultsFlag) &&
              resultsExpandingDimensions === 'WHOLE_ORDER' &&
              resultsExpandingHierarchy === 'INV_ORGANIZATION'
            );
          },
        },
      },
      {
        name: 'expandCompanyMeaning',
        bind: 'expandCompany.companyName',
        multiple: ',',
      },
      {
        name: 'expandInvOrganization',
        type: 'object',
        multiple: true,
        label: intl
          .get('ssrc.quickInquiry.model.quickInquiry.expandInvOrganization')
          .d('拓展库存组织'),
        lovCode: 'HPFM_INV_ORGANIZATION_LIST',
        dynamicProps: {
          disabled({ record }) {
            return isEmpty(record.get('expandCompany'));
          },
          required({ record }) {
            const { expandResultsFlag, resultsExpandingHierarchy, resultsExpandingDimensions } =
              record.get([
                'expandResultsFlag',
                'resultsExpandingHierarchy',
                'resultsExpandingDimensions',
              ]) || {};
            return (
              [1, '1'].includes(expandResultsFlag) &&
              resultsExpandingDimensions === 'WHOLE_ORDER' &&
              resultsExpandingHierarchy === 'INV_ORGANIZATION'
            );
          },
          lovPara({ record }) {
            const companyIds = record?.get('expandCompany');
            const param = {
              companyIds: companyIds?.map((item) => item.companyId)?.join(','),
            };
            return param;
          },
        },
        transformResponse: (value, data) => {
          const { expandInvOrganization, expandInvOrganizationMeaning } = data || {};
          const idList = expandInvOrganization?.split(',') || [];
          const nameList = expandInvOrganizationMeaning?.split(',') || [];
          return value
            ? idList.map((item, index) => ({
                organizationId: Number(item), // 值集值字段默认数字类型 若是后期值集主键加密 需要再次处理
                organizationName: nameList[index],
              }))
            : null;
        },
        transformRequest: (value) => {
          if (isEmpty(value)) {
            return null;
          }
          return value && value.map((item) => item.organizationId).join(',');
        },
      },
      {
        name: 'expandInvOrganizationMeaning',
        bind: 'expandInvOrganization.organizationName',
        multiple: ',',
      },
    ],
    transport: {
      read: () => ({
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq/detail`,
        method: 'POST',
        params: {
          customizeUnitCode: `SSRC.QUICK_INQUIRY.EDIT.BASE_HEADER_FORM`,
        },
        data: {
          rfqHeaderId,
        },
      }),
    },
  };
};

export { baseFormDS };

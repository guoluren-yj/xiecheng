/**
 * 明细头
 */
import { SRM_SSLM, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { isArray, isEmpty, isObject } from 'lodash';

const organizationId = getCurrentOrganizationId();

const getHeaderDs = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'abilityReqNum',
      label: intl.get('sslm.common.model.applicationNumber').d('申请单号'),
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'abilityReqStatus',
      label: intl.get('hzero.common.common.status').d('状态'),
      type: 'string',
      lookupCode: 'SSLM.SUPPLY_ABILITY_REQ_STATUS',
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'initiateCamp',
      label: intl.get('sslm.supplyAbilityDoc.model.supplyAbility.reqInitiator').d('申请单发起方'),
      type: 'string',
      lookupCode: 'SSLM.INITIATE_CAMP',
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'supplierCompanyId',
      label: intl.get('sslm.common.supplier').d('供应商'),
      type: 'object',
      lovCode: 'SSLM.USER_AUTH_COMPANY_SUPPLIER',
      dynamicProps: {
        required: () => true,
        disabled: ({ record }) => record.get('abilityReqId'),
      },
      transformRequest: value => value && value.supplierCompanyId,
      transformResponse: (value, data) => {
        const { supplierCompanyId, supplierCompanyName } = data;
        return value
          ? {
              supplierCompanyId,
              supplierCompanyName,
            }
          : null;
      },
    },
    {
      name: 'supplyListDimensionCode',
      bind: 'supplierCompanyId.supplyListDimensionCode',
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierCompanyId.supplierTenantId',
    },
    {
      name: 'companyId',
      label: intl.get('sslm.common.company').d('公司'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      dynamicProps: {
        required: ({ record }) => record.get('supplyListDimensionCode') === 'COMPANY',
        disabled: ({ record }) =>
          record.get('abilityReqId') ||
          !record.get('supplierCompanyId') ||
          record.get('supplyListDimensionCode') !== 'COMPANY',
        lovPara: ({ record }) => {
          return {
            organizationId,
            supplierCompanyId: record.get('supplierCompanyId')
              ? record.get('supplierCompanyId').supplierCompanyId
              : null,
          };
        },
      },
      transformRequest: value => value && value.companyId,
      transformResponse: (value, data) => {
        const { companyId, companyName } = data;
        return value
          ? {
              companyId,
              companyName,
            }
          : null;
      },
    },
    {
      name: 'companyIds',
      type: 'object',
      lovCode: 'SSLM_SUPPLIER_CHANGE_EXTEND_COMPANY',
      multiple: true,
      label: intl.get('sslm.common.model.common.expandCompany').d('拓展公司'),
      dynamicProps: {
        disabled: ({ record }) =>
          record.get('supplyListDimensionCode') !== 'COMPANY' || !record.get('companyId'),
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          supplierCompanyId: record.get('supplierCompanyId')
            ? record.get('supplierCompanyId').supplierCompanyId
            : null,
          companyIds: record.get('companyId') ? record.get('companyId').companyId : null,
        }),
        help: ({ record }) =>
          record.get('abilityReqId')
            ? ''
            : intl
                .get('sslm.supplyAbilityDoc.model.supplyAbilityDoc.title.expandCompanyInfo')
                .d('本次申请单上维护的物料/品类行将自动同步至此处选择的其他子公司的供货能力清单中'),
      },
      transformRequest: value =>
        isEmpty(value)
          ? null
          : isArray(value)
          ? value.map(i => i.companyId).join()
          : value
          ? value.companyId
          : null,
      transformResponse: (value, data) => {
        const { companyNames = {} } = data;
        if (value && isObject(companyNames)) {
          const arr = [];
          for (const key in companyNames) {
            if (Object.hasOwnProperty.call(companyNames, key)) {
              const element = companyNames[key];
              arr.push({
                companyId: key,
                companyName: element,
              });
            }
          }
          return arr;
        }
        return null;
      },
    },
    {
      name: 'createdUserName',
      label: intl.get('hzero.common.creationName').d('创建人'),
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('hzero.common.creationDate').d('创建时间'),
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'remark',
      label: intl.get(`hzero.common.remark`).d('备注'),
    },
    {
      name: 'stageDescription',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.supplierLife').d('供应商生命周期'),
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'attachmentUuid',
      label: intl.get('hzero.common.view.title.attachment').d('附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'sslm-supplyAbility',
    },
  ],
  events: {
    update: ({ name, record }) => {
      switch (name) {
        case 'companyId':
          record.set({
            companyIds: null,
          });
          break;
        default:
          break;
      }
    },
  },
  transport: {
    read: ({ data, params }) => {
      const { queryParam: { abilityReqId, ...others } = {}, ...rest } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/${abilityReqId}`,
        method: 'GET',
        params: {
          ...params,
          ...others,
        },
        data: rest,
      };
    },
  },
});

export { getHeaderDs };

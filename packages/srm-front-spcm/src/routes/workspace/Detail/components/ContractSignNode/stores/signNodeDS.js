/*
 * @Date: 2025-06-26
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getSignNodeDs = ({ isEdit = false, pcHeaderId } = {}) => ({
  paging: false,
  forceValidate: true,
  primaryKey: 'integrationId',
  fields: [
    {
      // 伙伴行id
      name: 'partnerId',
    },
    {
      name: 'signOrder',
      label: intl.get('spcm.common.model.common.signNodeSort').d('签署节点顺序'),
      required: isEdit,
      type: 'number',
      min: 1,
      step: 1,
      precision: 0,
      numberGrouping: false,
    },
    {
      name: 'partnerTypeName',
      type: 'string',
      label: intl.get('spcm.common.model.common.partnerTypeName').d('伙伴类型名称'),
      required: isEdit,
    },
    {
      name: 'partnerTypeCode',
      label: intl.get('spcm.common.model.common.partnerTypeCode').d('伙伴类型编码'),
    },
    {
      name: 'accountType',
      label: intl.get('spcm.common.model.common.signerAccountType').d('签署人账户类型'),
      type: 'string',
      lookupCode: 'SPCM.DOCIGN_ACCOUNT_TYPE',
    },
    {
      name: 'userId',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.SUPPLIER_AND_PUR',
      label: intl.get('spcm.common.model.common.signerAccount').d('签署人子账户'),
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('accountType') !== 'SYSTEM_USER' || !record.get('partnerTypeCode');
        },
        lovPara: ({ record, dataSet }) => {
          const { companyId, organizationId, tenantId } =
            record?.get(['companyId', 'organizationId', 'tenantId']) || {};
          // 供应商标识
          const supplierCompanyFlag = Number(organizationId) !== Number(tenantId);
          if (supplierCompanyFlag) {
            const headerDs = dataSet.getState('headerDs');
            const purchaserCompanyId = headerDs?.current?.get('companyId');
            return {
              supplierTenantId: organizationId,
              supplierCompanyId: companyId,
              companyId: purchaserCompanyId,
            };
          } else {
            return {
              tenantId: organizationId,
              companyId,
            };
          }
        },
      },
      transformRequest: (value) => value && value.userId,
      transformResponse: (value, data) => {
        const { userId, loginName } = data || {};
        return value
          ? {
              userId,
              loginName,
            }
          : null;
      },
    },
    {
      name: 'userName',
      required: isEdit,
      label: intl.get('spcm.common.model.common.signerName').d('签署人姓名'),
    },
    {
      name: 'email',
      required: isEdit,
      type: 'email',
      label: intl.get('spcm.common.model.common.signerEmail').d('邮箱'),
    },
    {
      name: 'sealType',
      label: intl.get('spcm.common.model.common.sealType').d('印章类型'),
      required: isEdit,
      lookupCode: 'SPCM.DOCIGN_SEAL_TYPE',
    },
    {
      name: 'keyWord',
      label: intl.get('spcm.common.model.common.anchorKeyword').d('关键字'),
      dynamicProps: {
        required: ({ record }) => {
          return isEdit && record.get('sealType') === 'KEY_WORD_SEAL';
        },
        disabled: ({ record }) => {
          return record.get('sealType') !== 'KEY_WORD_SEAL';
        },
      },
    },
    {
      name: 'statusCode',
      label: intl.get('spcm.common.model.common.signStatus').d('签署节点状态'),
      lookupCode: 'SPCM_DOCIGN_VIEW_STATUS',
      dynamicProps: {
        disabled: () => true,
      },
    },
    {
      name: 'transferRemark',
      label: intl.get('spcm.common.model.common.transferRemark').d('转交说明'),
      dynamicProps: {
        disabled: () => true,
      },
    },
  ],
  events: {
    // load: ({ dataSet }) => {
    //   dataSet.forEach(record => {
    //   });
    // },
    update: ({ record, name, value }) => {
      switch (name) {
        case 'sealType': {
          if (value === 'DRAG_SEAL') {
            record.set('anchorKeyword', null);
          }
          break;
        }
        case 'userId': {
          if (value) {
            const { email, realName } = value || {};
            record.set({
              userName: realName,
              email,
            });
          }
          break;
        }
        case 'partnerTypeCode': {
          record.set({
            userId: null,
            email: null,
            userName: null,
          });
          break;
        }
        default:
          break;
      }
    },
  },
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/integration-sign-nodes/list`,
        method: 'GET',
        params: {
          ...params,
          pcHeaderId,
          customizeUnitCode: '',
        },
      };
    },
    submit: ({ params }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/integration-sign-nodes/save`,
        method: 'PUT',
        params: {
          ...params,
          customizeUnitCode: '',
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/integration-sign-nodes/delete`,
        method: 'DELETE',
        data,
      };
    },
  },
});

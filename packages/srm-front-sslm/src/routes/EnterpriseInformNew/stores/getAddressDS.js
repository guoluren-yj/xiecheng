/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { getReadTransport } from '../utils';

const organizationId = getCurrentOrganizationId();

export const getAddressDS = ({
  isAllPlatform,
  partnerTenantId,
  readOnlyFlag = false,
  code = '',
  ...rest
} = {}) => ({
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'countryId',
      type: 'object',
      required: true,
      lovCode: 'HPFM.COUNTRY',
      lovPara: { enabledFlag: 1 },
      label: intl.get(`sslm.enterpriseInform.view.model.address.countryName`).d('国家'),
      transformRequest: value => value && value.countryId,
      transformResponse: (value, data) => {
        const { countryId, countryCode, countryName, quickIndex } = data;
        return value ? { countryId, countryCode, countryName, quickIndex } : null;
      },
    },
    {
      name: 'countryCode',
      bind: 'countryId.countryCode',
    },
    {
      name: 'countryName',
      bind: 'countryId.countryName',
    },
    {
      name: 'quickIndex',
      bind: 'countryId.quickIndex',
    },
    {
      name: 'regionPathName',
      label: intl.get(`sslm.enterpriseInform.view.model.address.regionPathName`).d('省/市/区'),
      validator: (value, name, record) => {
        const { countryCode, quickIndex, isLeaf = true, regionId } = record.get([
          'countryCode',
          'quickIndex',
          'isLeaf',
          'regionId',
        ]);
        if (countryCode === 'CN' || quickIndex === 'CN') {
          if (!isLeaf && regionId) {
            return intl.get('sslm.common.view.message.lastRegion').d('须选择填写至最末级地区');
          }
          return true;
        }
        return true;
      },
    },
    {
      name: 'addressDetail',
      type: 'intl',
      required: true,
      label: intl.get('sslm.enterpriseInform.view.model.address.businessAddres').d('经营地址'),
    },
    {
      name: 'postCode',
      label: intl.get('sslm.enterpriseInform.view.model.address.postCode').d('邮政编码'),
      dynamicProps: {
        pattern: ({ record }) => {
          const { countryCode, quickIndex } = record.get(['countryCode', 'quickIndex']);
          if (countryCode === 'CN' || quickIndex === 'CN') {
            return /^[0-9]*$/;
          }
        },
        minLength: ({ record }) => {
          const { countryCode, quickIndex } = record.get(['countryCode', 'quickIndex']);
          if (countryCode === 'CN' || quickIndex === 'CN') {
            return 6;
          } else {
            return -Infinity;
          }
        },
        maxLength: ({ record }) => {
          const { countryCode, quickIndex } = record.get(['countryCode', 'quickIndex']);
          if (countryCode === 'CN' || quickIndex === 'CN') {
            return 6;
          } else {
            return Infinity;
          }
        },
        defaultValidationMessages: ({ record }) => {
          const { countryCode, quickIndex } = record.get(['countryCode', 'quickIndex']);
          if (countryCode === 'CN' || quickIndex === 'CN') {
            return {
              tooShort: intl.get(`spfm.address.model.address.validate.postCode`).d('请输入6位数字'),
            };
          } else {
            return {};
          }
        },
      },
    },
    {
      name: 'description',
      label: intl.get('sslm.enterpriseInform.view.model.address.description').d('地址备注'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hzero.common.status.enable').d('启用'),
    },
    {
      name: 'objectFlag',
      ignore: 'always',
      label: intl.get('sslm.common.model.common.changeType').d('变更类型'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (!isAllPlatform && record.get('supplierAddressId')) {
          Object.assign(record, { selectable: false });
        }
      });
    },
    update: ({ name, record }) => {
      switch (name) {
        case 'countryId':
          record.set({ regionPathName: null, regionId: null });
          break;
        default:
          break;
      }
    },
  },
  transport: {
    read: ({ dataSet }) => {
      // 只读页面标红用readUrlProps这个接口
      const readUrlProps = getReadTransport({ dataSet, code, ...rest });
      const { companyId, changeReqId, supplierCompanyId } = dataSet.getState('dsState') || {};
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-address-reqs/no-basic`
        : `${SRM_SSLM}/v1/${organizationId}/sup-address-reqs/no-basic`;
      return !readOnlyFlag
        ? {
            url,
            method: 'GET',
            params: {},
            data: {
              changeReqId,
              companyId,
              supplierCompanyId,
              supplierFlag: isAllPlatform ? 0 : 1,
              dataSource: 1,
              customizeUnitCode: isAllPlatform ? null : code,
              customizeTenantId: isAllPlatform ? null : partnerTenantId,
            },
          }
        : readUrlProps;
    },
    submit: ({ dataSet, data }) => {
      const { companyId, changeReqId } = dataSet.getState('dsState') || {};
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-address-reqs`
        : `${SRM_SSLM}/v1/${organizationId}/sup-address-reqs`;
      return {
        url,
        method: 'POST',
        params: {
          dataSource: 1,
          customizeUnitCode: isAllPlatform ? null : code,
          customizeTenantId: isAllPlatform ? null : partnerTenantId,
        },
        data: {
          changeReqId,
          companyId,
          [isAllPlatform ? 'comAddressReqs' : 'supAddressReqs']: data,
        },
      };
    },
    destroy: ({ data }) => {
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-address-reqs/delete`
        : `${SRM_SSLM}/v1/${organizationId}/sup-address-reqs/delete`;
      return {
        url,
        method: 'DELETE',
        data,
      };
    },
  },
});

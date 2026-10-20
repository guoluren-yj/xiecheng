/*
 * @Date: 2023-04-10 20:55:35
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getAddressDS = () => ({
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
            return /^\d{6}$/;
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
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (record.get('supplierAddressId')) {
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
      const { companyId, changeReqId, supplierCompanyId } = dataSet.getState('dsState') || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-address-reqs/no-basic`,
        method: 'GET',
        params: {},
        data: {
          companyId,
          changeReqId,
          dataSource: 2,
          supplierFlag: 1,
          supplierCompanyId,
          customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ADDRESS',
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-address-reqs/delete`,
        method: 'DELETE',
        params: {
          customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ADDRESS',
        },
        data,
      };
    },
  },
});

/*
 * @Date: 2024-05-30 13:38:15
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

// 推荐物料/品类信息
const getCategoryMaterialDS = () => ({
  selection: false,
  pageSize: 10,
  autoCreate: true,
  // 去除_status, _id 等附加字段
  dataToJSON: 'normal',
  fields: [
    {
      name: 'supplyFlag',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.availableFor').d('可供'),
      type: 'string',
      lookupCode: 'HPFM.FLAG',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.adapterProducts`).d('适配产品'),
      name: 'adapterProducts',
    },
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.countryIdMeaning').d('服务国家'),
      name: 'countryId',
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      noCache: true,
      textField: 'countryName',
      transformRequest: value => value && value.countryId,
      transformResponse: (value, data) => {
        const { countryId, countryIdMeaning } = data;
        return value
          ? {
              countryId,
              countryName: countryIdMeaning,
            }
          : null;
      },
    },
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.regionIdMeaning').d('服务地区'),
      name: 'regionId',
      type: 'object',
      lovCode: 'HPFM.REGION',
      noCache: true,
      textField: 'regionName',
      dynamicProps: {
        disabled: ({ record }) => {
          const countryDisabled = isEmpty(record.get('countryId'));
          return countryDisabled;
        },
        lovPara: ({ record }) => {
          return {
            countryId: record.get('countryId') ? record.get('countryId').countryId : null,
          };
        },
      },
      transformRequest: value => value && value.regionId,
      transformResponse: (value, data) => {
        const { regionId, regionIdMeaning } = data;
        return value
          ? {
              regionId,
              regionName: regionIdMeaning,
            }
          : null;
      },
    },
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.cityIdMeaning').d('服务城市'),
      name: 'cityId',
      type: 'object',
      lovCode: 'HPFM.REGION',
      noCache: true,
      textField: 'regionName',
      dynamicProps: {
        disabled: ({ record }) => {
          const disabled = isEmpty(record.get('regionId'));
          return disabled;
        },
        lovPara: ({ record }) => {
          return {
            parentRegionId: record.get('regionId') ? record.get('regionId').regionId : null,
          };
        },
      },
      transformRequest: value => value && value.regionId,
      transformResponse: (value, data) => {
        const { cityId, cityIdMeaning } = data;
        return value
          ? {
              regionId: cityId,
              regionName: cityIdMeaning,
            }
          : null;
      },
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.dateFrom`).d('有效期从'),
      name: 'dateFrom',
      type: 'date',
      transformRequest: value => value && value.format(DEFAULT_DATE_FORMAT),
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至'),
      name: 'dateTo',
      type: 'date',
      transformRequest: value => value && value.format(DEFAULT_DATE_FORMAT),
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家'),
      name: 'manufacturer',
    },
    {
      label: intl.get(`hzero.common.remark`).d('备注'),
      name: 'remark',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.inventoryOrganization`).d('库存组织'),
      name: 'inventoryOrganizationId',
      type: 'object',
      lovCode: 'SSLM.INV_ORGANIZATION',
      multiple: true,
      transformRequest: value =>
        isEmpty(value) ? null : value.map(n => n.organizationId).join(','),
      transformResponse: (value, data) => {
        const { inventoryOrganizationMeaning } = data;
        const inventoryOrganizationIdList = [];
        // 处理lov显示数据
        if (inventoryOrganizationMeaning) {
          Object.keys(inventoryOrganizationMeaning).forEach(key => {
            const obj = {
              organizationId: key,
              organizationName: inventoryOrganizationMeaning[key],
            };
            inventoryOrganizationIdList.push(obj);
          });
        }
        return inventoryOrganizationIdList;
      },
    },
    {
      label: intl
        .get(`sslm.supplyAbility.model.supplyAbility.purchasingOrganization`)
        .d('采购组织'),
      name: 'purchaseOrganizationId',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.PURORG',
      noCache: true,
      textField: 'organizationName',
      transformRequest: value => value && value.purchaseOrgId,
      transformResponse: (value, data) => {
        const { purchaseOrganizationId, purchaseOrganizationName } = data;
        return value
          ? {
              purchaseOrgId: purchaseOrganizationId,
              organizationName: purchaseOrganizationName,
            }
          : null;
      },
    },
  ],
  events: {
    update: ({ name, record }) => {
      switch (name) {
        case 'countryId':
          record.set({
            regionId: null,
            cityId: null,
          });
          break;
        case 'regionId':
          record.set({
            cityId: null,
          });
          break;
        default:
          break;
      }
    },
  },
});

export { getCategoryMaterialDS };

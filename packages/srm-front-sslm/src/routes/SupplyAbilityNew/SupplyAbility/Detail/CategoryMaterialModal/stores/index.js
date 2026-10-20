/*
 * @Date: 2023-10-24 15:23:43
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

// 推荐物料/品类信息
const getCategoryMaterialDS = () => ({
  selection: false,
  pageSize: 10,
  autoCreate: true,
  fields: [
    {
      name: 'supplyFlag',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.supplyFlag`).d('是否可供'),
      type: 'string',
      lookupCode: 'HPFM.FLAG',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.adapterProducts`).d('适配产品'),
      name: 'adapterProducts',
    },
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.countryIdMeaning').d('服务国家'),
      name: 'countryLov',
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      ignore: 'always',
      noCache: true,
      textField: 'countryName',
    },
    {
      name: 'countryIdMeaning',
      bind: 'countryLov.countryName',
    },
    {
      name: 'countryId',
      bind: 'countryLov.countryId',
    },
    {
      name: 'countryCode',
      bind: 'countryLov.countryCode',
    },
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.regionIdMeaning').d('服务地区'),
      name: 'regionLov',
      type: 'object',
      lovCode: 'HPFM.REGION',
      ignore: 'always',
      noCache: true,
      textField: 'regionName',
      dynamicProps: {
        disabled: ({ record }) => !record.get('countryLov')?.countryId,
        lovPara: ({ record }) => {
          return {
            countryId: record.get('countryId'),
          };
        },
      },
    },
    {
      name: 'regionIdMeaning',
      bind: 'regionLov.regionName',
    },
    {
      name: 'regionId',
      bind: 'regionLov.regionId',
    },
    {
      name: 'regionCode',
      bind: 'regionLov.regionCode',
    },
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.cityIdMeaning').d('服务城市'),
      name: 'cityLov',
      type: 'object',
      lovCode: 'HPFM.REGION',
      ignore: 'always',
      noCache: true,
      textField: 'regionName',
      dynamicProps: {
        disabled: ({ record }) => !record.get('regionLov')?.regionId,
        lovPara: ({ record }) => {
          return {
            parentRegionId: record.get('regionId'),
          };
        },
      },
    },
    {
      name: 'cityIdMeaning',
      bind: 'cityLov.regionName',
    },
    {
      name: 'cityId',
      bind: 'cityLov.regionId',
    },
    {
      name: 'cityIdCode',
      bind: 'cityLov.regionCode',
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
      transformRequest: value => value && value.map(n => n.organizationId).join(','),
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
      name: 'purchaseOrganizationLov',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.PURORG',
      ignore: 'always',
      textField: 'organizationName',
    },
    {
      name: 'purchaseOrganizationCode',
      bind: 'purchaseOrganizationLov.organizationCode',
    },
    {
      name: 'purchaseOrganizationName',
      bind: 'purchaseOrganizationLov.organizationName',
    },
    {
      name: 'purchaseOrganizationId',
      bind: 'purchaseOrganizationLov.purchaseOrgId',
    },
  ],
});

export { getCategoryMaterialDS };

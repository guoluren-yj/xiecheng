import intl from 'utils/intl';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

const treeTb = ({ countryId }) => ({
  autoQuery: true,
  autoCreate: false,
  selection: false,
  dataToJSON: 'dirty',
  parentField: 'parentRegionId',
  idField: 'regionId',
  expandField: 'expand',
  primaryKey: 'regionId',
  paging: false,
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MDM}/v1/${tenantId}/regional-mapping/lazy-tree`,
        method: 'GET',
        data: filterNullValueObject({
          countryId,
          regionId: data?.parentRegionId,
        }),
      };
    },
  },
  fields: [
    {
      label: intl.get('hpfm.region.model.region.regionCode').d('区域代码'),
      name: 'regionCode',
      disabled: true,
    },
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'actions',
    },
    {
      label: intl.get('hpfm.region.model.region.regionName').d('区域名称'),
      name: 'regionName',
      disabled: true,
    },
    {
      name: 'standardRegionCode',
      label: intl.get('hpfm.region.model.region.standardRegionCode').d('国标代码'),
    },
    {
      label: intl.get('smdm.regionalMapping.entity.region.esRegionCode').d('映射区域代码'),
      name: 'esRegionCode',
      validator: (value) => {
        if (value) {
          const reg = /^[a-zA-Z][0-9a-zA-Z_]*$/;
          if (!reg.test(value)) {
            return intl
              .get(`hpfm.country.model.common.esRegionCodeCheck`)
              .d('映射区域代码不能输入汉字');
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
      trim: 'both',
      required: true,
    },
    {
      label: intl.get('smdm.regionalMapping.entity.region.esRegionName').d('映射区域名称'),
      name: 'esRegionName',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get('hzero.common.common.status').d('状态'),
      name: 'status',
      disabled: true,
    },
  ],
});

const tbDs = ({ countryId }) => ({
  autoQuery: true,
  autoCreate: false,
  selection: false,
  dataToJSON: 'dirty',
  pageSize: 20,
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MDM}/v1/${tenantId}/regional-mapping/list`,
        method: 'GET',
        data: filterNullValueObject({
          countryId,
          ...data,
          customizeUnitCode: 'SMDM_REGIONAL_MAP.DETAIL_LIST_FILTER',
        }),
      };
    },
  },
  fields: [
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'actions',
    },
    {
      label: intl.get('hpfm.region.model.region.regionCode').d('区域代码'),
      name: 'regionCode',
      disabled: true,
    },
    {
      label: intl.get('hpfm.region.model.region.regionName').d('区域名称'),
      name: 'regionName',
      disabled: true,
    },
    {
      name: 'standardRegionCode',
      label: intl.get('hpfm.region.model.region.standardRegionCode').d('国标代码'),
    },
    {
      label: intl.get('smdm.regionalMapping.entity.region.esRegionCode').d('映射区域代码'),
      name: 'esRegionCode',
      trim: 'both',
      validator: (value) => {
        if (value) {
          const reg = /^[^\u4e00-\u9fa5]+$/;
          if (!reg.test(value)) {
            return intl
              .get(`hpfm.country.model.common.esRegionCodeCheck`)
              .d('映射区域代码不能输入汉字');
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
      required: true,
    },
    {
      label: intl.get('smdm.regionalMapping.entity.region.esRegionName').d('映射区域名称'),
      name: 'esRegionName',
      required: true,
    },
    {
      label: intl.get('hzero.common.common.status').d('状态'),
      name: 'status',
      disabled: true,
    },
  ],
});

const headDs = ({ countryId }) => ({
  autoQuery: true,
  autoCreate: false,
  selection: false,
  dataToJSON: 'all',
  transport: {
    read: () => {
      return {
        url: `${SRM_MDM}/v1/${tenantId}/countrys`,
        method: 'GET',
        data: filterNullValueObject({
          countryId,
        }),
      };
    },
    tls: ({ name }) => {
      if (name === 'countryName') {
        debugger;
        return {
          url: `${SRM_MDM}/v1/${tenantId}/countrys/cusz/multi-language`,
          method: 'GET',
          data: { countryId, customizeUnitCode: 'SMDM_REGIONAL_MAP.FILTER' },
        };
      }
    },
  },
  fields: [
    {
      name: 'countryCode',
      disabled: true,
      label: intl.get('hpfm.country.model.country.countryCode').d('国家/地区代码'),
    },
    {
      name: 'countryName',
      type: 'intl',
      disabled: true,
      label: intl.get('hpfm.country.model.country.countryName').d('国家/地区名称'),
    },
    {
      name: 'countryMapperName',
      type: 'intl',
      trim: 'both',
      required: true,
      label: intl.get('hpfm.country.model.country.countryMapperName').d('映射国家/地区名称'),
    },
    {
      name: 'countryMapperCode',
      required: true,
      // validator: (value) => {
      //   if (value) {
      //     const reg = /^[a-zA-Z][0-9a-zA-Z_]*$/;
      //     if (!reg.test(value)) {
      //       return intl
      //         .get(`hpfm.country.model.common.countryMapperCode`)
      //         .d('请输入字母开头，字母/数字/下划线组合的映射国家/地区代码');
      //     } else {
      //       return true;
      //     }
      //   } else {
      //     return true;
      //   }
      // },
      trim: 'both',
      label: intl.get('hpfm.country.model.country.countryMapperCode').d('映射国家/地区代码'),
    },
    {
      name: 'mapperStatus',
      label: intl.get('hpfm.country.model.country.mapperStatus').d('映射状态'),
    },
  ],
});

const lineCurrentDs = () => ({
  autoQuery: true,
  autoCreate: false,
  selection: false,
  dataToJSON: 'all',
  fields: [
    {
      label: intl.get('hpfm.region.model.region.regionCode').d('区域代码'),
      name: 'regionCode',
      disabled: true,
    },
    {
      label: intl.get('hpfm.region.model.region.regionName').d('区域名称'),
      name: 'regionName',
      type: 'intl',
      disabled: true,
    },
    {
      name: 'standardRegionCode',
      label: intl.get('hpfm.region.model.region.standardRegionCode').d('国标代码'),
    },
    {
      label: intl.get('smdm.regionalMapping.entity.region.esRegionCode').d('映射区域代码'),
      name: 'esRegionCode',
      validator: (value) => {
        if (value) {
          const reg = /^[^\u4e00-\u9fa5]+$/;
          if (!reg.test(value)) {
            return intl
              .get(`hpfm.country.model.common.esRegionCodeCheck`)
              .d('映射区域代码不能输入汉字');
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
      trim: 'both',
      required: true,
    },
    {
      label: intl.get('smdm.regionalMapping.entity.region.esRegionName').d('映射区域名称'),
      name: 'esRegionName',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get('smdm.regionalMapping.status').d('映射状态'),
      name: 'status',
      disabled: true,
    },
  ],
});

export { treeTb, tbDs, headDs, lineCurrentDs };

// import moment from 'moment';
import intl from 'utils/intl';
import { CODE_UPPER } from 'utils/regExp';
import { SRM_MDM } from '_utils/config';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const wholeDs = () => ({
  pageSize: 20,
  autoQuery: true,
  cacheSelection: true,
  primaryKey: 'countryId',
  fields: [
    {
      name: 'countryCode',
      label: intl.get('hpfm.country.model.country.countryCode').d('国家/地区代码'),
    },
    {
      name: 'countryId',
    },
    {
      name: 'operation',
      label: intl.get(`hzero.common.option`).d('操作'),
    },
    {
      name: 'countryName',
      type: 'intl',
      label: intl.get('hpfm.country.model.country.countryName').d('国家/地区名称'),
    },
    {
      name: 'countryMapperName',
      type: 'intl',
      label: intl.get('hpfm.country.model.country.countryMapperName').d('映射国家/地区名称'),
    },
    {
      name: 'countryMapperCode',
      pattern: CODE_UPPER,
      label: intl.get('hpfm.country.model.country.countryMapperCode').d('映射国家/地区代码'),
    },
    {
      name: 'mapperStatus',
      label: intl.get('hzero.common.common.status').d('状态'),
    },
  ],
  // queryFields: [
  //   {
  //     name: 'countryCode',
  //     labelWidth: '150',
  //     label: intl.get('hpfm.country.model.country.countryCode').d('国家/地区代码'),
  //   },
  //   {
  //     name: 'countryName',
  //     labelWidth: '150',
  //     label: intl.get('hpfm.country.model.country.countryName').d('国家/地区名称'),
  //   },
  //   {
  //     name: 'countryMapperCode',
  //     labelWidth: '150',
  //     label: intl.get('hpfm.country.model.country.countryMapperCode').d('映射国家/地区代码'),
  //   },
  //   {
  //     name: 'countryMapperName',
  //     labelWidth: '150',
  //     label: intl.get('hpfm.country.model.country.countryMapperName').d('映射国家/地区名称'),
  //   },
  //   {
  //     name: 'mapperStatus',
  //     labelWidth: '150',
  //     lookupCode: 'SCEC.REGION_ASSOCIATION_STATE',
  //     label: intl.get('hpfm.country.model.country.mapperStatus').d('映射状态'),
  //   },
  // ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MDM}/v1/${organizationId}/countrys`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
          customizeUnitCode: 'SMDM_REGIONAL_MAP.FILTER',
        }),
      };
    },
  },
});

const formDs = () => ({
  paging: false,
  selection: false,
  autoQuery: true,
  autoCreate: false,
  dataToJSON: 'all',
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
      validator: (value) => {
        if (value) {
          const reg = /^[a-zA-Z][0-9a-zA-Z_]*$/;
          if (!reg.test(value)) {
            return intl
              .get(`hpfm.country.model.common.countryMapperCode`)
              .d('请输入字母开头，字母/数字/下划线组合的映射国家/地区代码');
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
      trim: 'both',
      label: intl.get('hpfm.country.model.country.countryMapperCode').d('映射国家/地区代码'),
    },
    {
      name: 'mapperStatus',
      label: intl.get('hpfm.country.model.country.mapperStatus').d('映射状态'),
    },
  ],
  transport: {
    tls: ({ record, name }) => {
      if (name === 'countryName') {
        return {
          url: `${SRM_MDM}/v1/${organizationId}/countrys/cusz/multi-language`,
          method: 'GET',
          data: { countryId: record?.get('countryId') },
        };
      }
    },
  },
});
export { wholeDs, formDs };

import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { SRM_SWBH } from '../../../utils/config';
/**
 * 菜单搜索
 * @returns
 */
const searchDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'keyword',
      type: 'string',
      label: intl
        .get('srm.common.view.placeholder.KeywordSearch')
        .d('请输入单号、标题、供应商、创建人等关键词搜索'),
    },
  ],
});

/**
 * 综合
 * @returns
 */
const synthesesDS = () => ({
  selection: false,
  autoQuery: false,
  dataToJSON: 'all',
  fields: [
    {
      name: 'companyName',
      label: intl.get(`srm.common.model.common.companyName`).d('公司'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...otherData } = data;
      return {
        url: `${SRM_SWBH}/v1/${getCurrentOrganizationId()}/doc_data_search/maintain`,
        method: 'GET',
        data: filterNullValueObject({
          ...otherData,
          ...params,
        }),
      };
    },
  },
});
const synthesesTableDS = () => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'companyName',
      label: intl.get(`srm.common.model.common.companyName`).d('公司'),
    },
  ],
});
/**
 * 单据
 * @returns
 */
const billHeaderDS = () => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'companyName',
      label: intl.get(`srm.common.model.common.companyName`).d('公司'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, searchBarParams, ...otherData } = data;
      return {
        url: `${SRM_SWBH}/v1/${getCurrentOrganizationId()}/doc_data_search/doc/query`,
        method: 'GET',
        data: filterNullValueObject({
          ...searchBarParams,
          ...otherData,
          ...params,
        }),
      };
    },
  },
});

/**
 * 供应商
 * @returns
 */
const supplierDS = () => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'companyName',
      label: intl.get(`srm.common.model.common.companyName`).d('公司'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, searchBarParams, ...otherData } = data;
      return {
        url: `${SRM_SWBH}/v1/${getCurrentOrganizationId()}/doc_data_search/supplier/query`,
        method: 'GET',
        data: filterNullValueObject({
          ...searchBarParams,
          ...otherData,
          ...params,
        }),
      };
    },
  },
});
/**
 * 物料
 * @returns
 */
const matterDS = () => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'companyName',
      label: intl.get(`srm.common.model.common.companyName`).d('公司'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...otherData } = data;
      return {
        url: `${SRM_SWBH}/v1/${getCurrentOrganizationId()}/doc_data_search/item/query`,
        method: 'GET',
        data: filterNullValueObject({
          ...otherData,
          ...params,
        }),
      };
    },
  },
});
export { searchDS, synthesesDS, synthesesTableDS, billHeaderDS, supplierDS, matterDS };

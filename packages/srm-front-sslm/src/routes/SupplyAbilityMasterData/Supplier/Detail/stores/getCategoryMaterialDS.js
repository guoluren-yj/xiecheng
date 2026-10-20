/**
 * 推荐物料/品类-主数据
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getCategoryMaterialDs = () => ({
  primaryKey: 'abilityLineId',
  pageSize: 20,
  selection: false,
  fields: [
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCode`).d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemName`).d('物料描述'),
      name: 'itemName',
    },
    {
      name: 'itemCategoryCode',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`).d('品类代码'),
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategory`).d('品类'),
      name: 'itemCategoryName',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.availableFor`).d('可供'),
      name: 'supplyFlag',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.adapterProducts`).d('适配产品'),
      name: 'adapterProducts',
    },
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.countryIdMeaning').d('服务国家'),
      name: 'countryIdMeaning',
    },
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.regionIdMeaning').d('服务地区'),
      name: 'regionIdMeaning',
    },
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.cityIdMeaning').d('服务城市'),
      name: 'cityIdMeaning',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.dateFrom`).d('有效期从'),
      name: 'dateFrom',
      type: 'date',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至'),
      name: 'dateTo',
      type: 'date',
    },
    {
      label: intl.get(`hzero.common.remark`).d('备注'),
      name: 'remark',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家'),
      name: 'manufacturer',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.lastUpdateUserName`).d('最后更新人'),
      name: 'lastUpdateUserName',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.lastUpdateDate`).d('最后更新日期'),
      name: 'lastUpdateDate',
      type: 'date',
    },
    {
      label: intl.get('hzero.common.upload.modal.title').d('附件'),
      name: 'attachment',
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { queryParam, ...others } = data;
      const { customizeUnitCode, supplyAbilityId, ...otherQueryParam } = queryParam || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-lines/${supplyAbilityId}`,
        method: 'POST',
        params: {
          ...params,
          customizeUnitCode,
        },
        data: {
          ...others,
          ...otherQueryParam,
        },
      };
    },
  },
});

export { getCategoryMaterialDs };

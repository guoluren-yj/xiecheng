/**
 * 推荐物料/品类 - 主数据
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getMasterDataCategoryDs = ({ purchaserCreateFlag = true } = {}) => ({
  primaryKey: 'abilityLineId',
  cacheSelection: true,
  pageSize: 20,
  dataToJSON: 'selected',
  fields: [
    {
      name: 'itemCode',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCode`).d('物料编码'),
    },
    {
      label: intl.get('sslm.common.item.itemName').d('物料名称'),
      name: 'itemName',
    },
    {
      name: 'itemCategoryCode',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`).d('品类代码'),
    },
    {
      label: intl.get('sslm.common.category.categoryName').d('品类名称'),
      name: 'itemCategoryName',
    },
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.availableFor').d('可供'),
      name: 'supplyFlag',
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
      label: intl.get('hzero.common.upload.modal.title').d('附件'),
      name: 'attachment',
    },
    {
      label: intl
        .get(`sslm.supplyAbility.model.supplyAbility.purchasingOrganization`)
        .d('采购组织'),
      name: 'purchaseOrganizationName',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.inventoryOrganization`).d('库存组织'),
      name: 'inventoryOrganizationIdMeaning',
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { queryParam, ...other } = data;
      const { customizeUnitCode = '', ...rest } = queryParam || {};
      const url = purchaserCreateFlag
        ? `${SRM_SSLM}/v1/${organizationId}/supply-abilitys/detail-post`
        : `${SRM_SSLM}/v1/${organizationId}/supply-abilitys/sup/detail-post`;
      return {
        url,
        method: 'POST',
        params: {
          ...params,
          customizeUnitCode,
        },
        data: {
          ...other,
          ...rest,
        },
      };
    },
  },
});

export { getMasterDataCategoryDs };

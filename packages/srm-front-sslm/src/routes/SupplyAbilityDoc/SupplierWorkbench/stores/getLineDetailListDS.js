/**
 * 列表明细DS
 */
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const allCodeList = [
  'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL_LIST.ALL_SEARCH',
  'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_DETAIL_LIST.ALL_LIST',
];

/**
 * 全部 dataSet
 * @returns
 */
const getLineDetailAllDs = () => ({
  primaryKey: 'abilityChangeLineId',
  cacheSelection: true,
  dataToJSON: 'selected',
  pageSize: 20,
  fields: [
    {
      name: 'abilityReqStatus',
      label: intl.get('hzero.common.common.status').d('状态'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'abilityReqNum',
      label: intl.get('sslm.common.model.applicationNumber').d('申请单号'),
    },
    {
      name: 'initiateCampMeaning',
      label: intl.get('sslm.supplyAbilityDoc.model.supplyAbility.reqInitiator').d('申请单发起方'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.common.company').d('公司'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.common.view.common.customer').d('客户'),
    },
    {
      name: 'itemCode',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sslm.common.item.itemName').d('物料名称'),
    },
    {
      name: 'itemCategoryCode',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`).d('品类代码'),
    },
    {
      name: 'itemCategoryName',
      label: intl.get('sslm.common.category.categoryName').d('品类名称'),
    },
    {
      name: 'supplyFlag',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.availableFor').d('可供'),
    },
    {
      name: 'dateFrom',
      type: 'date',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.dateFrom').d('有效期从'),
    },
    {
      name: 'dateTo',
      type: 'date',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.dateTo').d('有效期至'),
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
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家'),
      name: 'manufacturer',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.adapterProducts`).d('适配产品'),
      name: 'adapterProducts',
    },
    {
      label: intl.get(`hzero.common.remark`).d('备注'),
      name: 'remark',
    },
    {
      label: intl.get('hzero.common.upload.modal.title').d('附件'),
      name: 'attachment',
    },
  ],
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-change-lines/sup/all`,
        method: 'POST',
        params: {
          ...params,
          customizeUnitCode: allCodeList.join(','),
        },
      };
    },
  },
});

export { getLineDetailAllDs };

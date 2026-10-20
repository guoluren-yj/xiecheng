/*
 * 主数据（供） 列表ds
 * @Date: 2024-06-20 15:23:43
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const codeList = [
  'SSLM.SUPPLY_ABLILITY_QUERY.SUPPLIER_LIST.SEARCH',
  'SSLM.SUPPLY_ABLILITY_QUERY.SUPPLIER_LIST.TABLE',
];

const getAbilityListDs = () => ({
  primaryKey: 'abilityLineId',
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'supplierCompanyNum',
      label: intl.get('sslm.common.view.company.code').d('公司编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.common.company').d('公司'),
    },
    {
      name: 'stageDescription',
      label: intl.get('sslm.common.view.supplier.stageDescription').d('生命周期阶段'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.supplyAbilityDoc.model.supplyAbility.customer').d('客户'),
    },
    {
      name: 'createUserName',
      label: intl.get('sslm.common.view.creator.name').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('sslm.common.view.created.date').d('创建日期'),
    },
    {
      name: 'lastUpdateUserName',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.lastUpdateUserName').d('最后更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: 'date',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.lastUpdateDate').d('最后更新日期'),
    },
    {
      name: 'itemCode',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.itemName').d('物料描述'),
    },
    {
      name: 'itemCategoryCode',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.itemCategoryCoding').d('品类编码'),
    },
    {
      name: 'itemCategoryName',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.categoryName').d('品类名称'),
    },
    {
      name: 'supplyFlag',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.availableFor`).d('可供'),
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'adapterProducts',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.adapterProducts').d('适配产品'),
    },
    {
      name: 'countryIdMeaning',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.countryIdMeaning').d('服务国家'),
    },
    {
      name: 'regionIdMeaning',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.regionIdMeaning').d('服务地区'),
    },
    {
      name: 'cityIdMeaning',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.cityIdMeaning').d('服务城市'),
    },
    {
      name: 'dateFrom',
      type: 'date',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.dateFrom`).d('有效期从'),
    },
    {
      name: 'dateTo',
      type: 'date',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至'),
    },
    {
      name: 'manufacturer',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家'),
    },
    {
      name: 'remark',
      label: intl.get(`hzero.common.remark`).d('备注'),
    },
  ],
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-abilitys/sup/detail-post`,
        method: 'POST',
        params: {
          ...params,
          customizeUnitCode: codeList.join(','),
        },
      };
    },
  },
});

export default getAbilityListDs;

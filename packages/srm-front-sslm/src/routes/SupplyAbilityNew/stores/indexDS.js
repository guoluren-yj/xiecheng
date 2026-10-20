/*
 * @Date: 2023-10-24 15:23:43
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 供货能力清单
const getAbilityListDS = ({ supplierDimension = 'SUPPLIER', customizeUnitCodeList = [] }) => ({
  primaryKey: supplierDimension === 'SUPPLIER' ? 'supplyAbilityId' : 'abilityLineId',
  cacheSelection: true,
  selection: supplierDimension === 'SUPPLIER' ? false : 'multiple',
  pageSize: 20,
  autoQuery: false,
  fields: [
    {
      name: 'operation',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.operation').d('操作'),
    },
    {
      name: 'supplyReviewStatusMeaning',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.status').d('状态'),
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
    },
    {
      name: 'stageDescription',
      label: intl.get('sslm.common.view.supplier.stageDescription').d('生命周期阶段'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.common.view.company.name').d('公司'),
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
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.inventoryOrganization`).d('库存组织'),
      name: 'inventoryOrganizationMeaning',
      type: 'object',
      lovCode: 'SSLM.INV_ORGANIZATION',
      multiple: true,
      transformResponse: (value, data) => {
        const { inventoryOrganizationMeaning } = data;
        const inventoryOrganizationIdList = [];
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
      name: 'purchaseOrganizationName',
      label: intl
        .get('sslm.supplyAbility.model.supplyAbility.purchasingOrganization')
        .d('采购组织'),
    },
    {
      name: 'manufacturer',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家'),
    },
    {
      name: 'remark',
      label: intl.get(`hzero.common.remark`).d('备注'),
    },
    {
      name: 'quotaRatio',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.quotaRatio`).d('配额'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { queryParam, ...other } = data;
      const supplierFlag = supplierDimension === 'SUPPLIER';
      const method = supplierFlag ? 'GET' : 'POST';
      const url = supplierFlag
        ? `${SRM_SSLM}/v1/${organizationId}/supply-abilitys`
        : `${SRM_SSLM}/v1/${organizationId}/supply-abilitys/detail-post`;
      return {
        url,
        method,
        data: {
          ...other,
          ...queryParam,
        },
        params: {
          ...params,
          ...queryParam,
          customizeUnitCode: customizeUnitCodeList.join(','),
        },
      };
    },
  },
});

// 拓展中供货能力
const getExpandAbilityDS = () => ({
  autoQuery: false,
  pageSize: 20,
  cacheSelection: true,
  primaryKey: 'supplyAbilityExpandId',
  dataToJSON: 'selected',
  fields: [
    {
      name: 'supplyAbilityExpandStatus',
      lookupCode: 'SUPPLY_ABILITY_EXPAND_STATUS',
      label: intl.get('sslm.common.modal.application.status').d('申请状态'),
    },
    {
      name: 'operations',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.operation').d('操作'),
    },
    {
      name: 'expandNum',
      label: intl.get('sslm.common.modal.application.number').d('申请单号'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.common.view.company.companyName').d('公司名称'),
    },
    {
      name: 'createdUserName',
      label: intl.get('sslm.common.view.creator.name').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('sslm.common.view.created.date').d('创建日期'),
    },
    {
      name: 'lastUpdatedUserName',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.lastUpdateUserName').d('最后更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: 'date',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.lastUpdateDate').d('最后更新日期'),
    },
    {
      name: 'operation',
      label: intl.get('sslm.common.button.operationRecords').d('操作记录'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParam, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-expands`,
        method: 'GET',
        data: {
          ...other,
          ...queryParam,
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (!['NEW', 'REJECT'].includes(record.data.supplyAbilityExpandStatus)) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
});

export { getAbilityListDS, getExpandAbilityDS };

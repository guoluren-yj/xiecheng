/**
 * 推荐物料/品类
 */
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const organizationId = getCurrentOrganizationId();

const getCategoryMaterialDs = ({ isEdit } = {}) => ({
  primaryKey: 'abilityChangeLineId',
  cacheSelection: true,
  pageSize: 10,
  autoQuery: false,
  selection: isEdit ? 'multiple' : false,
  forceValidate: true,
  fields: [
    {
      label: intl.get('sslm.common.view.common.operateType').d('操作类型'),
      name: 'operationType',
      type: 'string',
      lookupCode: 'SSLM.ABILITY_OPERATION_TYPE',
      computedProps: {
        disabled: () => true,
      },
    },
    {
      label: intl.get('sslm.supplyAbilityDoc.model.supplyAbility.supItemDesc').d('供方物料描述'),
      name: 'supItemDesc',
      dynamicProps: {
        required: ({ record, dataSet }) =>
          // 业务规则不允许选采购方物料，不是变更类型，字段必填
          !record.get('supItemCategoryDesc') &&
          !dataSet.getState('purchaserFlag') &&
          record.get('operationType') !== '1',
        disabled: ({ record }) => {
          // 类型是变更禁用
          return record.get('operationType') === '1';
        },
      },
    },
    {
      name: 'itemId',
      type: 'object',
      lovCode: 'SMDM.CUSTOMER_ITEM',
      noCache: true,
      textField: 'itemCode',
      dynamicProps: {
        label: ({ dataSet }) => {
          return dataSet.getState('purchaserFlag')
            ? intl.get('sslm.supplyAbility.model.supplyAbility.itemCode').d('物料编码')
            : intl
                .get('sslm.supplyAbilityDoc.model.supplyAbility.purItemCode')
                .d('采方校对物料编码');
        },
        disabled: ({ dataSet, record }) => {
          // 业务规则不允许选采购方物料，字段禁用，允许选采购方物料，但是类型是变更也禁用
          return !dataSet.getState('purchaserFlag') || record.get('operationType') === '1';
        },
        required: ({ record, dataSet }) =>
          !record?.get('itemCategoryId') && dataSet.getState('purchaserFlag'),
        lovPara: ({ record }) => {
          return {
            categoryId: record.get('itemCategoryId')
              ? record.get('itemCategoryId').categoryId
              : null,
          };
        },
      },
      transformRequest: value => value && value.itemId,
      transformResponse: (value, data) => {
        const { itemId, itemCode, itemName } = data;
        return value
          ? {
              itemId,
              itemCode,
              itemName,
            }
          : null;
      },
    },
    {
      name: 'itemCode',
      bind: 'itemId.itemCode',
    },
    {
      name: 'itemName',
      bind: 'itemId.itemName',
      dynamicProps: {
        label: ({ dataSet }) => {
          return dataSet.getState('purchaserFlag')
            ? intl.get('sslm.common.item.itemName').d('物料名称')
            : intl
                .get('sslm.supplyAbilityDoc.model.supplyAbility.purItemName')
                .d('采方校对物料名称');
        },
        disabled: () => true,
      },
    },
    {
      label: intl
        .get('sslm.supplyAbilityDoc.model.supplyAbility.supCategoryDesc')
        .d('供方品类描述'),
      name: 'supItemCategoryDesc',
      dynamicProps: {
        required: ({ record, dataSet }) =>
          // 业务规则不允许选采购方品类，不是变更类型，没维护供方物料名称，字段必填
          !record.get('supItemDesc') &&
          !dataSet.getState('purchaserFlag') &&
          record.get('operationType') !== '1',
        disabled: ({ record }) => {
          // 类型是变更禁用
          return record.get('operationType') === '1';
        },
      },
    },
    {
      name: 'itemCategoryId',
      type: 'object',
      lovCode: 'SSLM.CATEGORY.LEVEL_CONTROL_TREE',
      noCache: true,
      textField: 'categoryCode',
      dynamicProps: {
        label: ({ dataSet }) => {
          return dataSet.getState('purchaserFlag')
            ? intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`).d('品类代码')
            : intl
                .get('sslm.supplyAbilityDoc.model.supplyAbility.purCategoryCode')
                .d('采方校对品类编码');
        },
        disabled: ({ dataSet, record }) => {
          // 业务规则不允许选采购方品类，字段禁用，允许选采购方品类，但是类型是变更也禁用
          return !dataSet.getState('purchaserFlag') || record.get('operationType') === '1';
        },
        required: ({ record, dataSet }) =>
          !record?.get('itemId') && dataSet.getState('purchaserFlag'),
        lovPara: ({ record }) => {
          return {
            enabledFlag: 1,
            itemId: record.get('itemId') ? record.get('itemId').itemId : null,
            businessObjectCode: 'SRM_C_SRM_SSLM_SUPPLY_ABILITY',
          };
        },
      },
      optionsProps: {
        paging: 'server',
        idField: 'categoryId',
        parentIdField: 'parentCategoryId',
        record: {
          dynamicProps: {
            selectable: record => record.get('isCheck') !== false,
          },
        },
      },
      transformRequest: value => value && value.categoryId,
      transformResponse: (value, data) => {
        const { itemCategoryId, itemCategoryCode, itemCategoryName } = data;
        return value
          ? {
              categoryId: itemCategoryId,
              categoryCode: itemCategoryCode,
              categoryName: itemCategoryName,
            }
          : null;
      },
    },
    {
      name: 'itemCategoryCode',
      bind: 'itemCategoryId.categoryCode',
    },
    {
      name: 'itemCategoryName',
      bind: 'itemCategoryId.categoryName',
      dynamicProps: {
        label: ({ dataSet }) => {
          return dataSet.getState('purchaserFlag')
            ? intl.get('sslm.common.category.categoryName').d('品类名称')
            : intl
                .get('sslm.supplyAbilityDoc.model.supplyAbility.purCategoryName')
                .d('采方校对品类名称');
        },
        disabled: () => true,
      },
    },
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.availableFor').d('可供'),
      name: 'supplyFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.dateFrom`).d('有效期从'),
      name: 'dateFrom',
      type: 'date',
      transformRequest: value => value && value.format(DEFAULT_DATE_FORMAT),
      dynamicProps: {
        max: ({ record }) => record.get('dateTo'),
      },
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至'),
      name: 'dateTo',
      type: 'date',
      transformRequest: value => value && value.format(DEFAULT_DATE_FORMAT),
      dynamicProps: {
        min: ({ record }) => record.get('dateFrom'),
      },
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
          const countryDisabled = !record.get('countryId')?.countryId;
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
          const disabled = !record.get('regionId')?.regionId;
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
      label: intl.get('hzero.common.upload.modal.title').d('附件'),
      name: 'attachment',
    },
  ],
  events: {
    update: ({ name, record }) => {
      const { itemId } = record.get(['itemId']);
      switch (name) {
        case 'itemId':
          if (isEmpty(itemId)) {
            record.set({
              itemCategoryId: null,
            });
          } else {
            const { itemCategoryId, itemCategoryCode, itemCategoryName } = itemId;
            record.set({
              itemCategoryId: {
                categoryId: itemCategoryId,
                categoryCode: itemCategoryCode,
                categoryName: itemCategoryName,
              },
            });
          }
          break;
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
  transport: {
    read: ({ data, params }) => {
      const { queryParam, ...other } = data;
      const { customizeUnitCode, abilityLineIds, abilityReqId, ...rest } = queryParam || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-change-lines/${abilityReqId}`,
        method: 'POST',
        params: {
          ...params,
          abilityLineIds,
          customizeUnitCode,
        },
        data: {
          ...other,
          ...rest,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-change-lines`,
        method: 'DELETE',
        data: data && data.map(n => n.abilityChangeLineId),
      };
    },
  },
});

export { getCategoryMaterialDs };

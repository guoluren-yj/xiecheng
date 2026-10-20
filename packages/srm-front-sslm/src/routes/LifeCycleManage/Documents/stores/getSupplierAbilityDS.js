/*
 * @Date: 2022-12-08 15:12:22
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import { isArray } from 'lodash';
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import { hanldeC7nMultipleLovMeaning } from '@/routes/components/utils';
import { abilityTooltip } from '@/routes/components/utils/constants';

const organizationId = getCurrentOrganizationId();

export const getSupplierAbilityDS = () => {
  const tooltipTitle = abilityTooltip();
  return {
    primaryKey: 'supplyRecordId',
    cacheSelection: true,
    forceValidate: true,
    pageSize: 20,
    fields: [
      {
        name: 'itemId',
        type: 'object',
        lovCode: 'SSLM.RELATED_CATEGORY_ITEM',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.itemCode').d('物料编码'),
        dynamicProps: {
          required: ({ record }) => !record.get('itemCategoryId'),
          lovPara: ({ record }) => ({
            categoryId: record.get('itemCategoryId') && record.get('itemCategoryId').categoryId,
          }),
        },
        transformRequest: (value) => value && value.itemId,
        transformResponse: (value, object) =>
          value
            ? {
                itemId: object.itemId,
                itemName: object.itemName,
                itemCode: object.itemCode,
              }
            : null,
      },
      {
        name: 'itemCode',
        bind: 'itemId.itemCode',
      },
      {
        name: 'itemName',
        bind: 'itemId.itemName',
        label: intl.get('sslm.common.item.itemName').d('物料名称'),
      },
      {
        name: 'itemCategoryId',
        type: 'object',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        textField: 'categoryCode',
        valueField: 'categoryId',
        label: intl.get('sslm.common.category.categoryCode').d('品类编码'),
        dynamicProps: {
          required: ({ record }) => !record.get('itemId'),
          lovPara: ({ record }) => ({
            enabledFlag: 1,
            itemId: record.get('itemId') && record.get('itemId').itemId,
            businessObjectCode: 'SRM_C_SRM_SSLM_LIFE_CYCLE',
          }),
        },
        optionsProps: {
          paging: 'server',
          idField: 'categoryId',
          parentField: 'parentCategoryId',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
        transformRequest: (value) => value && value.categoryId,
        transformResponse: (value, object) =>
          value
            ? {
                categoryId: object.itemCategoryId,
                categoryName: object.itemCategoryName,
                categoryCode: object.itemCategoryCode,
              }
            : null,
      },
      {
        name: 'itemCategoryCode',
        bind: 'itemCategoryId.categoryCode',
      },
      {
        name: 'itemCategoryName',
        bind: 'itemCategoryId.categoryName',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.categoryName').d('品类名称'),
      },
      {
        name: 'supplyFlag',
        type: 'boolean',
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
        label: intl.get('sslm.supplyAbility.model.supplyAbility.supplyFlag').d('是否可供'),
      },
      {
        name: 'adapterProducts',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.adapterProducts').d('适配产品'),
      },
      {
        name: 'countryId',
        type: 'object',
        lovCode: 'HPFM.COUNTRY',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.countryIdMeaning').d('服务国家'),
        transformRequest: (value) => value && value.countryId,
        transformResponse: (value, object) =>
          value
            ? {
                countryId: object.countryId,
                countryName: object.countryIdMeaning,
              }
            : null,
      },
      {
        name: 'regionId',
        type: 'object',
        lovCode: 'HPFM.REGION',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.regionIdMeaning').d('服务地区'),
        dynamicProps: {
          disabled: ({ record }) => !record.get('countryId'),
          lovPara: ({ record }) => ({
            countryId: record.get('countryId') && record.get('countryId').countryId,
          }),
        },
        transformRequest: (value) => value && value.regionId,
        transformResponse: (value, object) =>
          value
            ? {
                regionId: object.regionId,
                regionName: object.regionIdMeaning,
              }
            : null,
      },
      {
        name: 'cityId',
        type: 'object',
        lovCode: 'HPFM.REGION',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.cityIdMeaning').d('服务城市'),
        dynamicProps: {
          disabled: ({ record }) => !record.get('regionId'),
          lovPara: ({ record }) => ({
            parentRegionId: record.get('regionId') && record.get('regionId').regionId,
          }),
        },
        transformRequest: (value) => value && value.regionId,
        transformResponse: (value, object) =>
          value
            ? {
                regionId: object.cityId,
                regionName: object.cityIdMeaning,
              }
            : null,
      },
      {
        name: 'validityDate',
        type: 'date',
        ignore: 'always',
        range: ['dateFrom', 'dateTo'],
        label: intl.get('sslm.common.model.field.validityDate').d('有效期'),
        validator: (value) => {
          if (value) {
            const { dateFrom, dateTo } = value;
            if (dateFrom && !dateTo) {
              return intl
                .get('sslm.lifeCycleManage.model.validityDate.selectDateTo')
                .d('请选择有效期至');
            } else if (dateTo && !dateFrom) {
              return intl
                .get('sslm.lifeCycleManage.model.validityDate.selectDateFrom')
                .d('请选择有效期从');
            }
          }
        },
        transformResponse: (value, data) => {
          if (data.dateFrom) {
            return {
              dateFrom: data.dateFrom,
              dateTo: data.dateTo,
            };
          } else {
            return null;
          }
        },
      },
      {
        name: 'dateFrom',
        type: 'date',
        transformRequest: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'dateTo',
        type: 'date',
        transformRequest: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'supplyStatus',
        lookupCode: 'SSLM.SUPPLYING_STATUS',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.supplyStatus').d('可供状态'),
        help: tooltipTitle.supplyStatusTip,
      },
      {
        name: 'psaEvaluationLevel',
        lookupCode: 'SSLM.EVALUATION_LEVEL',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.psaEvaluationLevel').d('PSA评级'),
        help: tooltipTitle.psaTip,
      },
      {
        name: 'psaEvaluationScore',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.psaEvaluationScore').d('PSA评分'),
        help: tooltipTitle.psaScoreTip,
      },
      {
        name: 'psaFinishDate',
        type: 'date',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.psaFinishDate').d('PSA完成时间'),
        help: tooltipTitle.psaFinishDate,
      },
      {
        name: 'spaEvaluationLevel',
        lookupCode: 'SSLM.EVALUATION_LEVEL',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.spaLevel').d('SPA评级'),
        help: tooltipTitle.spaTip,
      },
      {
        name: 'spaEvaluationScore',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.spaScore').d('SPA评分'),
        help: tooltipTitle.spaScore,
      },
      {
        name: 'spaFinishDate',
        type: 'date',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.spaFinishDate').d('SPA完成时间'),
        help: tooltipTitle.spaFinishDate,
      },
      {
        name: 'evaluateRemark',
        label: intl.get('sslm.common.model.evaluateRemark').d('评价信息'),
      },
      {
        name: 'inventoryOrganizationId',
        type: 'object',
        lovCode: 'SSLM.INV_ORGANIZATION',
        multiple: true,
        label: intl
          .get('sslm.supplyAbility.model.supplyAbility.inventoryOrganization')
          .d('库存组织'),
        transformRequest: (value) =>
          value && isArray(value) && value.map((n) => n.organizationId).join(','),
        transformResponse: (_, object) =>
          object && hanldeC7nMultipleLovMeaning(object.inventoryOrganizationMeaning),
      },
      {
        name: 'purchaseOrganizationId',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.PURORG',
        label: intl
          .get('sslm.supplyAbility.model.supplyAbility.purchasingOrganization')
          .d('采购组织'),
        transformRequest: (value) => value && value.purchaseOrgId,
        transformResponse: (value, object) =>
          value
            ? {
                purchaseOrgId: object.purchaseOrganizationId,
                purchaseOrganizationCode: object.purchaseOrganizationCode,
                purchaseOrganizationName: object.purchaseOrganizationName,
              }
            : null,
      },
      {
        name: 'purchaseOrganizationCode',
        bind: 'purchaseOrganizationId.organizationCode',
      },
      {
        name: 'purchaseOrganizationName',
        bind: 'purchaseOrganizationId.organizationName',
      },
      {
        name: 'manufacturer',
        label: intl.get('sslm.supplyAbility.model.supplyAbility.manufacturer').d('生产厂家'),
      },
      {
        name: 'attachment',
        label: intl.get('hzero.common.upload.modal.title').d('附件'),
      },
    ],
    events: {
      update: ({ name, record, value }) => {
        switch (name) {
          case 'itemId': {
            const newItemCategoryId =
              value && value.categoryId
                ? {
                    categoryId: value.categoryId,
                    categoryName: value.categoryName,
                    categoryCode: value.categoryCode,
                  }
                : null;
            record.set({
              itemCategoryId: newItemCategoryId,
            });
            break;
          }
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
          case 'validityDate':
            record.set({
              dateFrom: value ? value.dateFrom : null,
              dateTo: value ? value.dateTo : null,
            });
            break;
          default:
            break;
        }
      },
    },
    transport: {
      read: ({ dataSet }) => {
        const queryParams = dataSet?.parent?.getQueryParameter('queryParmas') || {};
        const customizeUnitCode = dataSet.getQueryParameter('customizeUnitCode');
        const { requisitionId, ...others } = queryParams;
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/life-cycle-change-supply-recs/${requisitionId}`,
          method: 'GET',
          data: { ...others, customizeUnitCode },
        };
      },
      destroy: ({ dataSet, data }) => {
        const queryParams = dataSet?.parent?.getQueryParameter('queryParmas') || {};
        const customizeUnitCode = dataSet.getQueryParameter('customizeUnitCode');
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/life-cycle-change-supply-recs/${queryParams.requisitionId}`,
          method: 'DELETE',
          data: data && data.map((n) => n.supplyRecordId),
          params: { customizeUnitCode },
        };
      },
    },
  };
};

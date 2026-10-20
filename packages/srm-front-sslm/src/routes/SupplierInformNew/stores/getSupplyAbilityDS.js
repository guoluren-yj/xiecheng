/*
 * @Date: 2023-04-11 16:55:29
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const organizationId = getCurrentOrganizationId();
// 行附件个性化单元
const customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ABILITY_LINE_ATTACHMENT';

export const getSupplyAbilityDS = ({ compareFlag = false } = {}) => ({
  forceValidate: true,
  paging: !compareFlag, // 对比不分页
  fields: [
    {
      name: 'itemCode',
      type: 'object',
      textField: 'itemCode',
      lovCode: 'SMDM.CUSTOMER_ITEM',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCode`).d('物料编码'),
      dynamicProps: {
        required: ({ record }) => !record.get('categoryId'),
      },
      transformRequest: value => value && value.itemCode,
      transformResponse: (value, data) => {
        const { itemId, itemCode, itemName } = data;
        return value ? { itemId, itemCode, itemName } : null;
      },
    },
    {
      name: 'itemId',
      bind: 'itemCode.itemId',
    },
    {
      name: 'itemName',
      bind: 'itemCode.itemName',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemName`).d('物料描述'),
    },
    {
      name: 'categoryCode',
      type: 'object',
      textField: 'categoryCode',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`).d('品类代码'),
      dynamicProps: {
        required: ({ record }) => !record.get('itemId'),
      },
      lovPara: {
        enabledFlag: 1,
        tenantId: organizationId,
        businessObjectCode: 'SRM_C_SRM_SSLM_SUPPLY_ABILITY',
      },
      optionsProps: {
        paging: 'server',
        idField: 'categoryId',
        parentField: 'parentCategoryId',
        record: {
          dynamicProps: {
            selectable: record => record.get('isCheck') !== false,
          },
        },
      },
      transformRequest: value => value && value.categoryCode,
      transformResponse: (value, data) => {
        const { categoryId, categoryCode, categoryName } = data;
        return value ? { categoryId, categoryCode, categoryName } : null;
      },
    },
    {
      name: 'categoryId',
    },
    {
      name: 'categoryName',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategoryDesc`).d('品类描述'),
    },
    {
      name: 'supplyFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.supplyFlag`).d('是否可供'),
    },
    {
      name: 'oneTimeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.oneTimeFlag`).d('是否一次性供货'),
    },
    {
      name: 'adapterProducts',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.adapterProducts`).d('适配产品'),
    },
    {
      name: 'countryId',
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.countryIdMeaning').d('服务国家'),
      transformRequest: value => value && value.countryId,
      transformResponse: (value, data) => {
        const { countryId, countryIdMeaning } = data;
        return value ? { countryId, countryName: countryIdMeaning } : null;
      },
    },
    {
      name: 'regionId',
      type: 'object',
      lovCode: 'HPFM.REGION',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.regionIdMeaning').d('服务地区'),
      dynamicProps: {
        disabled: ({ record }) => !record.get('countryId')?.countryId,
        lovPara: ({ record }) => ({ countryId: record.get('countryId')?.countryId }),
      },
      transformRequest: value => value && value.regionId,
      transformResponse: (value, data) => {
        const { regionId, regionIdMeaning } = data;
        return value ? { regionId, regionName: regionIdMeaning } : null;
      },
    },
    {
      name: 'cityId',
      type: 'object',
      lovCode: 'HPFM.REGION',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.cityIdMeaning').d('服务城市'),
      dynamicProps: {
        disabled: ({ record }) => !record.get('regionId')?.regionId,
        lovPara: ({ record }) => ({ parentRegionId: record.get('regionId')?.regionId }),
      },
      transformRequest: value => value && value.regionId,
      transformResponse: (value, data) => {
        const { cityId, cityIdMeaning } = data;
        return value ? { regionId: cityId, regionName: cityIdMeaning } : null;
      },
    },
    {
      name: 'dateFrom',
      type: 'date',
      max: 'dateTo',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.dateFrom`).d('有效期从'),
      dynamicProps: {
        required: ({ record }) => record.get('dateTo'),
      },
      transformRequest: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'dateTo',
      type: 'date',
      min: 'dateFrom',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至'),
      dynamicProps: {
        required: ({ record }) => record.get('dateFrom'),
      },
      transformRequest: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'inventoryOrganizationId',
      type: 'object',
      multiple: !compareFlag,
      lovCode: 'SSLM.INV_ORGANIZATION',
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.inventoryOrganization`).d('库存组织'),
      transformRequest: value => value && value.map(n => n.organizationId).join(','),
      transformResponse: (_, data) => data.invOrgIdMeaning || [],
    },
    {
      name: 'purchaseOrganizationId',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.PURORG',
      label: intl
        .get(`sslm.supplyAbility.model.supplyAbility.purchasingOrganization`)
        .d('采购组织'),
      transformRequest: value => value && value.purchaseOrgId,
      transformResponse: (value, data) => {
        const { purchaseOrganizationId, purchaseOrganizationCode, purchaseOrganizationName } = data;
        return value
          ? {
              purchaseOrgId: purchaseOrganizationId,
              organizationCode: purchaseOrganizationCode,
              organizationName: purchaseOrganizationName,
            }
          : null;
      },
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
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家'),
    },
    {
      name: 'attachment',
      label: intl.get('hzero.common.upload.modal.label').d('附件'),
    },
    {
      name: 'remark',
      label: intl.get(`hzero.common.remark`).d('备注'),
    },
  ],
  events: {
    create: ({ dataSet, record }) => {
      const { changeReqId } = dataSet.getState('dsState') || {};
      record.set({ changeReqId });
    },
    update: ({ name, value, record }) => {
      switch (name) {
        case 'itemCode':
          record.set('categoryCode', {
            categoryId: value ? value.itemCategoryId : null,
            categoryCode: value ? value.itemCategoryCode : null,
            categoryName: value ? value.itemCategoryName : null,
          });
          break;
        case 'categoryCode':
          record.set({
            categoryId: value ? value.categoryId : null,
            categoryName: value ? value.categoryName : null,
          });
          break;
        case 'countryId':
          if (!value) {
            record.set({
              cityId: null,
              regionId: null,
            });
          }
          break;
        case 'regionId':
          if (!value) {
            record.set({
              cityId: null,
            });
          }
          break;
        default:
          break;
      }
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const { changeReqId } = dataSet.getState('dsState') || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-change-ability-lns`,
        method: 'GET',
        data: {
          changeReqId,
          customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SUPPLY_ABILITY',
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-change-ability-lns`,
        method: 'DELETE',
        data: data && data.map(n => n.abilityLineId),
        params: { customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SUPPLY_ABILITY' },
      };
    },
  },
});

export const getAttachmentModalDS = (isEdit, abilityLineId, compareFlag = false) => ({
  primaryKey: 'attachmentItemId',
  autoQuery: !compareFlag,
  forceValidate: true,
  cacheSelection: true,
  paging: !compareFlag,
  selection: isEdit ? 'multiple' : false,
  fields: [
    {
      label: intl.get('sslm.common.view.attachment.name').d('附件名称'),
      name: 'attachmentDesc',
    },
    {
      label: intl.get('sslm.common.view.attachment.size').d('附件大小(MB)'),
      name: 'attachmentSize',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.realName`).d('上传人'),
      name: 'uploadUserName',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.uploadDate`).d('上传时间'),
      name: 'uploadDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.attachmentType`).d('文件类型'),
      name: 'attachmentType',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.maturityDate`).d('文件到期日'),
      name: 'dueDate',
      type: 'dateTime',
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
    },
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'option',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/sup-change-ability-ln-atts`,
      method: 'GET',
      data: {
        abilityLineId,
        customizeUnitCode,
      },
    },
    submit: {
      url: `${SRM_SSLM}/v1/${organizationId}/sup-change-ability-ln-atts`,
      method: 'POST',
      params: { customizeUnitCode },
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-change-ability-ln-atts`,
        method: 'DELETE',
        data: data && data.map(n => n.attachmentLineId),
        params: { customizeUnitCode },
      };
    },
  },
});

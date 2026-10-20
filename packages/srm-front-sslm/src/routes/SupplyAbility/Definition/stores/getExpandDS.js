/*
 * getExpandDS - 拓展中供货能力相关DS
 * @Date: 2022-02-16 19:48:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 基础信息ds
const getBaseInfo = ({ supplyAbilityExpandId }) => ({
  fields: [
    {
      name: 'expandNum',
      disabled: true,
      label: intl.get('sslm.common.modal.application.number').d('申请单号'),
    },
    {
      name: 'supplyAbilityExpandStatus',
      disabled: true,
      lookupCode: 'SUPPLY_ABILITY_EXPAND_STATUS',
      label: intl.get('sslm.common.modal.application.status').d('申请状态'),
    },
    {
      name: 'sourceCompanyNames',
      disabled: true,
      label: intl.get('sslm.common.view.company.sourceCompanyNames').d('来源公司'),
    },
    {
      name: 'companyName',
      disabled: true,
      label: intl.get('sslm.common.view.company.companyName').d('公司名称'),
    },
    {
      name: 'supplierCompanyNum',
      disabled: true,
      label: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      disabled: true,
      label: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
    },
    {
      name: 'createdUserName',
      disabled: true,
      label: intl.get('sslm.common.view.creator.name').d('创建人'),
    },
    {
      name: 'creationDate',
      disabled: true,
      type: 'dateTime',
      label: intl.get('hzero.common.date.creation').d('创建时间'),
    },
    {
      name: 'lastUpdatedUserName',
      disabled: true,
      label: intl.get('sslm.supplyAbility.model.supplyAbility.lastUpdateUserName').d('最后更新人'),
    },
    {
      name: 'lastUpdateDate',
      disabled: true,
      type: 'dateTime',
      label: intl.get('sslm.common.model.time.lastUpdateTime').d('最后更新时间'),
    },
    {
      name: 'remark',
      label: intl.get('hzero.common.remark').d('备注'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-expands/${supplyAbilityExpandId}`,
      method: 'GET',
      params: {
        customizeUnitCode:
          'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_BASE_INFO,SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_CATEGORY_LIST',
      },
    },
    submit: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-expands`,
        method: 'PUT',
        data: data && data[0],
        params: {
          ...params,
          customizeUnitCode:
            'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_BASE_INFO,SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_CATEGORY_LIST',
        },
      };
    },
  },
});

// 拓展中品类物料行
const getCategoryList = ({ supplyAbilityExpandId }) => ({
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
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`).d('品类代码'),
      name: 'itemCategoryCode',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategory`).d('品类'),
      name: 'itemCategoryName',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.supplyFlag`).d('是否可供'),
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
    },
    {
      label: intl.get(`hzero.common.remark`).d('备注'),
      name: 'remark',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.quotaRatio`).d('配额'),
      name: 'quotaRatio',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.inventoryOrganization`).d('库存组织'),
      name: 'inventoryOrganizationIdMeaning',
    },
    {
      label: intl
        .get(`sslm.supplyAbility.model.supplyAbility.purchasingOrganization`)
        .d('采购组织'),
      name: 'purchaseOrganizationName',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家'),
      name: 'manufacturer',
    },
    {
      label: intl.get('sslm.common.view.creator.name').d('创建人'),
      name: 'createdUserName',
    },
    {
      label: intl.get('hzero.common.date.creation').d('创建时间'),
      name: 'creationDate',
      type: 'dateTime',
    },
    {
      label: intl.get('hzero.common.upload.modal.label').d('附件'),
      name: 'attachment',
    },
  ],
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-expand-lines`,
        method: 'GET',
        params: {
          ...params,
          tenantId: organizationId,
          supplyAbilityExpandId,
          customizeUnitCode: 'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_CATEGORY_LIST',
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-expand-lines`,
        method: 'DELETE',
        data: data.map(n => n.abilityExpandLineId),
        params: {
          customizeUnitCode: 'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_CATEGORY_LIST',
        },
      };
    },
  },
});

// 拓展至其他子公司
const getExpanCompany = ({ companyId, supplierCompanyId }) => ({
  autoQuery: true,
  cacheSelection: true,
  primaryKey: 'companyId',
  dataToJSON: 'selected',
  queryFields: [
    {
      name: 'companyNum',
      label: intl.get(`sslm.common.view.company.code`).d('公司编码'),
    },
    {
      name: 'companyName',
      label: intl.get(`sslm.common.view.company.companyName`).d('公司名称'),
    },
  ],
  fields: [
    {
      name: 'companyNum',
      label: intl.get(`sslm.common.view.company.code`).d('公司编码'),
    },
    {
      name: 'companyName',
      label: intl.get(`sslm.common.view.company.companyName`).d('公司名称'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-expands/companies`,
        method: 'GET',
        data: { ...data, companyId, supplierCompanyId },
      };
    },
  },
});

// 查看拓展中品类物料行附件
const getExpanAttachment = ({ supplyAbilityExpandLineId }) => ({
  autoQuery: true,
  selection: false,
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
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
    },
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'operation',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-expand-line-att-lns`,
      method: 'GET',
      data: { supplyAbilityExpandLineId },
    },
  },
});

export { getBaseInfo, getCategoryList, getExpanCompany, getExpanAttachment };

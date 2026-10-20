/*
 * @Date: 2023-10-24 15:23:43
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import { queryItemCategory } from '@/services/supplyAbilityService';

const organizationId = getCurrentOrganizationId();
const userOrganizationId = getUserOrganizationId();

// 供货能力清单基础信息
const getBasicsDS = ({ supplyAbilityId, isCreat }) => ({
  selection: false,
  autoCreate: true,
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'supplierNameLov',
      label: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
      type: 'object',
      lovCode: 'SSLM.USER_AUTH.SUPPLIER',
      ignore: 'always',
      required: isCreat,
      noCache: true,
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierNameLov.supplierCompanyId',
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierNameLov.supplierCompanyName',
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierNameLov.supplierTenantId',
    },
    {
      name: 'supplyListDimensionCode',
      bind: 'supplierNameLov.supplyListDimensionCode',
    },
    {
      name: 'supplierCompanyNum',
      bind: 'supplierNameLov.supplierCompanyCode',
      label: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
    },
    {
      name: 'companyLov',
      type: 'object',
      label: intl.get('sslm.common.view.company.name').d('公司'),
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      dynamicProps: {
        required: ({ record }) => record.get('supplyListDimensionCode') === 'COMPANY',
        lovPara: ({ record }) => {
          return {
            organizationId: userOrganizationId,
            supplierCompanyId: record.get('supplierCompanyId'),
          };
        },
      },
    },
    {
      name: 'companyId',
      bind: 'companyLov.companyId',
    },
    {
      name: 'companyName',
      bind: 'companyLov.companyName',
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
      name: 'remark',
      label: intl.get(`hzero.common.remark`).d('备注'),
    },
    {
      name: 'documentDimension',
      label: intl.get('sslm.common.model.field.docDimension').d('单据维度'),
      disabled: true,
    },
    {
      name: 'stageDescription',
      label: intl.get('sslm.supplyAbility.model.supplyAbility.supplierLife').d('供应商生命周期'),
      disabled: true,
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParam, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-abilitys/${supplyAbilityId}`,
        method: 'GET',
        data: {
          ...other,
          ...queryParam,
        },
      };
    },
  },
});

// 供货能力清单推荐物料/品类
const getCategoryMaterialDS = ({ supplyAbilityId, isEdit }) => ({
  primaryKey: 'abilityLineId',
  cacheSelection: true,
  pageSize: 10,
  autoQuery: false,
  selection: isEdit ? 'multiple' : false,
  forceValidate: true,
  fields: [
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'supplyReviewStatusMeaning',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCode`).d('物料编码'),
      name: 'itemLov',
      type: 'object',
      lovCode: 'SMDM.CUSTOMER_ITEM',
      ignore: 'always',
      noCache: true,
      textField: 'itemCode',
      dynamicProps: {
        disabled: ({ record }) => ['REVIEWING'].includes(record?.get('supplyReviewStatus')),
        required: ({ record }) => !record?.get('itemCategoryId'),
        lovPara: ({ record }) => {
          return {
            categoryId: record?.get('itemCategoryId') || null,
          };
        },
      },
    },
    {
      name: 'itemId',
      bind: 'itemLov.itemId',
    },
    {
      name: 'itemCode',
      bind: 'itemLov.itemCode',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemName`).d('物料描述'),
      name: 'itemName',
      bind: 'itemLov.itemName',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`).d('品类代码'),
      name: 'itemCategoryLov',
      type: 'object',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      ignore: 'always',
      noCache: true,
      textField: 'categoryCode',
      dynamicProps: {
        disabled: ({ record }) => ['REVIEWING'].includes(record?.get('supplyReviewStatus')),
        required: ({ record }) => !record?.get('itemId'),
        lovPara: ({ record }) => {
          return {
            enabledFlag: 1,
            // hzeroUIFlag: 1,
            itemId: record.get('itemId'),
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
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
      },
    },
    {
      name: 'itemCategoryCode',
      bind: 'itemCategoryLov.categoryCode',
    },
    {
      name: 'itemCategoryId',
      bind: 'itemCategoryLov.categoryId',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategory`).d('品类'),
      name: 'itemCategoryName',
      bind: 'itemCategoryLov.categoryName',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.availableFor`).d('可供'),
      name: 'supplyFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      dynamicProps: {
        disabled: ({ record }) => ['REVIEWING'].includes(record?.get('supplyReviewStatus')),
      },
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.adapterProducts`).d('适配产品'),
      name: 'adapterProducts',
      dynamicProps: {
        disabled: ({ record }) => ['REVIEWING'].includes(record?.get('supplyReviewStatus')),
      },
    },
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.countryIdMeaning').d('服务国家'),
      name: 'countryLov',
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      ignore: 'always',
      noCache: true,
      textField: 'countryName',
      dynamicProps: {
        disabled: ({ record }) => ['REVIEWING'].includes(record?.get('supplyReviewStatus')),
      },
    },
    {
      name: 'countryIdMeaning',
      bind: 'countryLov.countryName',
    },
    {
      name: 'countryId',
      bind: 'countryLov.countryId',
    },
    {
      name: 'countryCode',
      bind: 'countryLov.countryCode',
    },
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.regionIdMeaning').d('服务地区'),
      name: 'regionLov',
      type: 'object',
      lovCode: 'HPFM.REGION',
      ignore: 'always',
      noCache: true,
      textField: 'regionName',
      dynamicProps: {
        disabled: ({ record }) => {
          const countryDisabled = !record.get('countryLov')?.countryId;
          const statusDisabled = ['REVIEWING'].includes(record?.get('supplyReviewStatus'));
          return countryDisabled || statusDisabled;
        },
        lovPara: ({ record }) => {
          return {
            countryId: record.get('countryId'),
          };
        },
      },
    },
    {
      name: 'regionIdMeaning',
      bind: 'regionLov.regionName',
    },
    {
      name: 'regionId',
      bind: 'regionLov.regionId',
    },
    {
      name: 'regionCode',
      bind: 'regionLov.regionCode',
    },
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.cityIdMeaning').d('服务城市'),
      name: 'cityLov',
      type: 'object',
      lovCode: 'HPFM.REGION',
      ignore: 'always',
      noCache: true,
      textField: 'regionName',
      dynamicProps: {
        disabled: ({ record }) => {
          const countryDisabled = !record.get('regionLov')?.regionId;
          const statusDisabled = ['REVIEWING'].includes(record?.get('supplyReviewStatus'));
          return countryDisabled || statusDisabled;
        },
        lovPara: ({ record }) => {
          return {
            parentRegionId: record.get('regionId'),
          };
        },
      },
    },
    {
      name: 'cityIdMeaning',
      bind: 'cityLov.regionName',
    },
    {
      name: 'cityId',
      bind: 'cityLov.regionId',
    },
    {
      name: 'cityIdCode',
      bind: 'cityLov.regionCode',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.dateFrom`).d('有效期从'),
      name: 'dateFrom',
      type: 'date',
      transformRequest: (value) => value && value.format(DEFAULT_DATE_FORMAT),
      dynamicProps: {
        disabled: ({ record }) => ['REVIEWING'].includes(record?.get('supplyReviewStatus')),
        max: ({ record }) => record.get('dateTo'),
      },
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至'),
      name: 'dateTo',
      type: 'date',
      transformRequest: (value) => value && value.format(DEFAULT_DATE_FORMAT),
      dynamicProps: {
        disabled: ({ record }) => ['REVIEWING'].includes(record?.get('supplyReviewStatus')),
        min: ({ record }) => record.get('dateFrom'),
      },
    },
    {
      label: intl.get(`hzero.common.remark`).d('备注'),
      name: 'remark',
      dynamicProps: {
        disabled: ({ record }) => ['REVIEWING'].includes(record?.get('supplyReviewStatus')),
      },
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.quotaRatio`).d('配额'),
      name: 'quotaRatio',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.inventoryOrganization`).d('库存组织'),
      name: 'inventoryOrganizationId',
      type: 'object',
      lovCode: 'SSLM.INV_ORGANIZATION',
      multiple: true,
      dynamicProps: {
        disabled: ({ record }) => ['REVIEWING'].includes(record?.get('supplyReviewStatus')),
      },
      transformRequest: (value) => value && value.map((n) => n.organizationId).join(','),
      transformResponse: (value, data) => {
        const { inventoryOrganizationMeaning } = data;
        const inventoryOrganizationIdList = [];
        if (inventoryOrganizationMeaning) {
          Object.keys(inventoryOrganizationMeaning).forEach((key) => {
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
      label: intl
        .get(`sslm.supplyAbility.model.supplyAbility.purchasingOrganization`)
        .d('采购组织'),
      name: 'purchaseOrganizationLov',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.PURORG',
      // multiple: true,
      ignore: 'always',
      noCache: true,
      textField: 'organizationName',
      dynamicProps: {
        disabled: ({ record }) => ['REVIEWING'].includes(record?.get('supplyReviewStatus')),
      },
    },
    {
      name: 'purchaseOrganizationCode',
      bind: 'purchaseOrganizationLov.organizationCode',
    },
    {
      name: 'purchaseOrganizationName',
      bind: 'purchaseOrganizationLov.organizationName',
    },
    {
      name: 'purchaseOrganizationId',
      bind: 'purchaseOrganizationLov.purchaseOrgId',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家'),
      name: 'manufacturer',
      dynamicProps: {
        disabled: ({ record }) => ['REVIEWING'].includes(record?.get('supplyReviewStatus')),
      },
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
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.documentType').d('寻源单据类型'),
      name: 'dataSource',
    },
    {
      label: intl.get('sslm.supplyAbility.model.supplyAbility.docNumAndLineNum').d('寻源单据编号'),
      name: 'docNumAndLineNum',
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { queryParam, ...other } = data;
      // 筛选器个性化编码需要传到params（路径上），否则不生效
      const { customizeUnitCode, abilityLineIds, wfParams = {}, ...otherQueryParam } =
        queryParam || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-lines/${supplyAbilityId}`,
        method: 'POST',
        params: {
          ...params,
          customizeUnitCode,
          ...wfParams,
        },
        data: {
          abilityLineIds,
          ...other,
          ...otherQueryParam,
        },
      };
    },
    destroy: ({ data }) => {
      const selectIds = data.map((item) => item.abilityLineId);
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-lines`,
        method: 'DELETE',
        data: selectIds,
      };
    },
  },
  events: {
    update: ({ name, record }) => {
      const { itemId, itemLov, itemCategoryId } = record.get(['itemId', 'itemLov']);
      switch (name) {
        case 'itemLov':
          if (itemLov) {
            queryItemCategory(itemId).then((res) => {
              if (res) {
                const mainCategory = res.filter((n) => n.defaultFlag);
                const { categoryId, categoryCode, categoryName } = mainCategory[0] || {};
                if (!itemCategoryId) {
                  record.set({
                    itemCategoryId: categoryId,
                    itemCategoryCode: categoryCode,
                    itemCategoryName: categoryName,
                  });
                }
              }
            });
          } else {
            record.set({
              itemCategoryLov: undefined,
            });
          }
          break;
        case 'countryLov':
          record.set({
            regionId: undefined,
            regionCode: undefined,
            regionIdMeaning: undefined,
            regionLov: undefined,
            cityId: undefined,
            cityIdMeaning: undefined,
          });
          break;
        case 'regionLov':
          record.set({
            cityId: undefined,
            cityIdMeaning: undefined,
          });
          break;
        default:
          break;
      }
    },
  },
});

// 附件信息
const getAttachmentDS = ({ supplyAbilityId, isEdit = true }) => ({
  autoQuery: false,
  cacheSelection: true,
  pageSize: 10,
  selection: isEdit ? 'multiple' : false,
  fields: [
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.attachmentCode`).d('文件编号'),
      name: 'attachmentCode',
    },
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
      name: 'realName',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.uploadDate`).d('上传时间'),
      name: 'uploadDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.attachmentType`).d('文件类型'),
      name: 'attachmentType',
      required: isEdit,
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.effectiveDate`).d('文件生效期'),
      name: 'effectiveDate',
      type: 'date',
      required: isEdit,
      dynamicProps: {
        max: ({ record }) => record.get('expiryDate'),
      },
      transformRequest: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      transformResponse: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
    },
    {
      label: intl.get(`sslm.supplyAbility.model.supplyAbility.expiryDate`).d('文件失效期'),
      name: 'expiryDate',
      type: 'date',
      required: isEdit,
      dynamicProps: {
        min: ({ record }) => record.get('effectiveDate'),
      },
      transformRequest: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      transformResponse: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
    },
    {
      label: intl.get(`hzero.common.remark`).d('备注'),
      name: 'remark',
    },
    {
      label: intl.get(`hzero.common.option`).d('操作'),
      name: 'option',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParam, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-att-lns/${supplyAbilityId}`,
        method: 'GET',
        data: {
          ...other,
          ...queryParam,
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
  pageSize: 20,
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

export { getBasicsDS, getCategoryMaterialDS, getAttachmentDS, getExpanCompany };

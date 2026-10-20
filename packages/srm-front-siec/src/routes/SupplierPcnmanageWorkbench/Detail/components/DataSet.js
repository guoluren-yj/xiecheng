/**
 * PCN工作台明细页DS
 * @date: 2021-06-08
 * @author: ZYF <yanfengz.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { isNil } from 'lodash';
import { BUCKET_NAME, BUCKET_DIRECTORY } from '@/routes/components/utils/constant';

import { EMAIL } from 'utils/regExp';

const organizationId = getCurrentOrganizationId();
// const tenantId = getUserOrganizationId();
const SRM_SIEC = '/siec';

/**
 * pcn头信息DS
 */
const pcnHeaderInfoDS = (cuxUpdate) => ({
  paging: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'approveMessage',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.approveMessage`).d('审批意见'),
    },
    {
      name: 'pcnNum',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.pcnNum`).d('变更单号'),
      disabled: true,
    },
    {
      name: 'statusCodeMeaning',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.statusCodeMeaning`).d('状态'),
      disabled: true,
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get(`siec.pcnmanageWorkbench.view.creationDate`).d('创建日期'),
      disabled: true,
    },
    {
      name: 'changeCategory',
      label: intl.get('siec.pcnmanageWorkbench.view.changeCategory').d('单据类型'),
      lookupCode: 'SIEC.CHANGE_CATEGORY',
      defaultValue: 'PCN',
    },
    {
      name: 'supplierPrincipal',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.supplierPrincipal`).d('供应方产品负责人'),
    },
    {
      name: 'principalContact',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.principalContact`).d('负责人联系方式'),
      // pattern: PHONE || NOT_CHINA_PHONE,
    },
    {
      name: 'principalEmail',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.principalEmail`).d('负责人邮箱地址'),
      pattern: EMAIL,
    },
    {
      name: 'supplierCompanyLOV',
      type: 'object',
      ignore: 'always',
      lovCode: 'SIEC.COMPANY_CORRESPONDING_SUP',
      textField: 'companyName',
      label: intl.get(`siec.pcnmanageWorkbench.view.supplierCompanyName`).d('供应商'),
      required: true,
      dynamicProps: {
        disabled: ({ record }) => {
          return !record.get('companyId');
        },
        lovPara: ({ record }) => {
          return {
            companyId: record.get('companyId'),
            tenantId: organizationId,
          };
        },
      },
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierCompanyLOV.companyId',
    },
    {
      name: 'supplierCompanyCode',
      bind: 'supplierCompanyLOV.companyNum',
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierCompanyLOV.companyName',
    },
    {
      name: 'supplierTenantId',
      type: 'number',
      bind: 'supplierCompanyLOV.supplierTenantId',
    },
    {
      name: 'companyLOV',
      type: 'object',
      ignore: 'always',
      lovCode: 'SQAM.TENANT.CUSTOMER_COMPANIES',
      label: intl.get(`siec.pcnmanageWorkbench.view.client`).d('客户'),
      required: true,
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'companyId',
      bind: 'companyLOV.companyId',
    },
    {
      name: 'companyCode',
      bind: 'companyLOV.companyNum',
    },
    {
      name: 'companyName',
      bind: 'companyLOV.companyName',
    },
    {
      name: 'effectiveDate',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.effectiveDate`).d('变更生效日期'),
    },
    {
      name: 'typeLOV',
      type: 'object',
      // ignore: 'always',
      lovCode: 'SIEC.CHANGE_TYPE',
      valueField: 'pcnTypeId',
      textField: 'typeName',
      label: intl.get(`siec.pcnmanageWorkbench.view.typeName`).d('变更类型'),
      required: true,
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            changeCategory: record.get('changeCategory'),
          };
        },
      },
      transformResponse: (value, object) =>
        value
          ? {
              value,
              typeCode: object?.typeCode,
              typeName: object?.typeName,
              pcnTypeId: object?.pcnTypeId,
            }
          : null,
      transformRequest: (value) => value?.pcnTypeId,
    },
    {
      name: 'pcnTypeId',
      bind: 'typeLOV.pcnTypeId',
    },
    {
      name: 'typeCode',
      bind: 'typeLOV.typeCode',
    },
    {
      name: 'typeName',
      bind: 'typeLOV.typeName',
    },
    // {
    //   name: 'attachmentUuidTemplate',
    //   type: 'string',
    //   bind: 'typeLOV.attachmentuuidtemplate',
    // },
    // {
    //   name: 'supplierAttachmentUuid',
    //   type: 'string',
    // },
    // {
    //   name: 'attachmentUuid',
    //   type: 'string',
    // },
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.remark`).d('备注'),
    },
    {
      name: 'finalEffectiveDate',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.finalEffectiveDate`).d('最终变更生效日期'),
    },
    // {
    //   name: 'buyerAttachment',
    //   type: 'string',
    //   label: intl.get(`siec.pcnmanageWorkbench.view.buyerAttachment`).d('采购方附件'),
    // },
    {
      name: 'evaluationOpinion',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.evaluationOpinion`).d('评估意见'),
      lookupCode: 'SIEC.PCN_EVALUATION_OPINION',
      multiple: ',',
    },
    {
      name: 'changeResson',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.changeResson`).d('变更原因'),
      required: true,
    },
    {
      name: 'changeContent',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.changeContent`).d('变更内容'),
      required: true,
    },
    {
      name: 'approveMessage',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.approveMessage`).d('审批意见'),
    },
    {
      name: 'recheckApproveMessage',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.approveMessage`).d('审批意见'),
    },
  ],
  transport: {
    read: ({ data: { params = {} } }) => {
      const { pcnHeaderId, statusConfigId } = params;
      if (pcnHeaderId && statusConfigId) {
        return {
          url: `${SRM_SIEC}/v1/${organizationId}/pcn-headers/${pcnHeaderId}/${statusConfigId}`,
          method: 'GET',
          data: { customizeUnitCode: 'SIEC.SUPPIER_PCN_MANAGEWORK_BENCH_DETAI.HEADER' },
        };
      }
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((i) => {
        i.set({
          changeCategory: isNil(i.get('changeCategory')) ? 'PCN' : i.get('changeCategory'),
        });
        Object.assign(i, { status: 'update' });
      });
    },
    update: ({ record, name }) => {
      // 二开埋点编辑
      cuxUpdate({ record, name });
    },
  },
});

/**
 * pcn变更信息DS
 */
const pcnChangeInfoDS = (cuxUpdate, formDs) => ({
  dataToJSON: 'all',
  pageSize: 20,
  primaryKey: 'pcnLineId',
  modifiedCheck: false,
  cacheModified: true,
  // cacheSelection: true,
  // selection: 'multiple',
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.lineNum`).d('行号'),
    },
    {
      name: 'itemId',
      type: 'object',
      label: intl.get(`siec.pcnmanageWorkbench.view.itemCode`).d('物料编码'),
      lovCode: 'SMDM.ITEM',
      // lovPara: { tenantId: organizationId },
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId: organizationId,
          };
        },
      },
      textField: 'itemCode',
      valueField: 'itemId',
      transformRequest: (value) => {
        return value && value.itemId;
      },
      transformResponse: (value) => {
        return value
          ? {
              itemId: value,
            }
          : undefined;
      },
    },
    // {
    //   name: 'itemId',
    //   type: 'string',
    //   bind: 'itemId.itemId',
    // },
    {
      name: 'itemCode',
      type: 'string',
      bind: 'itemId.itemCode',
    },
    {
      name: 'itemName',
      type: 'string',
      // bind: 'itemId.itemName',
      label: intl.get(`siec.pcnmanageWorkbench.view.itemName`).d('物料名称'),
    },
    {
      name: 'industryCategoryId',
      type: 'object',
      label: intl.get(`siec.pcnmanageWorkbench.view.industryCategoryId`).d('物料品类'),
      lovCode: 'SPRM.ITEM_CATEGOR',
      dynamicProps: {
        lovPara: ({ record }) => ({ itemId: record.get('itemId')?.itemId }),
      },
      transformRequest: (value) => {
        return value && value.categoryId;
      },
      transformResponse: (value) => {
        return value
          ? {
              categoryId: value,
            }
          : undefined;
      },
    },
    // {
    //   name: 'industryCategoryId',
    //   type: 'string',
    //   bind: 'industryCategoryId.categoryId',
    // },
    {
      name: 'categoryName',
      type: 'string',
      bind: 'industryCategoryId.categoryName',
    },
    {
      name: 'uomId',
      type: 'string',
      bind: 'itemId.uomId',
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.uomId`).d('单位'),
      bind: 'itemId.uomName',
    },
    {
      name: 'supplierInventoryQuantity',
      type: 'number',
      label: intl.get(`siec.pcnmanageWorkbench.view.supplierInventoryQuantity`).d('供应商库存'),
    },
    {
      name: 'supplierProcessingMethod',
      type: 'string',
      label: intl
        .get(`siec.pcnmanageWorkbench.view.supplierProcessingMethod`)
        .d('供应商库存处理方式'),
    },
    {
      name: 'supplierRemark',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.supplierRemark`).d('供应商备注'),
    },
    {
      name: 'buyerInventoryQuantity',
      type: 'number',
      label: intl.get(`siec.pcnmanageWorkbench.view.buyerInventoryQuantity`).d('采购方库存'),
    },
    {
      name: 'buyerProcessingMethod',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.buyerProcessingMethod`).d('采购方库存处理方式'),
    },
    {
      name: 'buyerRemark',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.buyerRemark`).d('采购方备注'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get(`siec.pcnmanageWorkbench.view.attachmentUuidLine`).d('行附件'),
      bucketName: BUCKET_NAME,
      bucketDirectory: BUCKET_DIRECTORY,
    },
  ],
  transport: {
    read: ({ data: { params = {} } }) => {
      const { pcnHeaderId } = params;
      if (pcnHeaderId) {
        return {
          url: `${SRM_SIEC}/v1/${organizationId}/pcn-lines/${pcnHeaderId}`,
          method: 'GET',
          data: { customizeUnitCode: 'SIEC.SUPPIER_PCN_MANAGEWORK_BENCH_DETAI.LINE' },
        };
      }
    },
    destroy: () => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/pcn-lines`,
        method: 'DELETE',
        // data: newData,
      };
    },
  },
  events: {
    update: ({ record, name, value }) => {
      // 二开埋点编辑
      cuxUpdate({ record, name, value }, formDs);
      if (name === 'itemId') {
        record.set('industryCategoryId', {
          categoryId: value?.categoryId,
          categoryName: value?.categoryName,
        });
        record.set('itemName', value?.itemName);
      }
    },
  },
});

/**
 * 附件
 */
const attachmentInfoDS = () => ({
  dataToJSON: 'dirty-field',
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'attachmentUuidTemplate',
      type: 'attachment',
      label: intl.get(`siec.pcnmanageWorkbench.view.attachmentUuidTemplate`).d('附件模板'),
      // bind: 'typeLOV.attachmentuuidtemplate',
    },
    {
      name: 'supplierAttachmentUuid',
      type: 'attachment',
      label: intl.get(`siec.pcnmanageWorkbench.view.supplierAttachmentUuid`).d('供应商附件'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get(`siec.pcnmanageWorkbench.view.attachmentUuid`).d('采购方附件'),
    },
  ],
});

export { pcnHeaderInfoDS, pcnChangeInfoDS, attachmentInfoDS };

import { FieldType, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { HZERO_IAM } from 'utils/config';
import { invert } from 'lodash';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { DetailProjectFormCode, DetailProjectPartListCode, DetailProjectStageListCode, DetailProjectDocListCode, DetailDocumentCode, DetailDocumentAttachCode, DetailStageFormCode, DetailStageDocListCode, documentUploadBucket } from '../../utils/type';

const organizationId = getCurrentOrganizationId();

export const basicInfoDS = (projectHeaderId): DataSetProps => {
  return {
    dataToJSON: DataToJSON.all,
    primaryKey: 'projectHeaderId',
    autoQuery: false,
    fields: [
      {
        name: 'projectNum',
        type: FieldType.string,
        disabled: true,
        label: intl.get('sqam.ppap.model.project.projectNum').d('项目编号'),
      },
      {
        name: 'projectName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.projectName').d('项目名称'),
      },
      {
        name: 'projectStatus',
        type: FieldType.string,
        lookupCode: 'SQAM.PPAP_PROJECT_STATUS',
        label: intl.get('sqam.ppap.model.project.status').d('项目状态'),
      },
      {
        name: 'companLov',
        type: FieldType.object,
        required: true,
        label: intl.get(`sqam.ppap.model.common.companyName`).d('公司'),
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        textField: 'companyName',
        lovPara: {
          tenantId: organizationId,
        },
      },
      {
        name: 'companyId',
        type: FieldType.string,
        bind: 'companLov.companyId',
      },
      {
        name: 'companyName',
        type: FieldType.string,
        bind: 'companLov.companyName',
      },
      {
        name: 'companyNum',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.common.companyNum`).d('公司编码'),
        bind: 'companLov.companyNum',
      },
      {
        name: 'invOrganizationLov',
        type: FieldType.object,
        label: intl.get('sqam.ppap.model.common.invOrganization').d('库存组织'),
        lovCode: 'HPFM.INV_ORGANIZATION',
        lovPara: {
          tenantId: organizationId,
        },
      },
      {
        name: 'organizationName',
        bind: 'invOrganizationLov.organizationName',
      },
      {
        name: 'organizationCode',
        bind: 'invOrganizationLov.organizationCode',
      },
      {
        name: 'purOrganizationId',
        bind: 'invOrganizationLov.organizationId',
      },
      {
        name: 'supplierCompanyLov',
        type: FieldType.object,
        required: true,
        label: intl.get('sqam.ppap.model.common.supplierCompany').d('供应商'),
        lovCode: 'SQAM.CLAIM_SUPPLIER_COMPANY',
        textField: 'supplierCompanyName',
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierCompanyName',
      },
      {
        name: 'supplierCompanyId',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierCompanyId',
      },
      {
        name: 'supplierTenantId',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierTenantId',
      },
      {
        name: 'supplierCompanyNum',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.common.supplierCompanyNum`).d('供应商编码'),
        bind: 'supplierCompanyLov.supplierCompanyNum',
      },
      {
        name: 'supplierId',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierId',
      },
      {
        name: 'supplierNum',
        type: FieldType.string,
        bind: 'supplierCompanyLov.supplierNum',
      },
      {
        name: 'templateNum',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.projectTemplate').d('项目模板'),
      },
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get(`sqam.ppap.model.template.creationDate`).d('创建日期'),
      },
      {
        name: 'createName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.creator`).d('创建人'),
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.common.remark`).d('备注'),
      },
      {
        name: 'hisItemFlag',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.common.hisItemFlag`).d('是否存在历史零件项目'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'specification',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.specification`).d('规格'),
      },
      {
        name: 'model',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.model`).d('型号'),
      },
    ],
    queryParameter: {
      customizeUnitCode: DetailProjectFormCode,
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/detail/${projectHeaderId}`,
          method: 'GET',
        };
      },
      submit: ({ dataSet, data }) => {
        const submitType = dataSet?.getState('submitType');
        const customCode = [DetailProjectFormCode, DetailProjectPartListCode, DetailProjectStageListCode, DetailProjectDocListCode].join();
        switch (submitType) {
          case 'publish':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/publish?customizeUnitCode=${customCode}`,
              method: 'PUT',
            };
          case 'cancel':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/cancel?customizeUnitCode=${customCode}`,
              method: 'PUT',
            };
          case 'confirm':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/confirm?customizeUnitCode=${customCode}`,
              method: 'PUT',
            };
          case 'reject':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/confirm-rejected?customizeUnitCode=${customCode}`,
              method: 'PUT',
            };
          default:
        }
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/save?customizeUnitCode=${customCode}`,
          method: 'PUT',
          data: data[0],
        };
      },
    },
  };
};

export const partLineDS = (projectHeaderId): DataSetProps => {
  return {
    autoQuery: false,
    queryParameter: {
      customizeUnitCode: DetailProjectPartListCode,
    },
    fields: [
      {
        name: 'partLov',
        type: FieldType.object,
        required: true,
        label: intl.get(`sqam.ppap.model.project.partNum`).d('零件编码'),
        lovCode: 'SMDM.ITEM',
        textField: 'itemCode',
        lovPara: {
          tenantId: organizationId,
        },
      },
      {
        name: 'itemCode',
        type: FieldType.string,
        bind: 'partLov.itemCode',
      },
      {
        name: 'itemId',
        type: FieldType.string,
        bind: 'partLov.itemId',
      },
      {
        name: 'itemName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.partName`).d('零件名称'),
        bind: 'partLov.itemName',
      },
      {
        name: 'specification',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.specification`).d('规格'),
        bind: 'partLov.specifications',
      },
      {
        name: 'model',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.model`).d('型号'),
        bind: 'partLov.model',
      },
      {
        name: 'itemCategoryId',
        type: FieldType.string,
        bind: 'partLov.categoryId',
      },
      {
        name: 'categoryLov',
        type: FieldType.object,
        lovCode: 'SMDM.ITEM_CATEGORY',
        required: true,
        label: intl.get(`sqam.ppap.model.project.partCategory`).d('零件品类'),
        dynamicProps: {
          disabled: ({ record }) => record?.get('itemCategoryId'),
        },
      },
      {
        name: 'categoryName',
        type: FieldType.string,
        bind: 'categoryLov.categoryName',
      },
      {
        name: 'categoryCode',
        type: FieldType.string,
        bind: 'categoryLov.categoryCode',
      },
      {
        name: 'categoryId',
        type: FieldType.string,
        bind: 'categoryLov.categoryId',
      },
      {
        name: 'manufacturer',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.manufacturer`).d('生产厂家'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-items/${projectHeaderId}`,
          method: 'GET',
        };
      },
      destroy: () => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-items/delete-batch/${projectHeaderId}`,
          method: 'DELETE',
        };
      },
    },
  };
};

export const documentLineDS = (projectHeaderId): DataSetProps => {
  return {
    selection: false,
    autoQuery: false,
    queryParameter: {
      customizeUnitCode: DetailProjectDocListCode,
    },
    fields: [
      {
        name: 'documentStatus',
        type: FieldType.string,
        lookupCode: 'SQAM.PPAP_DOCUMENT_STATUS',
        label: intl.get(`sqam.ppap.model.project.documentStatus`).d('交付物状态'),
      },
      {
        name: 'documentNum',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.documentNum`).d('交付物编号'),
      },
      {
        name: 'documentName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.documentName`).d('交付物名称'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.common.companyName`).d('公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.common.supplierCompany').d('供应商'),
      },
      {
        name: 'documentAttachmentUuid',
        type: FieldType.attachment,
        label: intl.get(`sqam.ppap.model.project.documentAttachmentSupplier`).d('销售方附件'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: documentUploadBucket,
      },
      {
        name: 'purchaseAttachmentUuid',
        type: FieldType.attachment,
        label: intl.get(`sqam.ppap.model.project.purchaseAttachmentUuid`).d('采购方附件'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: documentUploadBucket,
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.documentStageNum`).d('交付物反馈阶段编号'),
      },
      {
        name: 'stageName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.documentStageName`).d('交付物反馈阶段名称'),
      },
      {
        name: 'projectNum',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.linkprojectNum').d('关联项目编号'),
      },
      {
        name: 'projectName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.linkprojectName').d('关联项目名称'),
      },
      {
        name: 'campMeaning',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.campMeaning`).d('交付物责任方'),
      },
      {
        name: 'approvedBy',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.approveName`).d('审核人'),
      },
      {
        name: 'approvedOpinion',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.documentRemark`).d('审批意见'),
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-documents/${projectHeaderId}`,
          method: 'GET',
          params: filterNullValueObject({
            ...params,
            operatorCamp: 'SUPPLIER',
          }),
        };
      },
    },
  };
};

// 阶段内查询交付物清单
export const documentStageLineDS = (): DataSetProps => {
  return {
    selection: false,
    autoQuery: false,
    queryParameter: {
      customizeUnitCode: DetailStageDocListCode,
    },
    fields: [
      {
        name: 'documentStatus',
        lookupCode: 'SQAM.PPAP_DOCUMENT_STATUS',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.documentStatus`).d('交付物状态'),
      },
      {
        name: 'documentNum',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.documentNum`).d('交付物编号'),
      },
      {
        name: 'documentName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.documentName`).d('交付物名称'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.common.companyName`).d('公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.common.supplierCompany').d('供应商'),
      },
      {
        name: 'documentAttachmentUuid',
        type: FieldType.attachment,
        label: intl.get(`sqam.ppap.model.project.documentAttachmentSupplier`).d('销售方附件'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: documentUploadBucket,
      },
      {
        name: 'purchaseAttachmentUuid',
        type: FieldType.attachment,
        label: intl.get(`sqam.ppap.model.project.purchaseAttachmentUuid`).d('采购方附件'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: documentUploadBucket,
      },
      {
        name: 'campMeaning',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.campMeaning`).d('交付物责任方'),
      },
      {
        name: 'approvedBy',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.approveName`).d('审核人'),
      },
    ],
    transport: {
      read: ({ dataSet, params }) => {
        const stageId = dataSet?.getQueryParameter('stageId');
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-documents/stage/${stageId}`,
          method: 'GET',
          params: filterNullValueObject({
            ...params,
            operatorCamp: 'SUPPLIER',
          }),
        };
      },
    },
  };
};

export const documentInfoDS = (): DataSetProps => {
  return {
    dataToJSON: DataToJSON.all,
    autoCreate: true,
    fields: [
      {
        name: 'projectNum',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.linkprojectNum').d('关联项目编号'),
      },
      {
        name: 'projectName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.linkprojectName').d('关联项目名称'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.common.companyName`).d('公司'),
      },
      {
        name: 'invOrganizationName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.common.invOrganization').d('库存组织'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.common.supplierCompany').d('供应商'),
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.documentStageNum`).d('交付物反馈阶段编号'),
      },
      {
        name: 'stageName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.documentStageName`).d('交付物反馈阶段名称'),
      },
      {
        name: 'stageStatus',
        type: FieldType.string,
        lookupCode: 'SQAM.PPAP_STAGE_STATUS',
        label: intl.get(`sqam.ppap.model.project.stageStatus`).d('阶段状态'),
      },
      {
        name: 'documentNum',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.documentNum`).d('交付物编号'),
      },
      {
        name: 'documentName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.documentName`).d('交付物名称'),
      },
      {
        name: 'approvedOpinion',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.documentRemark`).d('审批意见'),
      },
      {
        name: 'documentStatus',
        type: FieldType.string,
        lookupCode: 'SQAM.PPAP_DOCUMENT_STATUS',
        label: intl.get(`sqam.ppap.model.project.documentStatus`).d('交付物状态'),
      },
      {
        name: 'documentAttachmentUuid',
        type: FieldType.attachment,
        label: intl.get(`sqam.ppap.model.project.documentAttachmentSupplier`).d('销售方附件'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: documentUploadBucket,
        dynamicProps: {
          required: ({ record }) => record?.get('camp') === 'SUPPLIER',
        },
      },
      {
        name: 'purchaseAttachmentUuid',
        type: FieldType.attachment,
        label: intl.get(`sqam.ppap.model.project.purchaseAttachmentUuid`).d('采购方附件'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: documentUploadBucket,
      },
      {
        name: 'templateAttachmentUuid',
        type: FieldType.attachment,
        label: intl.get(`sqam.ppap.model.project.templateAttachmentUuid`).d('来源模板附件'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: documentUploadBucket,
      },
      {
        name: 'campMeaning',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.campMeaning`).d('交付物责任方'),
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.explain`).d('交付物要求说明'),
      },
    ],
    transport: {
      submit: ({ dataSet, data }) => {
        const customCode = [DetailDocumentCode, DetailDocumentAttachCode].join();
        const submitType = dataSet?.getState('submitType');
        switch (submitType) {
          case 'confirm':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-documents/confirm?customizeUnitCode=${customCode}`,
              method: 'PUT',
            };
          case 'submit':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-documents/submit?customizeUnitCode=${customCode}`,
              method: 'PUT',
            };

          case 'reject':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-documents/confirm-rejected?customizeUnitCode=${customCode}`,
              method: 'PUT',
            };
          case 'change':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-documents/alter?customizeUnitCode=${customCode}`,
              method: 'PUT',
            };
          default:
        }
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-documents/save?customizeUnitCode=${customCode}`,
          method: 'PUT',
          data: data[0],
        };
      },
    },
  };
};

export const stageInfoDS = (): DataSetProps => {
  return {
    dataToJSON: DataToJSON.all,
    autoCreate: true,
    fields: [
      {
        name: 'stageStatus',
        type: FieldType.string,
        lookupCode: 'SQAM.PPAP_STAGE_STATUS',
        label: intl.get(`sqam.ppap.model.project.stageStatus`).d('阶段状态'),
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        required: true,
        label: intl.get(`sqam.ppap.model.template.stageNum`).d('阶段编号'),
      },
      {
        name: 'stageName',
        type: FieldType.string,
        required: true,
        label: intl.get(`sqam.ppap.model.template.stageName`).d('阶段名称'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.common.companyName`).d('公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.common.supplierCompany').d('供应商'),
      },
      {
        name: 'projectNum',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.linkprojectNum').d('关联项目编号'),
      },
      {
        name: 'openDate',
        type: FieldType.dateTime,
        label: intl.get('sqam.ppap.model.project.openDate').d('阶段开始时间'),
      },
      {
        name: 'closeDate',
        type: FieldType.dateTime,
        label: intl.get('sqam.ppap.model.project.closeDate').d('阶段关闭时间'),
      },
      {
        name: 'openExpectDate',
        type: FieldType.dateTime,
        label: intl.get(`sqam.ppap.model.project.openExpectDate`).d('阶段预计开始时间'),
      },
      {
        name: 'closeExpectDate',
        type: FieldType.dateTime,
        label: intl.get(`sqam.ppap.model.project.closeExpectDate`).d('阶段预计完成时间'),
      },
      {
        name: 'documentsCompletedPercent',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.documentsCompletedPercent`).d('交付物审核进度'),
      },
      {
        name: 'stageApproveOpinion',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.approveRemark`).d('阶段审核意见'),
      },
      {
        name: 'stageRemark',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.documentsRemark`).d('阶段备注'),
      },
      {
        name: 'supplyFlag',
        label: intl.get(`sqam.ppap.model.template.ableSupply`).d('可供货'),
        type: FieldType.string,
      },
    ],
    transport: {
      submit: ({ dataSet }) => {
        const submitType = dataSet?.getState('submitType');
        const customCode = [DetailStageFormCode].join();
        switch (submitType) {
          case 'close':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-stages/close?customizeUnitCode=${customCode}`,
              method: 'PUT',
            };
          case 'open':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-stages/open?customizeUnitCode=${customCode}`,
              method: 'PUT',
            };

          case 'closeReject':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-stages/confirm-rejected?customizeUnitCode=${customCode}`,
              method: 'PUT',
            };
          default:
        }
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-stages/confirm?customizeUnitCode=${customCode}`,
          method: 'PUT',
        };
      },
    },
  };
};


export const stageLineDS = (projectHeaderId): DataSetProps => {
  return {
    selection: false,
    autoQuery: false,
    queryParameter: {
      customizeUnitCode: DetailProjectStageListCode,
    },
    fields: [
      {
        name: 'stageStatus',
        type: FieldType.string,
        lookupCode: 'SQAM.PPAP_STAGE_STATUS',
        label: intl.get(`sqam.ppap.model.project.stageStatus`).d('阶段状态'),
      },
      {
        name: 'sequence',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.sequence`).d('序号'),
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        required: true,
        label: intl.get(`sqam.ppap.model.template.stageNum`).d('阶段编号'),
      },
      {
        name: 'stageName',
        type: FieldType.string,
        required: true,
        label: intl.get(`sqam.ppap.model.template.stageName`).d('阶段名称'),
      },
      {
        name: 'stageOpenTypeMeaning',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.stageEnableVerify`).d('阶段开启校验'),
      },
      {
        name: 'stageCloseTypeMeaning',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.stageUnEnableVerify`).d('阶段关闭校验'),
      },
      {
        name: 'closeApproveMethodMeaning',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.closeStageApprovalWap`).d('阶段关闭审批方式'),
      },
      {
        name: 'closeApproveTypeMeaning',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.closeStageVerifierType`).d('阶段关闭审批人类型'),
      },
      {
        name: 'openExpectDate',
        type: FieldType.dateTime,
        label: intl.get(`sqam.ppap.model.project.openExpectDate`).d('阶段预计开始时间'),
        dynamicProps: {
          required: ({ record }) => record?.get('stageOpenType') === 'TIME',
        },
      },
      {
        name: 'closeExpectDate',
        type: FieldType.dateTime,
        label: intl.get(`sqam.ppap.model.project.closeExpectDate`).d('阶段预计完成时间'),
        dynamicProps: {
          required: ({ record }) => record?.get('stageCloseType') === 'TIME',
        },
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.common.companyName`).d('公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.common.supplierCompany').d('供应商'),
      },
      {
        name: 'projectNum',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.linkprojectNum').d('关联项目编号'),
      },
      {
        name: 'openDate',
        type: FieldType.dateTime,
        label: intl.get('sqam.ppap.model.project.openDate').d('阶段开始时间'),
      },
      {
        name: 'closeDate',
        type: FieldType.dateTime,
        label: intl.get('sqam.ppap.model.project.closeDate').d('阶段关闭时间'),
      },
      {
        name: 'documentsCompletedPercent',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.documentsCompletedPercent`).d('交付物审核进度'),
      },
      {
        name: 'stageApproveOpinion',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.approveRemark`).d('阶段审核意见'),
      },
      {
        name: 'stageRemark',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.documentsRemark`).d('阶段备注'),
      },
      {
        name: 'supplyFlag',
        label: intl.get(`sqam.ppap.model.template.ableSupply`).d('可供货'),
        type: FieldType.string,
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-stages/${projectHeaderId}`,
          method: 'GET',
          params: filterNullValueObject({
            ...params,
            operatorCamp: 'SUPPLIER',
          }),
        };
      },
    },
  };
};

export const permissionDS = (permissionCodeMap: Record<string, string>, ingoreKeyList: string[] = []): DataSetProps => {
  return {
    autoQuery: true,
    autoCreate: true,
    dataToJSON: DataToJSON.all,
    data: [{}],
    fields: [],
    transport: {
      read: () => {
        return {
          url: `${HZERO_IAM}/hzero/v1/menus/check-permissions`,
          method: 'POST',
          params: {},
          data: Object.values(permissionCodeMap),
          transformResponse: (res) => {
            try {
              const invertCodeMap = invert(permissionCodeMap);
              return Object.fromEntries(
                JSON.parse(res).map(({ code, approve }) => {
                  const permissionKey = invertCodeMap[code];
                  return [permissionKey, ingoreKeyList.includes(permissionKey) ? true : approve];
                })
              );
            } catch {
              return {};
            }
          },
        };
      },
    },
  };
};

export const checkInfoDS = (): DataSetProps => {
  return {
    autoCreate: false,
    fields: [
      // {
      //   name: 'publishApproveRemark',
      //   type: FieldType.string,
      //   label: intl.get(`sqam.ppap.model.template.publishApproveRemark`).d('项目发布审批意见'),
      // },
      // {
      //   name: 'closeApproveRemark',
      //   type: FieldType.string,
      //   label: intl.get(`sqam.ppap.model.template.closeApproveRemark`).d('项目关闭审批意见'),
      // },
      // {
      //   name: 'stageApproveOpinion',
      //   type: FieldType.string,
      //   label: intl.get(`sqam.ppap.model.template.stageApproveOpinion`).d('阶段关闭审批意见'),
      // },
      // {
      //   name: 'approvedOpinion',
      //   type: FieldType.string,
      //   label: intl.get(`sqam.ppap.model.template.approvedOpinion`).d('审批意见'),
      // },
      {
        name: 'alterRemark',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.alterRemark`).d('变更意见'),
      },
    ],
  };
};

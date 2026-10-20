import { FieldType, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { HZERO_IAM } from 'utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
// import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
// import moment from 'moment';
import { invert, isArray } from 'lodash';
import { DetailProjectFormCode, DetailProjectPartListCode, DetailProjectStageListCode, DetailProjectDocListCode, DetailProjectPartDetailCode, documentUploadBucket } from '../../utils/type';

const organizationId = getCurrentOrganizationId();

interface MyDataSetProps extends DataSetProps {
  validationCode?: string,
  validationTitle?: string,
};

export const basicInfoDS = (projectHeaderId): MyDataSetProps => {
  return {
    dataToJSON: DataToJSON.all,
    primaryKey: 'projectHeaderId',
    autoQuery: false,
    validationTitle: intl.get(`sqam.ppap.model.template.baseInfo`).d('基本信息'),
    validationCode: 'header',
    forceValidate: true,
    autoQueryAfterSubmit: false,
    fields: [
      {
        name: 'projectNum',
        type: FieldType.string,
        disabled: true,
        label: intl.get('sqam.ppap.model.project.projectNumSum').d('汇总项目编号'),
      },
      {
        name: 'projectName',
        type: FieldType.intl,
        label: intl.get('sqam.ppap.model.project.projectNameSum').d('汇总项目名称'),
        required: true,
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
        name: 'templateLov',
        label: intl.get('sqam.ppap.model.project.projectTemplate').d('项目模板'),
        type: FieldType.object,
        required: true,
        lovCode: 'SQAM.PPAP_TEMPLATE_PUBLISHED',
        dynamicProps: {
          lovPara: () => ({
            tenantId: organizationId,
            enableSingleItemFlag: 1,
          }),
        },
        // textField: 'templateName',
      },
      {
        name: 'templateName',
        type: FieldType.string,
        bind: 'templateLov.templateName',
      },
      {
        name: 'templateId',
        type: FieldType.string,
        bind: 'templateLov.templateId',
      },
      {
        name: 'templateNum',
        type: FieldType.string,
        bind: 'templateLov.templateNum',
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
        const fields = dataSet?.getState('fields') || [];
        const attributeHeader = {};
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
          case 'close':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/close?customizeUnitCode=${customCode}`,
              method: 'PUT',
            };
          case 'create':
            fields.forEach((item) => {
              const { fieldCode, standardField } = item;
              if (!standardField) {
                attributeHeader[fieldCode] = data[0][fieldCode];
              }
            });
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/create-by-template?customizeUnitCode=${DetailProjectFormCode}`,
              method: 'POST',
              data: {
                ...data[0],
                tenantId: organizationId,
                attributeHeader,
              },
            };
          case 'copy':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/copy/${projectHeaderId}?customizeUnitCode=${customCode}`,
              method: 'PUT',
              data: {},
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

export const partInventoryDS = (projectHeaderId): MyDataSetProps => {
  return {
    autoQuery: projectHeaderId !== 'create',
    queryParameter: {
      customizeUnitCode: DetailProjectPartDetailCode,
    },
    fields: [
      {
        name: 'itemCode',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.partNum`).d('零件编码'),
      },
      {
        name: 'itemName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.partName`).d('零件名称'),
      },
      {
        name: 'projectNum',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.partCategoryNum`).d('零件项目编码'),
      },
      {
        name: 'projectStatusMeaning',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.partCategoryStatus`).d('零件状态'),
      },
      {
        name: 'stageProcess',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.partProgress`).d('零件进度'),
      },
      {
        name: 'hisItemFlag',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.common.hisItemFlag`).d('是否存在历史零件项目'),
        lookupCode: 'HPFM.FLAG',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/sum-item-page?projectHeaderId=${projectHeaderId}`,
          method: 'GET',
        };
      },
    },
  };
};

export const partLineDS = (projectHeaderId): MyDataSetProps => {
  return {
    autoQuery: false,
    cacheModified: true,
    primaryKey: 'categoryId',
    validationTitle: intl.get(`sqam.ppap.view.title.partList`).d('零件列表'),
    validationCode: 'partLine',
    forceValidate: true,
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
    // selection: false,
    autoQuery: false,
    queryParameter: {
      customizeUnitCode: DetailProjectDocListCode,
    },
    record: {
      dynamicProps: {
        selectable: (record) => record?.get('_status') === 'create',
      },
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
        type: FieldType.intl,
        label: intl.get(`sqam.ppap.model.project.documentNum`).d('交付物编号'),
        required: true,
      },
      {
        name: 'documentName',
        type: FieldType.intl,
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
        label: intl.get(`sqam.ppap.model.project.documentAttachment`).d('交付物附件'),
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
        name: 'stageLov',
        type: FieldType.object,
        label: intl.get(`sqam.ppap.model.template.documentStageNum`).d('交付物反馈阶段编号'),
        multiple: true,
        lovCode: 'SQAM.PPAP_PROJECT_UNFINISHED_STAGE',
        dynamicProps: {
          lovPara: () => ({
            tenantId: organizationId,
            projectHeaderId,
          }),
          required: ({ record }) => record?.get('_status') === 'create',
        },
        textField: 'stageNum',
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        bind: 'stageLov.stageNum',
        transformResponse: (_, record) => {
          const { stageNum } = record;
          return stageNum?.split(',');
        },
        transformRequest: (value) => (isArray(value) ? value.join() : value),
      },
      {
        name: 'stageIds',
        bind: 'stageLov.stageId',
        // transformResponse: (_, record) => {
        //   const { stageId } = record;
        //   // 返回的是单个id，return出数组
        //   return stageId ? [stageId] : [];
        // },
      },
      {
        name: 'stageName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.documentStageName`).d('交付物反馈阶段名称'),
        bind: 'stageLov.stageName',
        transformResponse: (_, record) => {
          const { stageName } = record;
          return stageName?.split(',');
        },
        transformRequest: (value) => (isArray(value) ? value.join() : value),
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
      // {
      //   name: 'campMeaning',
      //   type: FieldType.string,
      //   label: intl.get(`sqam.ppap.model.project.campMeaning`).d('交付物责任方'),
      // },
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
      {
        name: 'camp',
        type: FieldType.string,
        required: true,
        label: intl.get(`sqam.ppap.model.template.responsibleParty`).d('责任方'),
        lookupCode: 'SQAM.PPAP_CAMP',
      },
      {
        name: 'approveMethod',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.approvalWap`).d('审批方式'),
        lookupCode: 'SQAM.PPAP_DOCUMENT_APPROVE_METHOD',
        required: true,
      },
      {
        name: 'approveType',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.verifierType`).d('审核人类型'),
        lookupCode: 'SQAM.PPAP_APPROVER_TYPE',
        dynamicProps: {
          // 当审批方式是功能审批时可编辑，审批方式是功能审批时必输
          disabled: ({ record }) => record?.get('approveMethod') !== 'FUNCTION',
          required: ({ record }) => record?.get('approveMethod') === 'FUNCTION',
        },
      },
      {
        name: 'roleNumLov',
        type: FieldType.object,
        label: intl.get(`sqam.ppap.model.template.verifier`).d('审核人'),
        dynamicProps: {
          disabled: ({ record }) => record?.get('approveMethod') !== 'FUNCTION',
          required: ({ record }) => record?.get('approveMethod') === 'FUNCTION',
          lovCode: ({ record }) => record?.get('approveType') === 'EMPLOYEE' ? 'SPRM.EMPLOYEE_LIST_URL_NUM' : 'SSLM.TENANT.ROLE_ENABLE_TABLE',
          lovPara: () => ({
            tenantId: organizationId,
          }),
        },
      },
      {
        name: 'employeeName',
        dynamicProps: {
          bind: ({ record, dataSet }) => {
            if (record?.get('approveType') === 'EMPLOYEE') {
              const textField = record.getField('roleNumLov', dataSet)?.get('textField') || 'name';
              return `roleNumLov.${textField}`;
            }
          },
        },
      },
      {
        name: 'roleName',
        dynamicProps: {
          bind: ({ record }) => record?.get('approveType') !== 'EMPLOYEE' ? 'roleNumLov.name' : undefined,
        },
      },
      {
        name: 'roleCode',
        dynamicProps: {
          bind: ({ record }) => record?.get('approveType') !== 'EMPLOYEE' ? 'roleNumLov.code' : undefined,
        },
      },
      {
        name: 'roleId',
        dynamicProps: {
          bind: ({ record }) => record?.get('approveType') !== 'EMPLOYEE' ? 'roleNumLov.id' : undefined,
        },
      },
      {
        name: 'employeeNum',
        dynamicProps: {
          bind: ({ record }) => record?.get('approveType') === 'EMPLOYEE' ? 'roleNumLov.employeeNum' : undefined,
        },
      },
      {
        name: 'employeeId',
        dynamicProps: {
          bind: ({ record }) => record?.get('approveType') === 'EMPLOYEE' ? 'roleNumLov.employeeId' : undefined,
        },
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-documents/${projectHeaderId}`,
          method: 'GET',
          params: filterNullValueObject({
            ...params,
            operatorCamp: 'PURCHASER',
          }),
        };
      },
    },
  };
};



export const stageLineDS = (projectHeaderId): MyDataSetProps => {
  return {
    selection: false,
    autoQuery: false,
    validationTitle: intl.get(`sqam.ppap.view.title.stagePlan`).d('项目计划'),
    validationCode: 'stageLine',
    forceValidate: true,
    queryParameter: {
      // customizeUnitCode: DetailStageDocListCode,
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
        label: intl.get(`sqam.ppap.model.template.stageNum`).d('阶段编号'),
      },
      {
        name: 'stageName',
        type: FieldType.string,
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
        // transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
      },
      {
        name: 'closeExpectDate',
        type: FieldType.dateTime,
        label: intl.get(`sqam.ppap.model.project.closeExpectDate`).d('阶段预计完成时间'),
        dynamicProps: {
          required: ({ record }) => record?.get('stageCloseType') === 'TIME',
        },
        // transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
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
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-stages/${projectHeaderId}`,
          method: 'GET',
          params: filterNullValueObject({
            ...params,
            operatorCamp: 'PURCHASER',
          }),
        };
      },
    },
  };
};

export const documentInfoDS = (): MyDataSetProps => {
  return {
    dataToJSON: DataToJSON.all,
    autoCreate: true,
    validationTitle: intl.get(`sqam.ppap.view.title.document`).d('交付物'),
    validationCode: 'header',
    forceValidate: true,
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
        label: intl.get(`sqam.ppap.model.project.documentAttachment`).d('交付物附件'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: documentUploadBucket,
        required: true,
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
  };
};

export const checkInfoDS = (): DataSetProps => {
  return {
    autoCreate: false,
    fields: [
      {
        name: 'publishApproveRemark',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.publishApproveRemark`).d('项目发布审批意见'),
      },
      {
        name: 'closeApproveRemark',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.closeApproveRemark`).d('项目关闭审批意见'),
      },
      {
        name: 'approvedOpinion',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.approvedOpinion`).d('审批意见'),
      },
    ],
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

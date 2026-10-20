import { FieldType, DataToJSON, FieldIgnore } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { HZERO_IAM } from 'utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
// import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
// import moment from 'moment';
import { invert, isArray, isNil } from 'lodash';
import { DetailProjectFormCode, DetailProjectPartListCode, DetailProjectStageListCode, DetailProjectDocListCode, DetailDocumentCode, DetailDocumentAttachCode, DetailStageFormCode, DetailStageDocListCode, documentUploadBucket, DetailProjectDocListBatchEditCode } from '../../utils/type';

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
        label: intl.get('sqam.ppap.model.project.projectNum').d('项目编号'),
      },
      {
        name: 'projectName',
        type: FieldType.intl,
        label: intl.get('sqam.ppap.model.project.projectName').d('项目名称'),
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
        dynamicProps: {
          disabled: ({ record }) => !record?.get('companyId'),
          lovPara: ({ record }) => ({
            tenantId: organizationId,
            companyId: record?.get('companyId'),
          }),
        },
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
            enableSingleItemFlag: 0,
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
          case 'copy':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/copy?customizeUnitCode=${customCode}`,
              method: 'POST',
              data: { projectHeaderId },
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
          case 'change':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/alter?customizeUnitCode=${customCode}`,
              method: 'POST',
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
    // selection: false,
    autoQuery: false,
    queryParameter: {
      customizeUnitCode: DetailProjectDocListCode,
    },
    primaryKey: 'documentId',
    // record: {
    //   dynamicProps: {
    //     selectable: (record) => record?.get('_status') === 'create',
    //   },
    // },
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
        required: true,
      },
      {
        name: 'documentName',
        type: FieldType.intl,
        label: intl.get(`sqam.ppap.model.project.documentName`).d('交付物名称'),
        required: true,
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
        name: 'templateAttachmentUuid',
        type: FieldType.attachment,
        label: intl.get(`sqam.ppap.model.project.templateAttachmentUuid`).d('来源模板附件'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: documentUploadBucket,
      },
      {
        name: 'autoReferAttachmentFlag',
        label: intl.get(`sqam.ppap.model.template.autoReferAttachmentFlag`).d('模板带入责任方附件'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        transformResponse: (value) => Number(value),
        help: intl.get(`sqam.ppap.model.template.autoReferAttachmentFlagTips`).d('当启用时，会将文件模板直接传至采购方/销售方附件分区中'),
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
      {
        name: 'documentSupplierFlag',
        label: intl.get(`sqam.ppap.model.template.documentSupplierFlag`).d('供应商是否可见'),
        type: FieldType.string,
        lookupCode: 'HPFM.FLAG',
        defaultValue: 1,
        dynamicProps: {
          disabled: ({ record }) => record?.get('camp') === 'SUPPLIER',
        },
      },
      {
        name: 'supplierVisibleFlag',
        label: intl.get(`sqam.ppap.model.template.supplierVisibleFlag`).d('采购方附件销售方可见'),
        type: FieldType.string,
        lookupCode: 'HPFM.FLAG',
        dynamicProps: {
          disabled: ({ record }) => Number(record?.get('documentSupplierFlag')) === 0 || record?.get('camp') === 'SUPPLIER',
        },
      },
      {
        name: 'documentUploadPoint',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.documentUploadPoint`).d('附件上传节点'),
        lookupCode: 'SQAM.PPAP_DOCUMENT_UPLOAD_POINT',
        defaultValue: 'PROJECT_PUBLISH',
        // required: true,
      },
      // 采购方指定人
      {
        name: 'appointorLov',
        type: FieldType.object,
        label: intl.get(`sqam.ppap.model.template.appointor`).d('采购方指定人'),
        lovCode: 'SPRM.EMPLOYEE_LIST_URL_NUM',
        dynamicProps: {
          disabled: ({ record }) => record?.get('camp') !== 'PURCHASER',
          lovPara: () => ({
            tenantId: organizationId,
          }),
        },
        help: intl.get(`sqam.ppap.model.template.appointorTips`).d('当选择指定人时，采购方仅指定账户可进行交付物上传'),
      },
      {
        name: 'assignEmployeeName',
        type: FieldType.string,
        dynamicProps: {
          bind: ({ dataSet }) => {
            const textField = dataSet.getField('appointorLov')?.get('textField') || 'name';
            return `appointorLov.${textField}`;
          },
        },
      },
      {
        name: 'assignEmployeeNum',
        type: FieldType.string,
        bind: 'appointorLov.employeeNum',
      },
      {
        name: 'assignEmployeeId',
        type: FieldType.string,
        bind: 'appointorLov.employeeId',
      },
      // 采购方可见角色
      {
        name: 'roleVisibleLov',
        type: FieldType.object,
        label: intl.get(`sqam.ppap.model.template.purchaseVisibleRole`).d('采购方可见角色'),
        lovCode: 'SSLM.TENANT.ROLE_ENABLE_TABLE',
        multiple: true,
        dynamicProps: {
          lovPara: () => ({
            tenantId: organizationId,
          }),
        },
        help: intl.get(`sqam.ppap.model.template.purchaseVisibleRoleTips`).d('当选择可见角色时，采购方仅指定角色可查看该交付物。'),
      },
      {
        name: 'visibleRoleName',
        type: FieldType.string,
        bind: 'roleVisibleLov.name',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        multiple: ',',
      },
      {
        name: 'visibleRoleCode',
        type: FieldType.string,
        bind: 'roleVisibleLov.code',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        multiple: ',',
      },
      {
        name: 'visibleRoleId',
        type: FieldType.string,
        bind: 'roleVisibleLov.id',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        multiple: ',',
      },
      // 采购方可见员工
      {
        name: 'visibleEmployeeLov',
        type: FieldType.object,
        label: intl.get(`sqam.ppap.model.template.visibleEmployeeLov`).d('采购方可见员工'),
        lovCode: 'SPRM.EMPLOYEE_LIST_URL_NUM',
        multiple: true,
        dynamicProps: {
          lovPara: () => ({
            tenantId: organizationId,
          }),
        },
      },
      {
        name: 'visibleEmployeeName',
        type: FieldType.string,
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        multiple: ',',
        dynamicProps: {
          bind: ({ dataSet }) => {
            const textField = dataSet.getField('visibleEmployeeLov')?.get('textField') || 'name';
            return `visibleEmployeeLov.${textField}`;
          },
        },
      },
      {
        name: 'visibleEmployeeNum',
        type: FieldType.string,
        bind: 'visibleEmployeeLov.employeeNum',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        multiple: ',',
      },
      {
        name: 'visibleEmployeeId',
        type: FieldType.string,
        bind: 'visibleEmployeeLov.employeeId',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        multiple: ',',
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
      destroy: ({ dataSet }): any => {
        const data = dataSet?.getState('data');
        const { cancelReason } = data || {};
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-documents/cancel?cancelReason=${cancelReason}`,
          method: 'PUT',
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
    dataToJSON: DataToJSON.all,
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
            operatorCamp: 'PURCHASER',
          }),
        };
      },
      submit: ({ dataSet, data }): any => {
        const submitType = dataSet?.getState('submitType');
        const headerData = dataSet?.getState('headerData') || {};
        const accessStagesList = dataSet?.getState('accessStagesList') || {};
        switch (submitType) {
          case 'saveStage':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/save?customizeUnitCode=${[DetailStageFormCode, DetailProjectFormCode, DetailStageDocListCode].join()}`,
              method: 'PUT',
              data: {
                ...headerData,
                accessDocumentList: data,
                accessStagesList: [accessStagesList],
              },
            };
          default:
        }
      },
    },
    feedback: {
      submitSuccess: () => { },
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
        required: true,
        dynamicProps: {
          required: ({ record }) => record?.get('camp') === 'PURCHASER',
        },
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
      {
        name: 'supplierVisibleFlag',
        label: intl.get(`sqam.ppap.model.template.supplierVisibleFlag`).d('采购方附件销售方可见'),
        type: FieldType.string,
      },
      {
        name: 'creationDate',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.creationDate`).d('创建日期'),
      },
      {
        name: 'createName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.creator`).d('创建人'),
      },
    ],
    transport: {
      submit: ({ dataSet, data }): any => {
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
          case 'save':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-documents/save?customizeUnitCode=${customCode}`,
              method: 'PUT',
              data: data[0],
            };
          case 'change':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-documents/alter?customizeUnitCode=${customCode}`,
              method: 'PUT',
            };
          default:
        }
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
        name: 'supplyFlag',
        label: intl.get(`sqam.ppap.model.template.ableSupply`).d('可供货'),
        type: FieldType.string,
      },
    ],
    transport: {
      submit: ({ dataSet, data }): any => {
        const submitType = dataSet?.getState('submitType');
        const customCode = [DetailStageFormCode].join();
        const headerData = dataSet?.getState('headerData') || {};
        const accessDocumentList = dataSet?.getState('accessDocumentList') || [];
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
          case 'closeConfirm':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-stages/confirm?customizeUnitCode=${customCode}`,
              method: 'PUT',
            };
          case 'change':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-stages/alter?customizeUnitCode=${customCode}`,
              method: 'PUT',
            };
          case 'save':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-stages/save?customizeUnitCode=${customCode}`,
              method: 'POST',
            };
          case 'saveStage':
            return {
              url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/save?customizeUnitCode=${[DetailStageFormCode, DetailProjectFormCode, DetailStageDocListCode].join()}`,
              method: 'PUT',
              data: {
                ...headerData,
                accessDocumentList,
                accessStagesList: data,
              },
            };
          default:
        }
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
      {
        name: 'supplyFlag',
        label: intl.get(`sqam.ppap.model.template.ableSupply`).d('可供货'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        transformResponse: (value) => (!isNil(value) ? Number(value) : null),
        help: intl.get(`sqam.ppap.model.template.ableSupplyTips`).d('勾选可供货时，在项目关闭时，将以公司+供应商+物料+品类+生产厂家维度更新供应商供货清单中【可供状态】更新为是'),
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
        name: 'stageApproveOpinion',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.stageApproveOpinion`).d('阶段关闭审批意见'),
      },
      {
        name: 'approvedOpinion',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.approvedOpinion`).d('审批意见'),
      },
      {
        name: 'alterRemark',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.alterRemark`).d('变更意见'),
      },
      {
        name: 'cancelReason',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.cancelReason`).d('取消原因'),
        // required: true,
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


export const operationDS = ({ lookupCode, lovPara = {} }): any => ({
  selection: false,
  primaryKey: 'actionId',
  pageSize: 0,
  queryFields: [
    {
      name: 'processStatus',
      display: true,
      noCache: true,
      lookupCode,
      label: intl.get('sqam.common.operate.processStatus').d('操作节点'),
      lovPara,
    },
    {
      name: 'dateRange',
      label: intl.get('sqam.common.model.message.trxDate').d('操作时间'),
      type: 'date',
      range: ['form', 'to'],
      ignore: 'always',
      display: true,
    },
  ],
  fields: [],
});

export const batchEditDocumentLineDS = (baseData: Record<string, any>): DataSetProps => {
  return {
    autoCreate: true,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'camp',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.responsibleParty`).d('责任方'),
        lookupCode: 'SQAM.PPAP_CAMP',
      },
      {
        name: 'documentSupplierFlag',
        label: intl.get(`sqam.ppap.model.template.documentSupplierFlag`).d('供应商是否可见'),
        type: FieldType.string,
        lookupCode: 'HPFM.FLAG',
        dynamicProps: {
          disabled: ({ record }) => record?.get('camp') === 'SUPPLIER',
        },
      },
      {
        name: 'approveMethod',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.approvalWap`).d('审批方式'),
        lookupCode: 'SQAM.PPAP_DOCUMENT_APPROVE_METHOD',
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
        ignore: FieldIgnore.always,
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
      {
        name: 'appointorLov',
        type: FieldType.object,
        label: intl.get(`sqam.ppap.model.template.appointor`).d('采购方指定人'),
        lovCode: 'SPRM.EMPLOYEE_LIST_URL_NUM',
        ignore: FieldIgnore.always,
        dynamicProps: {
          disabled: ({ record }) => record?.get('camp') !== 'PURCHASER',
          lovPara: () => ({
            tenantId: organizationId,
          }),
        },
      },
      {
        name: 'assignEmployeeName',
        type: FieldType.string,
        dynamicProps: {
          bind: ({ dataSet }) => {
            const textField = dataSet.getField('appointorLov')?.get('textField') || 'name';
            return `appointorLov.${textField}`;
          },
        },
      },
      {
        name: 'assignEmployeeNum',
        type: FieldType.string,
        bind: 'appointorLov.employeeNum',
      },
      {
        name: 'assignEmployeeId',
        type: FieldType.string,
        bind: 'appointorLov.employeeId',
      },
      {
        name: 'visibleEmployeeLov',
        type: FieldType.object,
        label: intl.get(`sqam.ppap.model.template.visibleEmployeeLov`).d('采购方可见员工'),
        lovCode: 'SPRM.EMPLOYEE_LIST_URL_NUM',
        multiple: true,
        ignore: FieldIgnore.always,
        dynamicProps: {
          lovPara: () => ({
            tenantId: organizationId,
          }),
        },
      },
      {
        name: 'visibleEmployeeName',
        type: FieldType.string,
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        multiple: ',',
        dynamicProps: {
          bind: ({ dataSet }) => {
            const textField = dataSet.getField('visibleEmployeeLov')?.get('textField') || 'name';
            return `visibleEmployeeLov.${textField}`;
          },
        },
      },
      {
        name: 'visibleEmployeeNum',
        type: FieldType.string,
        bind: 'visibleEmployeeLov.employeeNum',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        multiple: ',',
      },
      {
        name: 'visibleEmployeeId',
        type: FieldType.string,
        bind: 'visibleEmployeeLov.employeeId',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        multiple: ',',
      },
    ],
    transport: {
      submit: ({ data, params }) => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/save-documents/batch`,
          method: 'PUT',
          data: { ...baseData, accessDocumentList: data },
          params: {
            ...params,
            customizeUnitCode: DetailProjectDocListBatchEditCode,
          },
        };
      },
    },
  };
};
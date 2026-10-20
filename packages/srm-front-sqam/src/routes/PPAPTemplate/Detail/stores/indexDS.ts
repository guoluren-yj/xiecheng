import { FieldType, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { isArray, isNil } from 'lodash';

import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { RegEx, TempTableCustCode, TempSearchCustCode } from '../../utils/type';

const tenantId = getCurrentOrganizationId();
interface MyDataSetProps extends DataSetProps {
  validationCode?: string,
  validationTitle?: string,
};


// 基本信息ds
export const headerDS = (templateId, copyFlag): MyDataSetProps => {
  return {
    primaryKey: 'templateId',
    cacheSelection: false,
    forceValidate: true,
    validationCode: 'header',
    autoQuery: false,
    dataToJSON: DataToJSON.all,
    validationTitle: intl.get(`sqam.ppap.model.template.baseInfo`).d('基本信息'),
    queryParameter: { templateId },
    autoCreate: true,
    fields: [
      {
        name: 'templateNum',
        type: FieldType.string,
        required: true,
        disabled: templateId && !copyFlag,
        label: intl.get(`sqam.ppap.model.template.templateNum`).d('模板编码'),
      },
      {
        name: 'templateName',
        type: FieldType.intl,
        required: true,
        label: intl.get(`sqam.ppap.model.template.templateName`).d('模板名称'),
      },
      {
        name: 'versionNumber',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.version`).d('版本号'),
      },
      {
        name: 'templateStatus',
        type: FieldType.string,
        lookupCode: 'SQAM.PPAP_TEMPLATE_STATUS',
        defaultValue: 'UNPUBLISHED',
        label: intl.get(`sqam.ppap.model.template.templateStatus`).d('模板状态'),
      },
      {
        name: 'displayStatus',
        type: FieldType.string,
        defaultValue: 'UNPUBLISHED',
        label: intl.get(`hzero.common.common.status`).d('状态'),
        lookupCode: 'SQAM.PPAP_TEMPLATE_STATUS',
      },
      {
        name: 'enableFlag',
        type: FieldType.string,
        label: intl.get('hzero.common.model.common.enableFlag').d('是否启用'),
        lookupCode: 'HPFM.FLAG',
        defaultValue: '1',
      },
      {
        name: 'enableSingleItemFlag',
        type: FieldType.boolean,
        label: intl.get('sqam.ppap.model.template.enablePPAPSumFlag').d('是否启用PPAP项目组'),
        trueValue: 1,
        falseValue: 0,
        // lookupCode: 'HPFM.FLAG',
        // defaultValue: 'N',
      },
      {
        name: 'createdByName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.creator`).d('创建人'),
      },
      {
        name: 'lastUpdatedByName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.updater`).d('更新人'),
      },
      {
        name: 'lastUpdateDate',
        type: FieldType.dateTime,
        label: intl.get(`sqam.ppap.model.template.updateTime`).d('最后更新时间'),
      },
      {
        name: 'publishedByName',
        label: intl.get('hzero.common.entity.publisher').d('发布人'),
        type: FieldType.string,
        transformResponse: (_, object) => {
          const { publishedByName, publishedLoginName } = object;
          return publishedLoginName ? `${publishedByName}(${publishedLoginName})` : publishedByName;
        },
      },
      {
        name: 'publishedDate',
        label: intl.get('hzero.common.date.releaseTime').d('发布时间'),
        type: FieldType.dateTime,
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SQAM}/v1/${tenantId}/access-template-headers/detail/${templateId}`,
          method: 'GET',
        };
      },
      submit: ({ data, dataSet }) => {
        const submitType = dataSet?.getState('submitType');
        switch (submitType) {
          case 'save':
            return {
              url: `${SRM_SQAM}/v1/${tenantId}/access-template-headers/update`,
              data: data[0],
              method: 'POST',
            };
          case 'create':
            return {
              url: `${SRM_SQAM}/v1/${tenantId}/access-template-headers/create`,
              data: data[0],
              method: 'POST',
            };
          case 'release':
            return {
              url: `${SRM_SQAM}/v1/${tenantId}/access-template-headers/release`,
              data: data[0],
              method: 'PUT',
            };
          case 'copy':
            return {
              url: `${SRM_SQAM}/v1/${tenantId}/access-template-headers/copy`,
              data: data[0],
              method: 'POST',
            };
          default:
        }
        return {
          url: `${SRM_SQAM}/v1/${tenantId}/access-template-headers/create`,
          data: data[0],
          method: 'POST',
        };
      },
      destroy: () => {
        return {
          url: `${SRM_SQAM}/v1/${tenantId}/access-template-headers/delete`,
          method: 'DELETE',
        };
      },
    },
  };
};

export const approvalLineDS = (templateId): MyDataSetProps => {
  return {
    // autoCreate: true,
    selection: false,
    validationCode: 'approvalLine',
    paging: false,
    // dataToJSON: DataToJSON.selected,
    validationTitle: intl.get(`sqam.ppap.model.template.projectApprovalWay`).d('项目审批方式'),
    fields: [
      {
        name: 'approvePoint',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.projectNode`).d('项目节点'),
        disabled: true,
        lookupCode: 'SQAM.PPAP_PROJECT_APPROVE_POINT',
      },
      {
        name: 'approveMethod',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.approvalWay`).d('审批方式'),
        lookupCode: '',
        dynamicProps: {
          lookupCode: ({ record }) =>
            record?.get('approvePoint') === 'ALTER'
              ? 'SQAM.PPAP_PROJECT_ALTER_APPROVE_METHOD'
              : 'SQAM.PPAP_PROJECT_APPROVE_METHOD',
          disabled: ({ record, dataSet }) => {
            const { enableSingleItemFlag } = dataSet?.parent?.current?.get(['enableSingleItemFlag']) || {};
            return record?.get('approvePoint') === 'ALTER' && Number(enableSingleItemFlag) === 1;
          },
        },
      },
      {
        name: 'approveRoleLov',
        type: FieldType.object,
        label: intl.get(`sqam.ppap.model.template.approvalRole`).d('审批角色'),
        lovCode: 'SSLM.TENANT.ROLE_ENABLE_TABLE',
        dynamicProps: {
          // 当审批方式是功能审批时可编辑，审批方式是功能审批时必输
          disabled: ({ record }) => record?.get('approveMethod') !== 'FUNCTION',
          required: ({ record }) => record?.get('approveMethod') === 'FUNCTION',
          lovPara: () => ({
            tenantId,
          }),
        },
      },
      {
        name: 'roleName',
        type: FieldType.string,
        bind: 'approveRoleLov.name',
      },
      {
        name: 'roleCode',
        type: FieldType.string,
        bind: 'approveRoleLov.code',
      },
      {
        name: 'roleId',
        type: FieldType.string,
        bind: 'approveRoleLov.id',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SQAM}/v1/${tenantId}/access-template-approves/detail/${templateId}`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_SQAM}/v1/${tenantId}/access-template-approves/create`,
          method: 'POST',
          data,
        };
      },
    },
  };
};

export const deliverableLineDS = (templateId): MyDataSetProps => {
  return {
    validationCode: 'deliverableLine',
    primaryKey: 'templateDocumentId',
    pageSize: 20,
    // dataToJSON: DataToJSON.selected,
    validationTitle: intl.get(`sqam.ppap.model.template.deliverableConfig`).d('交付物配置'),
    fields: [
      {
        name: 'documentNum',
        type: FieldType.string,
        required: true,
        label: intl.get(`sqam.ppap.model.template.deliverableNum`).d('交付物编号'),
        pattern: /^(?!.*-.*$)/,
        defaultValidationMessages: {
          patternMismatch: intl.get('sqam.ppap.view.validation.documentNum').d('包含非法字符:"-"'),
        },
      },
      {
        name: 'documentName',
        type: FieldType.intl,
        required: true,
        label: intl.get(`sqam.ppap.model.template.deliverableName`).d('交付物名称'),
      },
      {
        name: 'documentAttachmentUuid',
        type: FieldType.attachment,
        label: intl.get(`sqam.ppap.model.template.fileTemplete`).d('文件模板'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: 'sqam-ppap-deliver',
      },
      {
        name: 'camp',
        type: FieldType.string,
        required: true,
        label: intl.get(`sqam.ppap.model.template.responsibleParty`).d('责任方'),
        lookupCode: 'SQAM.PPAP_CAMP',
      },
      {
        name: 'documentSupplierFlag',
        label: intl.get(`sqam.ppap.model.template.documentSupplierFlag`).d('供应商是否可见'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        transformResponse: (value) => (!isNil(value) ? Number(value) : null),
        defaultValue: 1,
        dynamicProps: {
          disabled: ({ record }) => record?.get('camp') !== 'PURCHASER',
        },
      },
      {
        name: 'supplierVisibleFlag',
        label: intl.get(`sqam.ppap.model.template.supplierVisibleFlag`).d('采购方附件销售方可见'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        transformResponse: (value) => (!isNil(value) ? Number(value) : null),
        dynamicProps: {
          disabled: ({ record }) => Number(record?.get('documentSupplierFlag')) === 0 || record?.get('camp') !== 'PURCHASER',
        },
      },
      {
        name: 'autoReferAttachmentFlag',
        label: intl.get(`sqam.ppap.model.template.autoReferAttachmentFlag`).d('模板带入责任方附件'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        transformResponse: (value) => (!isNil(value) ? Number(value) : null),
        help: intl.get(`sqam.ppap.model.template.autoReferAttachmentFlagTips`).d('当启用时，会将文件模板直接传至采购方/销售方附件分区中'),
      },
      {
        name: 'documentUploadPoint',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.documentUploadPoint`).d('附件上传节点'),
        lookupCode: 'SQAM.PPAP_DOCUMENT_UPLOAD_POINT',
        defaultValue: 'PROJECT_PUBLISH',
        required: true,
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
            tenantId,
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
      // 采购方指定人
      {
        name: 'appointorLov',
        type: FieldType.object,
        label: intl.get(`sqam.ppap.model.template.appointor`).d('采购方指定人'),
        lovCode: 'SPRM.EMPLOYEE_LIST_URL_NUM',
        dynamicProps: {
          disabled: ({ record }) => record?.get('camp') !== 'PURCHASER',
          lovPara: () => ({
            tenantId,
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
            tenantId,
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
            tenantId,
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
      read: () => {
        return {
          url: `${SRM_SQAM}/v1/${tenantId}/access-template-documents/page/${templateId}`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_SQAM}/v1/${tenantId}/access-template-documents/create`,
          method: 'POST',
          data,
        };
      },
      destroy: () => {
        return {
          url: `${SRM_SQAM}/v1/${tenantId}/access-template-documents/delete`,
          method: 'DELETE',
        };
      },
    },
  };
};

export const stageLineDS = (templateId): MyDataSetProps => {
  return {
    validationCode: 'stageLine',
    primaryKey: 'templateStageId',
    // dataToJSON: DataToJSON.selected,
    pageSize: 20,
    validationTitle: intl.get(`sqam.ppap.model.template.stageConfig`).d('阶段配置'),
    fields: [
      {
        name: 'sequence',
        type: FieldType.number,
        required: true,
        label: intl.get(`sqam.ppap.model.template.order`).d('顺序'),
        pattern: RegEx.ISNUMBER,
        defaultValidationMessages: {
          patternMismatch: intl.get('sqam.ppap.model.verify.number').d('请输入大于0的数字'),
        },
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        required: true,
        label: intl.get(`sqam.ppap.model.template.stageNum`).d('阶段编号'),
      },
      {
        name: 'stageName',
        type: FieldType.intl,
        required: true,
        label: intl.get(`sqam.ppap.model.template.stageName`).d('阶段名称'),
      },
      {
        name: 'stageOpenType',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.stageEnableVerify`).d('阶段开启校验'),
        lookupCode: 'SQAM.PPAP_STAGE_OPEN_TYPE',
        required: true,
      },
      {
        name: 'stageCloseType',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.stageUnEnableVerify`).d('阶段关闭校验'),
        required: true,
        lookupCode: 'SQAM.PPAP_STAGE_CLOSE_TYPE',
      },
      {
        name: 'closeApproveMethod',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.closeStageApprovalWap`).d('阶段关闭审批方式'),
        lookupCode: 'SQAM.PPAP_STAGE_APPROVE_METHOD',
        required: true,
      },
      {
        name: 'closeApproveType',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.closeStageVerifierType`).d('阶段关闭审批人类型'),
        lookupCode: 'SQAM.PPAP_STAGE_APPROVER_TYPE',
        dynamicProps: {
          // 当审批方式是功能审批时可编辑，审批方式是功能审批时必输
          disabled: ({ record }) => record?.get('closeApproveMethod') !== 'FUNCTION',
          required: ({ record }) => record?.get('closeApproveMethod') === 'FUNCTION',
        },
      },
      {
        name: 'roleNumLov',
        type: FieldType.object,
        label: intl.get(`sqam.ppap.model.template.closeStageVerifier`).d('阶段关闭审批人'),
        dynamicProps: {
          disabled: ({ record }) => record?.get('closeApproveMethod') !== 'FUNCTION',
          required: ({ record }) => record?.get('closeApproveMethod') === 'FUNCTION',
          lovCode: ({ record }) => record?.get('closeApproveType') === 'EMPLOYEE' ? 'SPRM.EMPLOYEE_LIST_URL_NUM' : 'SSLM.TENANT.ROLE_ENABLE_TABLE',
          lovPara: () => ({
            tenantId,
          }),
        },
      },
      {
        name: 'employeeName',
        dynamicProps: {
          bind: ({ record, dataSet }) => {
            if (record?.get('closeApproveType') === 'EMPLOYEE') {
              const textField = record.getField('roleNumLov', dataSet)?.get('textField') || 'name';
              return `roleNumLov.${textField}`;
            }
          },
        },
      },
      {
        name: 'roleName',
        dynamicProps: {
          bind: ({ record }) => record?.get('closeApproveType') !== 'EMPLOYEE' ? 'roleNumLov.name' : undefined,
        },
      },
      {
        name: 'roleCode',
        dynamicProps: {
          bind: ({ record }) => record?.get('closeApproveType') !== 'EMPLOYEE' ? 'roleNumLov.code' : undefined,
        },
      },
      {
        name: 'roleId',
        dynamicProps: {
          bind: ({ record }) => record?.get('closeApproveType') !== 'EMPLOYEE' ? 'roleNumLov.id' : undefined,
        },
      },
      {
        name: 'employeeNum',
        dynamicProps: {
          bind: ({ record }) => record?.get('closeApproveType') === 'EMPLOYEE' ? 'roleNumLov.employeeNum' : undefined,
        },
      },
      {
        name: 'employeeId',
        dynamicProps: {
          bind: ({ record }) => record?.get('closeApproveType') === 'EMPLOYEE' ? 'roleNumLov.employeeId' : undefined,
        },
      },
      {
        name: 'noDocumentStageFlag',
        type: FieldType.boolean,
        label: intl.get(`sqam.ppap.model.template.noDocumentStageFlag`).d('无交付物阶段'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          disabled: ({ record }) => record?.get('stageCloseType') === 'DOC_COMPLETED',
        },
      },
      {
        name: 'documentLov',
        type: FieldType.object,
        label: intl.get(`sqam.ppap.model.template.deliverableDetail`).d('交付物清单'),
        lovCode: 'SQAM.PPAP_TEMPLATE_DOCUMENT',
        multiple: true,
        textField: 'documentName',
        dynamicProps: {
          lovPara: () => ({
            tenantId,
            templateId,
          }),
          disabled: ({ record }) => Number(record?.get('noDocumentStageFlag')) === 1,
          required: ({ record }) => Number(record?.get('noDocumentStageFlag')) !== 1,
        },
      },
      {
        name: 'documentName',
        type: FieldType.string,
        bind: 'documentLov.documentName',
        transformResponse: (_, record) => {
          const { documentNumsMeaning = '' } = record;
          return documentNumsMeaning;
        },
        multiple: ',',
      },
      {
        name: 'documentNums',
        bind: 'documentLov.documentNum',
        type: FieldType.string,
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        multiple: ',',
      },
      {
        name: 'documentNumsMeaning',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.deliverableDetail`).d('交付物清单'),
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
      {
        name: 'accessSupplierFlag',
        label: intl.get(`sqam.ppap.model.template.accessSupplierFlag`).d('供应商是否可见'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        transformResponse: (value) => (!isNil(value) ? Number(value) : null),
        defaultValue: 1,
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SQAM}/v1/${tenantId}/access-template-stages/page/${templateId}`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_SQAM}/v1/${tenantId}/access-template-stages/create`,
          method: 'POST',
          data,
        };
      },
      destroy: () => {
        return {
          url: `${SRM_SQAM}/v1/${tenantId}/access-template-stages/delete`,
          method: 'DELETE',
        };
      },
    },
  };
};

export const quoteDeliveryTempListDS = (): DataSetProps => {
  return {
    pageSize: 20,
    autoQuery: false,
    dataToJSON: DataToJSON.selected,
    // cacheSelection: true,
    primaryKey: 'templateDocumentId',
    fields: [
      {
        name: 'documentNum',
        type: FieldType.string,
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.documentNum`).d('交付物编码'),
      },
      {
        name: 'operation',
        type: FieldType.string,
        label: intl.get('hzero.common.oprate').d('操作'),
      },
      {
        name: 'documentName',
        type: FieldType.string,
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.documentName`).d('交付物名称'),
      },
      {
        name: 'documentAttachmentUuid',
        type: FieldType.attachment,
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.documentAttachmentUuid`).d('文件模板'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: 'sqam-ppap-deliver',
      },
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.enableFlag').d('状态'),
        trueValue: 1,
        falseValue: 0,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
      {
        name: 'camp',
        type: FieldType.string,
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.camp`).d('责任方'),
        lookupCode: 'SQAM.PPAP_CAMP',
      },
      {
        name: 'supplierVisibleFlag',
        label: intl.get(`sqam.ppap.model.template.supplierVisibleFlag`).d('采购方附件销售方可见'),
        type: FieldType.string,
      },
      {
        name: 'autoReferAttachmentFlag',
        label: intl.get(`sqam.ppap.model.template.autoReferAttachmentFlag`).d('模板带入责任方附件'),
        type: FieldType.string,
        help: intl.get(`sqam.ppap.model.template.autoReferAttachmentFlagTips`).d('当启用时，会将文件模板直接传至采购方/销售方附件分区中'),
      },
      {
        name: 'approveMethod',
        type: FieldType.string,
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.approveMethod`).d('审批规则'),
        lookupCode: 'SQAM.PPAP_DOCUMENT_APPROVE_METHOD',
      },
      {
        name: 'approveType',
        type: FieldType.string,
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.approveType`).d('审核人类型'),
        lookupCode: 'SQAM.PPAP_APPROVER_TYPE',
      },
      {
        name: 'employeeName',
        type: FieldType.string,
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.roleCode`).d('审核人'),
      },
      {
        name: 'visibleEmployeeName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.visibleEmployeeLov`).d('采购方可见员工'),
      },
      {
        name: 'documentUploadPoint',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.documentUploadPoint`).d('附件上传节点'),
        lookupCode: 'SQAM.PPAP_DOCUMENT_UPLOAD_POINT',
      },
    ],
    queryParameter: {
      customizeUnitCode: [TempTableCustCode, TempSearchCustCode].join(),
    },
    transport: {
      read: () => ({
        url: `${SRM_SQAM}/v1/${tenantId}/access-template-documents/list?enableFlag=1`,
        method: 'GET',
      }),
      submit: () => ({
        url: `${SRM_SQAM}/v1/${tenantId}/access-template-documents/obtain-new-uuid`,
        method: 'POST',
      }),
    },
    feedback: { submitSuccess() { } },
  };
};

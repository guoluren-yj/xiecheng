import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { isArray }from 'lodash';
import { ListTableCustCode, ListSearchCustCode, documentUploadBucket } from './type';

const organizationId = getCurrentOrganizationId();

export const ListDS = (): DataSetProps => {
  return {
    pageSize: 20,
    autoQuery: true,
    dataToJSON: DataToJSON.selected,
    queryParameter: {
      customizeUnitCode: [ListTableCustCode, ListSearchCustCode].join(),
    },
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
        bucketDirectory: documentUploadBucket,
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
        name: 'documentSupplierFlag',
        label: intl.get(`sqam.ppap.model.template.documentSupplierFlag`).d('供应商是否可见'),
        type: FieldType.string,
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
        name: 'documentUploadPoint',
        label: intl.get(`sqam.ppap.model.template.documentUploadPoint`).d('附件上传节点'),
        type: FieldType.string,
        lookupCode: 'SQAM.PPAP_DOCUMENT_UPLOAD_POINT',
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
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.visibleEmployeeLov`).d('采购方可见员工'),
      },
    ],
    transport: {
      read: () => ({
        url: `${SRM_SQAM}/v1/${organizationId}/access-template-documents/list`,
        method: 'GET',
      }),
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        if (submitType === 'sync') {
          return {
            url: `${SRM_SQAM}/v1/${organizationId}/access-template-documents/sync`,
            method: 'POST',
          };
        }
      },
    },
  };
};

export const AddDS = (isView: boolean): DataSetProps => {
  return {
    fields: [
      {
        name: 'documentNum',
        type: FieldType.string,
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.documentNum`).d('交付物编码'),
        required: !isView,
        pattern: /^(?!.*-.*$)/,
        defaultValidationMessages: {
          patternMismatch: intl.get('sqam.ppap.view.validation.documentNum').d('包含非法字符:"-"'),
        },
      },
      {
        name: 'documentName',
        type: FieldType.intl,
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.documentName`).d('交付物名称'),
        required: !isView,
      },
      {
        name: 'camp',
        type: FieldType.string,
        lookupCode: 'SQAM.PPAP_CAMP',
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.camp`).d('责任方'),
        required: !isView,
      },
      {
        name: 'documentSupplierFlag',
        label: intl.get(`sqam.ppap.model.template.documentSupplierFlag`).d('供应商是否可见'),
        type: FieldType.string,
        lookupCode: 'HPFM.FLAG',
        defaultValue: 1,
      },
      {
        name: 'supplierVisibleFlag',
        label: intl.get(`sqam.ppap.model.template.supplierVisibleFlag`).d('采购方附件销售方可见'),
        type: FieldType.string,
        lookupCode: 'HPFM.FLAG',
        dynamicProps: {
          disabled: ({ record }) => Number(record?.get('documentSupplierFlag')) === 0,
        },
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
        lookupCode: 'SQAM.PPAP_DOCUMENT_APPROVE_METHOD',
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.approveMethod`).d('审批规则'),
        required: !isView,
      },
      {
        name: 'approveType',
        type: FieldType.string,
        lookupCode: 'SQAM.PPAP_APPROVER_TYPE',
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.approveType`).d('审核人类型'),
        required: true,
        dynamicProps: {
          // 当审批方式是功能审批时可编辑，审批方式是功能审批时必输
          disabled: ({ record }) => record?.get('approveMethod') !== 'FUNCTION',
          required: ({ record }) => record?.get('approveMethod') === 'FUNCTION',
        },
      },
      {
        name: 'employeeLov',
        type: FieldType.object,
        lovCode: 'SPRM.EMPLOYEE_LIST_URL_NUM', // 为了拿textField，解决显示字段问题
      },
      {
        name: 'roleNumLov',
        type: FieldType.object,
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.roleCode`).d('审核人'),
        required: true,
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
              const textField = dataSet.getField('roleNumLov')?.get('textField', record);
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
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.appointor`).d('采购方指定人'),
        lovCode: 'SPRM.EMPLOYEE_LIST_URL_NUM',
        dynamicProps: {
          disabled: ({ record }) => record?.get('camp') !== 'PURCHASER',
          lovPara: () => ({
            tenantId: organizationId,
          }),
        },
        help: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.appointorTips`).d('当选择指定人时，采购方仅指定账户可进行交付物上传'),
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
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.purchaseVisibleRole`).d('采购方可见角色'),
        lovCode: 'SSLM.TENANT.ROLE_ENABLE_TABLE',
        multiple: true,
        dynamicProps: {
          lovPara: () => ({
            tenantId: organizationId,
          }),
        },
        help: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.purchaseVisibleRoleTips`).d('当选择可见角色时，采购方仅指定角色可查看该交付物。'),
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
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.visibleEmployeeLov`).d('采购方可见员工'),
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
      {
        name: 'documentAttachmentUuid',
        type: FieldType.attachment,
        label: intl.get(`sqam.deliveryTemplateDefinition.model.deliveryTemplateDefinition.documentAttachmentUuid`).d('文件模板'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: documentUploadBucket,
        required: !isView,
      },
    ],
    transport: {
      submit: () => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-template-documents/create`,
          method: 'POST',
        };
      },
    },

  };
};

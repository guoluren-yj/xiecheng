import intl from 'utils/intl';
import moment from 'moment';
import { SRM_MDM, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';
const bucketDirectory= 'smdm-material-certificate';

// 基本信息
const headerInfoDS = ({ itemAuthFeeHeaderId }) => ({
  autoQuery: false,
  autoCreate: false,
  dataToJSON: 'all',
  forceValidate: true,
  transport: {
    read: {
      url: `${SRM_MDM}/v1/${tenantId}/item-auth-fee-headers/${itemAuthFeeHeaderId}`,
      method: 'GET',
    },
  },
  fields: [
    {
      name: 'nodeVersionNumber',
      type: 'string',
      label: intl.get(`${commonPrompt}.nodeVersionNumber`).d('节点版本'),
      disabled: true,
    },
    {
      name: 'feeHeaderNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.feeHeaderNum`).d('物料认证反馈单号'),
      disabled: true,
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
      disabled: true,
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
      disabled: true,
    },
    {
      name: 'companyId',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      textField: 'companyName',
      valueField: 'companyId',
      label: intl.get(`${commonPrompt}.company`).d('公司'),
      lovPara: { tenantId, enabledFlag: 1 },
      transformResponse(value, data) {
        if (value) {
          return {
            companyId: value,
            companyName: data.companyName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.companyId,
      disabled: true,
    },
    {
      name: 'companyName',
      type: 'string',
      bind: 'companyId.companyName',
    },
    {
      name: 'supplierId',
      type: 'object',
      required: true,
      lovCode: 'SPRM.SUPPLIER',
      label: intl.get(`${commonPrompt}.supplier`).d('供应商'),
      dynamicProps: {
        lovPara({ record }) {
          return {
            tenantId,
            enabledFlag: 1,
            companyId: record?.get('companyId')?.companyId,
          };
        },
      },
      disabled: true,
      transformResponse(value, data) {
        if (value || data.supplierCompanyId) {
          return {
            supplierId: value,
            supplierNume: data.supplierCode,
            supplierName: data.supplierName,
            supplierCompanyId: data.supplierCompanyId,
            supplierCompanyName: data.supplierCompanyName,
            supplierTenantId: data.supplierTenantId,
            displaySupplierName: data.displaySupplierName,
            supplierCompanyNUm: data.supplierCompanyCode,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.supplierId,
    },
    {
      name: 'supplierCode',
      type: 'string',
      bind: 'supplierId.supplierNum',
    },
    {
      name: 'supplierName',
      type: 'string',
      bind: 'supplierId.supplierName',
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierId.supplierCompanyId',
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      bind: 'supplierId.supplierCompanyName',
    },
    {
      name: 'supplierTenantId',
      type: 'string',
      bind: 'supplierId.supplierTenantId',
    },
    {
      name: 'supplierCompanyCode',
      type: 'string',
      bind: 'supplierId.supplierCompanyNum',
    },
    {
      name: 'displaySupplierName',
      type: 'string',
      bind: 'supplierId.displaySupplierName',
    },
    {
      name: 'categoryId',
      type: 'object',
      // lovCode: 'SMDM.ITEM_CATEGORY_ENCRYPTION',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      textField: 'categoryName',
      valueField: 'categoryId',
      label: intl.get(`${commonPrompt}.category`).d('采购品类'),
      transformResponse(value, data) {
        if (value) {
          return {
            categoryId: value,
            categoryName: data.categoryName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.categoryId,
      disabled: true,
      optionsProps: {
        paging: 'server',
        record: {
          dynamicProps: {
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
      },
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId,
          enabledFlag: 1,
          businessObjectCode:
            record?.get('sourcePlatform') === 'SRM' ? 'SRM_C_SMDM_ITEM_AUTH_REQ' : null,
        }),
      },
    },
    {
      name: 'categoryName',
      bind: 'categoryId.categoryName',
    },
    {
      name: 'unitId',
      type: 'object',
      lovCode: 'SPRM.USER_UNIT',
      textField: 'unitName',
      valueField: 'unitId',
      label: intl.get(`${commonPrompt}.department`).d('部门'),
      lovPara: { tenantId, enabledFlag: 1 },
      transformResponse(value, data) {
        if (value) {
          return {
            unitId: value,
            unitName: data.unitName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.unitId,
      disabled: true,
    },
    {
      name: 'unitName',
      bind: 'unitId.unitName',
    },
    {
      name: 'prTypeId',
      type: 'object',
      lovCode: 'SPUC.PR_DEMAND_TYPE',
      textField: 'prTypeName',
      valueField: 'prTypeId',
      label: intl.get(`${commonPrompt}.prType`).d('采购申请类型'),
      lovPara: { tenantId },
      transformResponse(value, data) {
        if (value) {
          return {
            prTypeId: value,
            prTypeName: data.prTypeName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.prTypeId,
      disabled: true,
    },
    {
      name: 'prTypeName',
      bind: 'prTypeId.prTypeName',
    },
    {
      name: 'authFeeStatusCode',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_FEE_STATUS',
      label: intl.get(`hzero.common.common.status`).d('状态'),
      disabled: true,
    },
    {
      name: 'sourcePlatform',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_SOURCE_PLATFORM',
      label: intl.get(`${commonPrompt}.source`).d('来源'),
      disabled: true,
    },
    {
      name: 'strategyName',
      type: 'string',
      label: intl.get(`${commonPrompt}.materialAuthStrategy`).d('物料认证策略'),
      disabled: true,
    },
    {
      name: 'reqRemark',
      type: 'string',
      label: intl.get(`${commonPrompt}.reqRemark`).d('物料认证申请单备注'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`${commonPrompt}.remark`).d('备注'),
      dynamicProps: {
        disabled: ({ record }) =>
          ['SAMPLE_DELIVERY_WAIT_FEEDBACK'].includes(record.get('authFeeStatusCode')),
      },
    },
    {
      name: 'exportExternalStatusCode',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_EXPORT_EXT_STA',
      label: intl.get(`${commonPrompt}.exportExternalStatusCode`).d('物料认证完成导出外部状态'),
    },
    {
      name: 'exportExternalErrorReason',
      type: 'string',
      label: intl.get(`${commonPrompt}.exportExternalErrorReason`).d('物料认证完成导出失败原因'),
    },
    {
      name: 'externalNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.feeExternalNum`).d('反馈单外部流程编码'),
    },
    {
      name: 'sampleType',
      type: 'string',
      lookupCode: 'SMDM.ITEM_AUTH_SAMPLE_TYPE',
      label: intl.get(`${commonPrompt}.sampleType`).d('送样类型'),
      disabled: true,
    },
    {
      name: 'receivingDepartmentId',
      type: 'object',
      lovCode: 'SMDM.ITEM_AUTH_RECEIVING_DEPA',
      label: intl.get(`${commonPrompt}.receivingDepartment`).d('接收部门'),
      transformResponse(value, data) {
        if (value) {
          return {
            unitId: value,
            unitName: data.receivingDepartmentName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.unitId,
      disabled: true,
    },
    {
      name: 'receivingDepartmentName',
      bind: 'receivingDepartmentId.unitName',
    },
    {
      name: 'sampleDeliveryAddress',
      type: 'string',
      label: intl.get(`${commonPrompt}.sampleDeliveryAddress`).d('送样地址'),
      disabled: true,
    },
    {
      name: 'sampleRecipient',
      type: 'string',
      label: intl.get(`${commonPrompt}.sampleRecipient`).d('接样人'),
      disabled: true,
    },
    {
      name: 'recipientContactNumber',
      type: 'number',
      numberGrouping: false,
      label: intl.get(`${commonPrompt}.recipientContactNumber`).d('接样人联系电话'),
      disabled: true,
    },
    {
      name: 'certificationConclusion',
      type: 'string',
      defaultValue: 'QUALIFIED',
      lookupCode: 'SMDM.ITEM_AUTH_CONCLUSION',
      label: intl.get(`${commonPrompt}.certificationConclusion`).d('认证结论'),
      disabled: true,
    },
    {
      name: 'supplierCategoryId',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER_CATEGORY',
      disabled: true,
      transformResponse(value, data) {
        if (value) {
          return {
            categoryId: value,
            categoryDescription: data?.supplierCategoryDescription,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.categoryId,
      label: intl.get(`${commonPrompt}.supplierCategoryId`).d('供应商分类'),
    },
  ],
});

// 明细信息
const detailInfoDS = ({ itemAuthFeeHeaderId }) => ({
  pageSize: 20,
  autoQuery: false,
  autoCreate: false,
  cacheSelection: true,
  cacheModified: true,
  forceValidate: true,
  selection: false,
  primaryKey: 'itemAuthFeeLineId',
  transport: {
    read: {
      url: `${SRM_MDM}/v1/${tenantId}/item-auth-fee-lines/${itemAuthFeeHeaderId}`,
      method: 'GET',
    },
  },
  fields: [
    {
      name: 'feeLineNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
    },
    {
      name: 'categoryId',
      type: 'object',
      // lovCode: 'SMDM.ITEM_CATEGORY_ENCRYPTION',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      textField: 'categoryName',
      valueField: 'categoryId',
      label: intl.get(`${commonPrompt}.materialCategory`).d('物料品类'),
      // lovPara: { tenantId, enabledFlag: 1, businessObjectCode: 'SRM_C_SMDM_ITEM_AUTH_REQ' },
      transformResponse(value, data) {
        if (value) {
          return {
            categoryId: value,
            categoryName: data.categoryName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.categoryId,
      optionsProps: {
        paging: 'server',
        record: {
          dynamicProps: {
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
      },
      dynamicProps: {
        lovPara: ({ dataSet }) => ({
          tenantId,
          enabledFlag: 1,
          businessObjectCode:
            dataSet?.getState('sourcePlatform') === 'SRM' ? 'SRM_C_SMDM_ITEM_AUTH_REQ' : null,
        }),
      },
    },
    {
      name: 'categoryName',
      bind: 'categoryId.categoryName',
    },
    {
      name: 'itemCode',
      label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
      type: 'string',
    },
    {
      name: 'itemName',
      label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
      type: 'string',
    },
    {
      name: 'formalItemCode',
      label: intl.get(`${commonPrompt}.formalItemCode`).d('正式物料编码'),
      type: 'object',
      lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
      textField: 'itemCode',
      valueField: 'itemCode',
      lovPara: { tenantId, enabledFlag: 1 },
      transformResponse(value, data) {
        if (value) {
          return {
            itemCode: value,
            itemId: data.formalItemId,
            itemName: data.formalItemName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.itemCode,
    },
    {
      name: 'formalItemId',
      bind: 'formalItemCode.itemId',
    },
    {
      name: 'formalItemName',
      bind: 'formalItemCode.itemName',
      label: intl.get(`${commonPrompt}.formalItemName`).d('正式物料名称'),
      type: 'string',
    },
    {
      name: 'uomId',
      lovCode: 'SMDM.DUAL_UOM_ID',
      type: 'object',
      textField: 'uomName',
      // required: true,
      label: intl.get(`${commonPrompt}.uomName`).d('单位'),
      transformResponse(value, data) {
        if (value) {
          return {
            uomId: value,
            uomName: data.uomName,
            uomCode: data.uomCode,
            uomCodeAndName: data.uomCodeAndName,
            uomPrecision: data.uomPrecision,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.uomId,
    },
    {
      name: 'uomPrecision',
      type: 'number',
      bind: 'uomId.uomPrecision',
    },
    {
      name: 'uomCode',
      bind: 'uomId.uomCode',
    },
    {
      name: 'uomName',
      bind: 'uomId.uomName',
    },
    {
      name: 'uomCodeAndName',
      bind: 'uomId.uomCodeAndName',
    },
    {
      name: 'feedbackDate',
      type: 'date',
      required: true,
      min: moment('1970-01-01'),
      label: intl.get(`${commonPrompt}.feedbackDate`).d('反馈日期'),
    },
    {
      name: 'quantity',
      label: intl.get(`${commonPrompt}.neededQuantity`).d('需求数量'),
      type: 'number',
    },
    {
      name: 'neededDate',
      label: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
      type: 'date',
      min: moment('1970-01-01'),
    },
    {
      name: 'poNum',
      label: intl.get(`${commonPrompt}.poNum`).d('订单单号'),
      type: 'string',
    },
    {
      name: 'sourceNum',
      label: intl.get(`${commonPrompt}.sourceNum`).d('寻源单号'),
      type: 'string', 
    },
    {
      name: 'sourcePrice',
      label: intl.get(`${commonPrompt}.sourcePrice`).d('寻源价格'),
      type: 'number',
    },
    {
      name: 'attachment',
      label: intl.get(`${commonPrompt}.attachment`).d('附件'),
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      name: 'attachmentUuid',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      label: intl.get(`${commonPrompt}.purchaseAttachment`).d('采购方附件'),
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      name: 'supplierAttachmentUuid',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      label: intl.get(`${commonPrompt}.supplierAttachment`).d('供应商附件'),
      dynamicProps: {
        required: ({ record }) => Number(record.get('attachmentRequiredFlag')) === 1,
      },
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      name: 'nodeAttachmentUuid',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      label: intl.get(`${commonPrompt}.templateDownload`).d('模版下载'),
    },
    {
      name: 'certificationConclusion',
      type: 'string',
      defaultValue: 'QUALIFIED',
      lookupCode: 'SMDM.ITEM_AUTH_CONCLUSION',
      label: intl.get(`${commonPrompt}.certificationConclusion`).d('认证结论'),
      disabled: true,
    },
  ],
});

// 阶段信息
const stageInfoDS = ({ itemAuthFeeHeaderId }) => ({
  pageSize: 20,
  autoQuery: false,
  autoCreate: false,
  cacheSelection: true,
  cacheModified: true,
  selection: false,
  forceValidate: true,
  primaryKey: 'itemAuthFeeHeaderAttId',
  transport: {
    read: {
      url: `${SRM_MDM}/v1/${tenantId}/item-auth-fee-header-atts/${itemAuthFeeHeaderId}`,
      method: 'GET',
    },
  },
  fields: [
    {
      name: 'attachmentCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.attachmentCode`).d('附件编码'),
    },
    {
      name: 'attachmentName',
      type: 'string',
      label: intl.get(`${commonPrompt}.attachmentName`).d('附件名称'),
    },
    {
      name: 'requiredFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`${commonPrompt}.supplierRequiredUpload`).d('供应商附件必传'),
    },
    {
      name: 'requireUploadDate',
      label: intl.get(`${commonPrompt}.requireUploadDate`).d('要求上传时间'),
      type: 'date',
    },
    {
      name: 'attachment',
      label: intl.get(`${commonPrompt}.attachment`).d('附件'),
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      name: 'attachmentUuid',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      label: intl.get(`${commonPrompt}.purchaseAttachment`).d('采购方附件'),
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      name: 'supplierAttachmentUuid',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      label: intl.get(`${commonPrompt}.supplierAttachment`).d('供应商附件'),
      dynamicProps: {
        required: ({ record }) => Number(record.get('requiredFlag')) === 1,
      },
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      name: 'nodeAttachmentUuid',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      label: intl.get(`${commonPrompt}.templateDownload`).d('模版下载'),
    },
  ],
});

// 送样信息
const sampleInfoDS = ({ itemAuthFeeHeaderId }) => ({
  pageSize: 20,
  autoQuery: false,
  autoCreate: false,
  cacheSelection: true,
  cacheModified: true,
  forceValidate: true,
  selection: false,
  primaryKey: 'feeSampleId',
  transport: {
    read: {
      url: `${SRM_MDM}/v1/${tenantId}/item-auth-fee-samples/${itemAuthFeeHeaderId}`,
      method: 'GET',
    },
  },
  fields: [
    {
      name: 'feeSampleNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
    },
    {
      name: 'categoryId',
      type: 'object',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      textField: 'categoryName',
      valueField: 'categoryId',
      label: intl.get(`${commonPrompt}.materialCategory`).d('物料品类'),
      // lovPara: { tenantId, enabledFlag: 1, businessObjectCode: 'SRM_C_SMDM_ITEM_AUTH_REQ' },
      transformResponse(value, data) {
        if (value) {
          return {
            categoryId: value,
            categoryName: data.categoryName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.categoryId,
      optionsProps: {
        paging: 'server',
        record: {
          dynamicProps: {
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
      },
      dynamicProps: {
        lovPara: ({ dataSet }) => ({
          tenantId,
          enabledFlag: 1,
          businessObjectCode:
            dataSet?.getState('sourcePlatform') === 'SRM' ? 'SRM_C_SMDM_ITEM_AUTH_REQ' : null,
        }),
      },
    },
    {
      name: 'categoryName',
      bind: 'categoryId.categoryName',
    },
    {
      name: 'itemCode',
      label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
      type: 'string',
    },
    {
      name: 'itemName',
      label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
      type: 'string',
    },
    {
      name: 'formalItemCode',
      label: intl.get(`${commonPrompt}.formalItemCode`).d('物料编码'),
      type: 'object',
      lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
      textField: 'itemCode',
      valueField: 'itemCode',
      lovPara: { tenantId, enabledFlag: 1 },
      transformResponse(value, data) {
        if (value) {
          return {
            itemCode: value,
            itemId: data.formalItemId,
            itemName: data.formalItemName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.itemCode,
    },
    {
      name: 'formalItemId',
      bind: 'formalItemCode.itemId',
    },
    {
      name: 'formalItemName',
      bind: 'formalItemCode.itemName',
      label: intl.get(`${commonPrompt}.formalItemName`).d('正式物料名称'),
      type: 'string',
    },
    {
      name: 'quantity',
      min: 0,
      label: intl.get(`${commonPrompt}.sampleNeededQuantity`).d('送样需求数量'),
      type: 'number',
    },
    {
      name: 'neededDate',
      label: intl.get(`${commonPrompt}.sampleNeededDate`).d('送样需求日期'),
      min: moment('1970-01-01'),
      type: 'date',
    },
    {
      name: 'expectedDeliveryDate',
      label: intl.get(`${commonPrompt}.expectedDeliveryDate`).d('预计送达日期'),
      type: 'date',
      min: moment('1970-01-01'),
      required: true,
    },
    {
      name: 'sampleDeliveryMethod',
      label: intl.get(`${commonPrompt}.sampleDeliveryMethod`).d('送样方式'),
      type: 'string',
      required: true,
    },
    {
      name: 'logisticsTrackingNum',
      label: intl.get(`${commonPrompt}.logisticsTrackingNum`).d('物流单号'),
      type: 'string',
      required: true,
    },
    {
      name: 'poNum',
      label: intl.get(`${commonPrompt}.poNum`).d('订单单号'),
      type: 'string',
    },
    {
      name: 'testingDepartmentId',
      type: 'object',
      lovCode: 'SMDM.ITEM_AUTH_TESTING_DEPA',
      label: intl.get(`${commonPrompt}.testingDepartment`).d('检测部门'),
      transformResponse(value, data) {
        if (value) {
          return {
            unitId: value,
            unitName: data.testingDepartmentName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.unitId,
    },
    {
      name: 'testingDepartmentName',
      label: intl.get(`${commonPrompt}.testingDepartment`).d('检测部门'),
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      attachmentCount: 1,
      name: 'attachmentUuid',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      label: intl.get(`${commonPrompt}.purchaseAttachment`).d('采购方附件'),
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      attachmentCount: 1,
      name: 'supplierAttachmentUuid',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      label: intl.get(`${commonPrompt}.supplierAttachment`).d('供应商附件'),
      dynamicProps: {
        required: ({ record }) => Number(record.get('attachmentRequiredFlag')) === 1,
      },
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      attachmentCount: 1,
      name: 'nodeAttachmentUuid',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      label: intl.get(`${commonPrompt}.templateDownload`).d('模版下载'),
    },
    {
      type: 'string',
      name: 'purchaserRemark',
      label: intl.get(`${commonPrompt}.purchaserRemark`).d('采购方备注'),
    },
    {
      type: 'string',
      name: 'testingResult',
      lookupCode: 'SMDM.ITEM_AUTH_TESTING_RESULT',
      label: intl.get(`${commonPrompt}.testingResult`).d('检测结果'),
      disabled: true,
    },
    {
      type: 'string',
      name: 'testingInstructions',
      label: intl.get(`${commonPrompt}.testingInstructions`).d('检测说明'),
      disabled: true,
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      name: 'testingReportUuid',
      label: intl.get(`${commonPrompt}.testingReportUuid`).d('检测报告'),
      disabled: true,
    },
  ],
});

// 反馈拒绝确认
const feedbackRejectDS = () => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'feedbackRejectedReason',
      label: intl.get(`${commonPrompt}.feedbackRejectedReason`).d('反馈拒绝原因'),
      required: true,
    },
  ],
});

export { headerInfoDS, detailInfoDS, stageInfoDS, sampleInfoDS, feedbackRejectDS };

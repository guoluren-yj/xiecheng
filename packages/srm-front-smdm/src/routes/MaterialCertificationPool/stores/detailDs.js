import intl from 'utils/intl';
import moment from 'moment';
import { isArray } from 'lodash';
import { PHONE } from 'utils/regExp';
import { SRM_MDM, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { queryBatchApprovaFlag } from '_utils/utils';
import { getBatchOperationFlag } from '../util.js';

const tenantId = getCurrentOrganizationId();
// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';
const bucketDirectory= 'smdm-material-certificate';

// 基本信息
const headerInfoDS = ({ itemAuthReqHeaderId, isFirstNode, source }) => ({
  autoQuery: false,
  autoCreate: false,
  dataToJSON: 'all',
  forceValidate: true,
  transport: {
    read: {
      url: `${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/${itemAuthReqHeaderId}`,
      method: 'GET',
    },
  },
  events: {
    load: async ({ dataSet }) => {
      if (source === 'testResultEntry') {
        dataSet.every((record) => {
          if (!record.get('certificationConclusion')) {
            record.set({
              certificationConclusion: 'QUALIFIED',
            });
          }
        });
      }
      const { feeWorkflowBusinessKey, workflowBusinessKey } = dataSet.current?.get([
        'feeWorkflowBusinessKey',
        'workflowBusinessKey',
      ]);
      if (feeWorkflowBusinessKey || workflowBusinessKey) {
        // 获取审批按钮显示状态
        const approvaFlags = await queryBatchApprovaFlag([
          feeWorkflowBusinessKey || workflowBusinessKey,
        ]);
        // 获取撤销审批按钮状态
        const operationFlags = await getBatchOperationFlag([
          feeWorkflowBusinessKey || workflowBusinessKey,
        ]);
        dataSet.setState({ approvaFlags, operationFlags });
      }
    },
    update: ({ name, record, value }) => {
      if (name === 'certificationConclusion') {
        if (value) {
          const field = record.getField('certificationConclusion');
          record.set({
            certificationConclusionMeaning: field?.getText(value),
          });
        } else {
          record.set({
            certificationConclusionMeaning: null,
          });
        }
      }
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
      name: 'reqHeaderNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.reqHeaderNum`).d('物料认证单号'),
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
      required: true,
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
      dynamicProps: {
        disabled: ({ record }) =>
          !(
            ['PENDING', 'REJECTED'].includes(record.get('authReqStatusCode')) &&
            record.get('sourcePlatform') === 'SRM' &&
            isFirstNode
          ),
      },
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
        disabled: ({ record }) =>
          !(
            ['PENDING', 'REJECTED'].includes(record.get('authReqStatusCode')) &&
            record.get('sourcePlatform') === 'SRM' &&
            isFirstNode
          ),
      },
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
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      textField: 'categoryName',
      valueField: 'categoryId',
      label: intl.get(`${commonPrompt}.category`).d('采购品类'),
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
      dynamicProps: {
        disabled: ({ record }) =>
          !(['PENDING', 'REJECTED'].includes(record.get('authReqStatusCode')) && isFirstNode),
        lovPara: ({ record }) => ({
          tenantId,
          enabledFlag: 1,
          businessObjectCode:
            record?.get('sourcePlatform') === 'SRM' ? 'SRM_C_SMDM_ITEM_AUTH_REQ' : null,
        }),
      },
      optionsProps: {
        paging: 'server',
        record: {
          dynamicProps: {
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
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
      dynamicProps: {
        disabled: ({ record }) =>
          !(['PENDING', 'REJECTED'].includes(record.get('authReqStatusCode')) && isFirstNode),
      },
    },
    {
      name: 'unitName',
      bind: 'unitId.unitName',
    },
    {
      name: 'itemAuthReqHeaderMRList',
      type: 'object',
      lovCode: 'SMDM.ITEM_AUTH_NODE_ATT_USER',
      multiple: true,
      textField: 'userName',
      valueField: 'userId',
      label: intl.get(`${commonPrompt}.messageReminderNames`).d('消息提醒人'),
      lovPara: { tenantId },
      transformResponse: (value, object) => {
        const newData = object?.itemAuthReqHeaderMRList?.map((item) => ({
          ...item,
          userId: item?.userId,
          userName: item?.userName,
        }));
        return object?.itemAuthReqHeaderMRList ? newData : null;
      },
      transformRequest: (value) => value,
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
      dynamicProps: {
        disabled: ({ record }) =>
          !(['PENDING', 'REJECTED'].includes(record.get('authReqStatusCode')) && isFirstNode),
      },
    },
    {
      name: 'prTypeName',
      bind: 'prTypeId.prTypeName',
    },
    {
      name: 'authReqStatusCode',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_REQ_STATUS',
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
      name: 'remark',
      type: 'string',
      label: intl.get(`${commonPrompt}.remark`).d('备注'),
      dynamicProps: {
        disabled: ({ record }) =>
          ['TEST_RESULTS_TO_BE_ENTERED'].includes(record.get('authReqStatusCode')),
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
      label: intl.get(`${commonPrompt}.externalNum`).d('申请单外部流程编码'),
    },
    {
      name: 'feeExternalNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.feeExternalNum`).d('反馈单外部流程编码'),
    },
    {
      name: 'sampleType',
      type: 'string',
      lookupCode: 'SMDM.ITEM_AUTH_SAMPLE_TYPE',
      label: intl.get(`${commonPrompt}.sampleType`).d('送样类型'),
      dynamicProps: {
        disabled: ({ record }) =>
          !['PENDING', 'REJECTED'].includes(record.get('authReqStatusCode')),
      },
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
      dynamicProps: {
        disabled: ({ record }) =>
          !['PENDING', 'REJECTED'].includes(record.get('authReqStatusCode')),
      },
    },
    {
      name: 'receivingDepartmentName',
      bind: 'receivingDepartmentId.unitName',
    },
    {
      name: 'sampleDeliveryAddress',
      type: 'string',
      label: intl.get(`${commonPrompt}.sampleDeliveryAddress`).d('送样地址'),
      dynamicProps: {
        disabled: ({ record }) =>
          !['PENDING', 'REJECTED'].includes(record.get('authReqStatusCode')),
      },
    },
    {
      name: 'sampleRecipient',
      type: 'string',
      label: intl.get(`${commonPrompt}.sampleRecipient`).d('接样人'),
      dynamicProps: {
        disabled: ({ record }) =>
          !['PENDING', 'REJECTED'].includes(record.get('authReqStatusCode')),
      },
    },
    {
      name: 'recipientContactNumber',
      type: 'number',
      numberGrouping: false,
      validator: (value) => {
        if (value) {
          const reg = PHONE;
          if (!reg.test(value)) {
            return intl.get('hzero.common.validation.phone').d('手机格式不正确');
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
      label: intl.get(`${commonPrompt}.recipientContactNumber`).d('接样人联系电话'),
      dynamicProps: {
        disabled: ({ record }) =>
          !['PENDING', 'REJECTED'].includes(record.get('authReqStatusCode')),
      },
    },
    {
      name: 'certificationConclusion',
      type: 'string',
      defaultValue: 'QUALIFIED',
      lookupCode: 'SMDM.ITEM_AUTH_CONCLUSION',
      label: intl.get(`${commonPrompt}.certificationConclusion`).d('认证结论'),
      dynamicProps: {
        disabled: () => source !== 'testResultEntry',
      },
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
const detailInfoDS = ({
  itemAuthReqHeaderId,
  readOnly,
  pubPathFlag,
  isFirstNode,
  detailListTimeLimit,
  source,
}) => ({
  pageSize: 20,
  autoQuery: false,
  autoCreate: false,
  cacheSelection: true,
  cacheModified: true,
  forceValidate: true,
  primaryKey: 'itemAuthReqLineId',
  selection: !readOnly ? 'multiple' : false,
  transport: {
    read: {
      url: `${SRM_MDM}/v1/${tenantId}/item-auth-req-lines/${itemAuthReqHeaderId}`,
      method: 'GET',
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_MDM}/v1/${tenantId}/item-auth-req-lines`,
        method: 'DELETE',
        data,
      };
    },
  },
  fields: [
    {
      name: 'reqLineNum',
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
      dynamicProps: {
        disabled: ({ record }) => record?.status !== 'add',
        lovPara: ({ dataSet }) => ({
          tenantId,
          enabledFlag: 1,
          businessObjectCode:
            dataSet?.getState('sourcePlatform') === 'SRM' ? 'SRM_C_SMDM_ITEM_AUTH_REQ' : null,
        }),
      },
      optionsProps: {
        paging: 'server',
        record: {
          dynamicProps: {
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
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
      // required: true,
      label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
      type: 'string',
      // dynamicProps: {
      //   required: ({ record }) => {
      //     return !record.get('formalItemCode')?.itemCode;
      //   },
      // },
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
      dynamicProps: {
        // required: ({ record }) => !record.get('itemName'),
        disabled: () => !isFirstNode,
      },
    },
    {
      name: 'formalItemId',
      bind: 'formalItemCode.itemId',
    },
    {
      name: 'formalItemName',
      // required: true,
      bind: 'formalItemCode.itemName',
      label: intl.get(`${commonPrompt}.formalItemName`).d('正式物料名称'),
      type: 'string',
      // dynamicProps: {
      //   required: ({ record }) => !!record.get('formalItemCode')?.itemCode,
      // },
    },
    {
      name: 'quantity',
      required: true,
      label: intl.get(`${commonPrompt}.neededQuantity`).d('需求数量'),
      type: 'number',
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
            // uomPrecision: data.uomPrecision,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value && value.uomId,
      dynamicProps: {
        disabled: () => !isFirstNode,
      },
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
      name: 'neededDate',
      required: true,
      min:
        !readOnly && source !== 'testResultEntry'
          ? detailListTimeLimit
            ? moment('1970-01-01')
            : moment(moment().format('YYYY-MM-DD'))
          : moment('1970-01-01'),
      label: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
      type: 'date',
    },
    {
      name: 'poNum',
      label: intl.get(`${commonPrompt}.poNum`).d('订单单号'),
      type: 'string',
      disabled: () => !isFirstNode,
    },
    {
      name: 'sourceNum',
      label: intl.get(`${commonPrompt}.sourceNum`).d('寻源单号'),
      type: 'string',
      disabled: () => !isFirstNode,
    },
    {
      name: 'sourcePrice',
      label: intl.get(`${commonPrompt}.sourcePrice`).d('寻源价格'),
      type: 'number',
      disabled: () => !isFirstNode,
    },
    {
      name: 'attachment',
      label: intl.get(`${commonPrompt}.attachment`).d('附件'),
    },
    {
      name: 'supplierAttRequiredFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`${commonPrompt}.supplierAttRequiredFlag`).d('供应商附件必传'),
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      name: 'attachmentUuid',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      label: intl.get(`${commonPrompt}.purchaseAttachment`).d('采购方附件'),
      dynamicProps: {
        required: ({ record }) =>
          Number(record.get('attachmentRequiredFlag')) === 1 && (!readOnly || pubPathFlag),
      },
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      name: 'supplierAttachmentUuid',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      label: intl.get(`${commonPrompt}.supplierAttachment`).d('供应商附件'),
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
      // defaultValue: 'QUALIFIED',
      lookupCode: 'SMDM.ITEM_AUTH_CONCLUSION',
      label: intl.get(`${commonPrompt}.certificationConclusion`).d('认证结论'),
      dynamicProps: {
        disabled: () => source !== 'testResultEntry',
      },
    },
  ],
  events: {
    update: ({ name, record, value }) => {
      if (name === 'certificationConclusion') {
        if (value) {
          const field = record.getField('certificationConclusion');
          record.set({
            certificationConclusionMeaning: field?.getText(value),
          });
        } else {
          record.set({
            certificationConclusionMeaning: null,
          });
        }
      }
      if (name === 'formalItemCode') {
        if (value) {
          const { primaryUomId, uomName, uomCode } = value;
          record.set({
            uomId: {
              uomCode,
              uomId: primaryUomId,
              uomName,
              uomCodeAndName: `${uomCode}/${uomName}`,
              // uomPrecision: uomPrecision ? Number(uomPrecision) : undefined,
            },
          });
        } else {
          record.set({
            uomId: null,
          });
        }
      }
    },
    beforeLoad: ({ dataSet, data }) => {
      if (isArray(data) && data?.length) {
        dataSet.setState('hasLineFlag', true);
      } else {
        dataSet.setState('hasLineFlag', false);
      }
    },
  },
});

// 阶段信息
const stageInfoDS = ({ itemAuthReqHeaderId, readOnly, pubPathFlag, source }) => ({
  pageSize: 20,
  autoQuery: false,
  autoCreate: false,
  cacheSelection: true,
  cacheModified: true,
  forceValidate: true,
  primaryKey: 'itemAuthReqHeaderAttId',
  selection: !readOnly ? 'multiple' : false,
  transport: {
    read: {
      url: `${SRM_MDM}/v1/${tenantId}/item-auth-req-header-atts/${itemAuthReqHeaderId}`,
      method: 'GET',
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_MDM}/v1/${tenantId}/item-auth-req-header-atts`,
        method: 'DELETE',
        data,
      };
    },
  },
  fields: [
    {
      name: 'attachmentCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.attachmentCode`).d('附件编码'),
      required: true,
    },
    {
      name: 'attachmentName',
      type: 'string',
      label: intl.get(`${commonPrompt}.attachmentName`).d('附件名称'),
      required: true,
    },
    {
      name: 'requiredFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`${commonPrompt}.purchaseRequiredUpload`).d('采购方附件必传'),
      dynamicProps: {
        disabled: ({ record }) => record.status !== 'add',
      },
    },
    {
      name: 'supplierAttRequiredFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`${commonPrompt}.supplierAttRequiredFlag`).d('供应商附件必传'),
      dynamicProps: {
        disabled: ({ record }) => record.status !== 'add',
      },
    },
    {
      name: 'requireUploadDate',
      min:
        !readOnly && source !== 'testResultEntry'
          ? moment(moment().format('YYYY-MM-DD'))
          : undefined,
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
      dynamicProps: {
        required: ({ record }) =>
          Number(record.get('requiredFlag')) === 1 && (!readOnly || pubPathFlag),
      },
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      name: 'supplierAttachmentUuid',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      label: intl.get(`${commonPrompt}.supplierAttachment`).d('供应商附件'),
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
  record: {
    dynamicProps: {
      selectable: (record) =>
        !record.get('nodeAttachmentId') || Number(record?.get('attachDeleteFlag')) !== 0,
    },
  },
});

// 送样信息
const sampleInfoDS = ({ itemAuthReqHeaderId, readOnly, pubPathFlag, source }) => ({
  pageSize: 20,
  autoQuery: false,
  autoCreate: false,
  cacheSelection: true,
  cacheModified: true,
  forceValidate: true,
  primaryKey: 'reqSampleId',
  selection: !readOnly ? 'multiple' : false,
  transport: {
    read: {
      url: `${SRM_MDM}/v1/${tenantId}/item-auth-req-samples/${itemAuthReqHeaderId}`,
      method: 'GET',
    },
    destroy: ({ data }) => {
      return {
        url:
          source === 'testResultEntry'
            ? `${SRM_MDM}/v1/${tenantId}/item-auth-req-samples?testResultsInputFlag=1`
            : `${SRM_MDM}/v1/${tenantId}/item-auth-req-samples`,
        method: 'DELETE',
        data,
      };
    },
  },
  fields: [
    {
      name: 'reqSampleNum',
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
      dynamicProps: {
        disabled: ({ record }) => String(record?.get('feedbackFlag')) === '1',
        lovPara: ({ dataSet }) => ({
          tenantId,
          enabledFlag: 1,
          businessObjectCode:
            dataSet?.getState('sourcePlatform') === 'SRM' ? 'SRM_C_SMDM_ITEM_AUTH_REQ' : null,
        }),
      },
      optionsProps: {
        paging: 'server',
        record: {
          dynamicProps: {
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
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
      dynamicProps: {
        disabled: ({ record }) => String(record?.get('feedbackFlag')) === '1',
      },
    },
    {
      name: 'itemName',
      // required: true,
      label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
      type: 'string',
      dynamicProps: {
        // required: ({ record }) => !record.get('formalItemCode')?.itemCode,
        disabled: ({ record }) => String(record?.get('feedbackFlag')) === '1',
      },
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
      dynamicProps: {
        // required: ({ record }) => !record.get('itemName'),
        disabled: ({ record }) => String(record?.get('feedbackFlag')) === '1',
      },
    },
    {
      name: 'formalItemId',
      bind: 'formalItemCode.itemId',
    },
    {
      name: 'formalItemName',
      // required: true,
      bind: 'formalItemCode.itemName',
      label: intl.get(`${commonPrompt}.formalItemName`).d('正式物料名称'),
      type: 'string',
      dynamicProps: {
        // required: ({ record }) => !!record.get('formalItemCode')?.itemCode,
        disabled: ({ record }) => String(record?.get('feedbackFlag')) === '1',
      },
    },
    {
      name: 'quantity',
      required: true,
      min: 0,
      label: intl.get(`${commonPrompt}.sampleNeededQuantity`).d('送样需求数量'),
      type: 'number',
      dynamicProps: {
        disabled: ({ record }) => String(record?.get('feedbackFlag')) === '1',
      },
    },
    {
      name: 'neededDate',
      required: true,
      min: !readOnly ? moment(moment().format('YYYY-MM-DD')) : undefined,
      label: intl.get(`${commonPrompt}.sampleNeededDate`).d('送样需求日期'),
      type: 'date',
      dynamicProps: {
        disabled: ({ record }) => String(record?.get('feedbackFlag')) === '1',
        min: ({ record }) =>
          String(record?.get('feedbackFlag')) === '1' || readOnly
            ? moment('1970-01-01')
            : moment(moment().format('YYYY-MM-DD')),
      },
    },
    {
      name: 'poNum',
      label: intl.get(`${commonPrompt}.poNum`).d('订单单号'),
      type: 'string',
      dynamicProps: {
        disabled: ({ record }) => String(record?.get('feedbackFlag')) === '1',
      },
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
      dynamicProps: {
        disabled: ({ record }) => String(record?.get('feedbackFlag')) === '1',
      },
    },
    {
      name: 'testingDepartmentName',
      label: intl.get(`${commonPrompt}.testingDepartment`).d('检测部门'),
      bind: 'testingDepartmentId.unitName',
    },
    {
      name: 'supplierAttRequiredFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`${commonPrompt}.supplierAttRequiredFlag`).d('供应商附件必传'),
      dynamicProps: {
        disabled: ({ record }) => String(record?.get('feedbackFlag')) === '1',
      },
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      attachmentCount: 1,
      name: 'attachmentUuid',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      label: intl.get(`${commonPrompt}.purchaseAttachment`).d('采购方附件'),
      dynamicProps: {
        required: ({ record }) =>
          Number(record.get('attachmentRequiredFlag')) === 1 && (!readOnly || pubPathFlag),
        // disabled: ({ record }) => String(record?.get('feedbackFlag')) === '1',
      },
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      attachmentCount: 1,
      name: 'supplierAttachmentUuid',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      label: intl.get(`${commonPrompt}.supplierAttachment`).d('供应商附件'),
      // dynamicProps: {
      //   disabled: ({ record }) => String(record?.get('feedbackFlag')) === '1',
      // },
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      attachmentCount: 1,
      name: 'nodeAttachmentUuid',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      label: intl.get(`${commonPrompt}.templateDownload`).d('模版下载'),
      // dynamicProps: {
      //   disabled: ({ record }) => String(record?.get('feedbackFlag')) === '1',
      // },
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
      dynamicProps: {
        required: ({ record }) => source === 'testResultEntry' && record?.get('feedbackFlag') === 1,
        disabled: () => source !== 'testResultEntry',
      },
    },
    {
      type: 'string',
      name: 'testingInstructions',
      label: intl.get(`${commonPrompt}.testingInstructions`).d('检测说明'),
      dynamicProps: {
        disabled: () => source !== 'testResultEntry',
      },
    },
    {
      type: 'attachment',
      viewMode: 'popup',
      bucketName: PRIVATE_BUCKET,
      name: 'testingReportUuid',
      bucketDirectory,
      label: intl.get(`${commonPrompt}.testingReportUuid`).d('检测报告'),
      dynamicProps: {
        disabled: () => source !== 'testResultEntry',
      },
    },
    {
      name: 'expectedDeliveryDate',
      label: intl.get(`${commonPrompt}.expectedDeliveryDate`).d('预计送达日期'),
      type: 'date',
      min: moment('1970-01-01'),
      disabled: true,
    },
    {
      name: 'sampleDeliveryMethod',
      label: intl.get(`${commonPrompt}.sampleDeliveryMethod`).d('送样方式'),
      type: 'string',
      disabled: true,
    },
    {
      name: 'logisticsTrackingNum',
      label: intl.get(`${commonPrompt}.logisticsTrackingNum`).d('物流单号'),
      type: 'string',
      disabled: true,
    },
  ],
  events: {
    update: ({ name, record, value }) => {
      if (name === 'testingResult') {
        if (value) {
          const field = record.getField('testingResult');
          record.set({
            testingResultMeaning: field?.getText(value),
          });
        } else {
          record.set({
            testingResultMeaning: null,
          });
        }
      }

      if (name === 'testingInstructions') {
        if (value) {
          const field = record.getField('testingInstructions');
          record.set({
            testingInstructionsMeaning: field?.getText(value),
          });
        } else {
          record.set({
            testingInstructionsMeaning: null,
          });
        }
      }
    },
  },
});

export { headerInfoDS, detailInfoDS, stageInfoDS, sampleInfoDS };

import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import { isArray } from 'lodash';

const organizationId = getCurrentOrganizationId();

// 协议头信息
const headerFormDS = ({ pcHeaderId, editable, isMaintain = false, url, _linkFlag = false }) => ({
  // editable true 可编辑
  // isMaintain true 新建
  dataToJSON: 'all-self',
  fields: [
    {
      name: 'pcName',
      type: 'string',
      label: intl.get(`spcm.common.model.common.pcName`).d('协议名称'),
      required: editable || isMaintain,
      validator: (value) => {
        if (value && value.length > 120) {
          return intl.get('hzero.common.validation.max', { max: 120 });
        }
        return true;
      },
    },
    {
      name: 'pcNum',
      type: 'string',
      label: intl.get(`spcm.common.model.common.pcNum`).d('协议编号'),
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      label: intl.get(`spcm.common.model.amount`).d('协议总额'),
    },
    {
      name: 'companyIdLov',
      type: 'object',
      label: intl.get(`entity.company.tag`).d('公司'),
      required: isMaintain,
      lovCode: 'SPCM.USER_AUTH.COMPANY',
      ignore: 'always',
      textField: 'companyName',
      dynamicProps: {
        lovPara: ({ record }) => ({
          enabledFlag: 1,
          supplierCompanyId: record.get('supplierCompanyId'),
        }),
        disabled: ({ record }) => record.get('supplierCompanyId') || record.get('supplierId'),
      },
    },
    {
      name: 'companyId',
      bind: 'companyIdLov.companyId',
    },
    {
      name: 'companyName',
      bind: 'companyIdLov.companyName',
    },
    {
      name: 'ouIdLov',
      type: 'object',
      label: intl.get('entity.business.tag').d('业务实体'),
      lovCode: 'SPFM.USER_AUTH.OU',
      ignore: 'always',
      textField: 'ouName',
      disabled: editable && pcHeaderId,
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          companyId: record.get('companyId'),
        }),
      },
    },
    {
      name: 'ouId',
      bind: 'ouIdLov.ouId',
    },
    {
      name: 'ouName',
      bind: 'ouIdLov.ouName',
    },
    {
      name: 'purchaseOrgIdLov',
      type: 'object',
      label: intl.get('entity.organization.class.purchase').d('采购组织'),
      lovCode: 'SPFM.USER_AUTH.PURORG',
      ignore: 'always',
      textField: 'organizationName',
      lovPara: {
        tenantId: organizationId,
      },
    },
    {
      name: 'purchaseOrgId',
      bind: 'purchaseOrgIdLov.purchaseOrgId',
    },
    {
      name: 'purchaseOrgName',
      bind: 'purchaseOrgIdLov.organizationName',
    },
    // 修改采购员 需要成部信息给伙伴信息 缺
    {
      name: 'purchaseAgentIdLov',
      type: 'object',
      label: intl.get('spcm.common.model.common.agentName').d('采购员'),
      lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
      ignore: 'always',
      textField: 'purchaseAgentName',
      lovPara: {
        tenantId: organizationId,
      },
    },
    {
      name: 'purchaseAgentId',
      bind: 'purchaseAgentIdLov.purchaseAgentId',
    },
    {
      name: 'purchaseAgentName',
      bind: 'purchaseAgentIdLov.purchaseAgentName',
    },
    {
      name: 'supplierCompanyIdLov',
      type: 'object',
      required: isMaintain || editable,
      label: intl.get(`entity.supplier.tag`).d('供应商'),
      lovCode: 'SPCM.AUTH_SUPPLIER_LIFE_CYCLE',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ record }) => ({
          enabledFlag: 1,
          companyId: record.get('companyId'),
          organizationId,
          userId: getCurrentUserId(),
          tenantId: organizationId,
        }),
        textField: ({ record }) =>
          record.get('supplierCompanyName') ? 'supplierCompanyName' : 'supplierName',
        disabled: ({ record }) =>
          record.get('supplierCompanyId') &&
          (record.get('supplementFlag') ||
            record.get('alterFlag') ||
            ['SEARCH_SOURCE_RESULT', 'PURCHASE_ORDER'].includes(record.get('pcSourceCode')) ||
            (record.get('pcSourceCode') === 'PURCHASE_NEED' &&
              record.get('recommendSupplierFlag') === 1)),
      },
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierCompanyIdLov.supplierCompanyId',
      transformRequest: (value) => value || null,
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierCompanyIdLov.supplierCompanyName',
      dynamicProps: {
        required: ({ record }) =>
          record.get('pcKindCode') === 'NOT_SYS_SUPPLIER' && (isMaintain || editable),
      },
      label: intl.get(`entity.supplier.tag`).d('供应商'),
      transformRequest: (value) => value || null,
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierCompanyIdLov.supplierTenantId',
      transformRequest: (value) => value || null,
    },
    {
      name: 'supplierCurrencyCode',
      bind: 'supplierCompanyIdLov.supplierCurrencyCode',
      transformRequest: (value) => value || null,
    },
    {
      name: 'supplierId',
      bind: 'supplierCompanyIdLov.supplierId',
      transformRequest: (value) => value || null,
    },
    {
      name: 'supplierName',
      bind: 'supplierCompanyIdLov.supplierName',
      transformRequest: (value) => value || null,
    },
    {
      name: 'supplierNum',
      bind: 'supplierCompanyIdLov.supplierNum',
      transformRequest: (value) => value || null,
    },
    {
      name: 'supplierCompanyNum',
      bind: 'supplierCompanyIdLov.supplierCompanyNum',
      transformRequest: (value) => value || null,
    },
    {
      name: 'pcKindCode',
      type: 'string',
      label: intl.get(`spcm.common.model.pcKindCode`).d('协议性质'),
      required: isMaintain,
      lookupCode: 'SPCM.CONTRACT.KIND',
    },
    {
      name: 'pcTypeIdLov',
      type: 'object',
      label: intl.get(`spcm.common.model.pcType`).d('协议类型'),
      lovCode: 'SPCM.PC_TYPE',
      ignore: 'always',
      textField: 'pcTypeName',
      dynamicProps: {
        lovPara: ({ record }) => ({
          enabledFlag: 1,
          tenantId: organizationId,
          companyId: record.get('companyId'),
        }),
        disabled: ({ record }) => !record.get('companyId'),
        required: ({ record }) => (editable || isMaintain) && !!record.get('companyId'),
      },
    },
    {
      name: 'pcTypeId',
      bind: 'pcTypeIdLov.pcTypeId',
    },
    {
      name: 'pcTypeCode',
      bind: 'pcTypeIdLov.pcTypeCode',
    },
    {
      name: 'pcTypeName',
      bind: 'pcTypeIdLov.pcTypeName',
    },
    {
      name: 'effectiveTimeFlag',
      bind: 'pcTypeIdLov.effectiveTimeFlag',
    },
    {
      name: 'pcTemplateIdLov',
      type: 'object',
      label: intl.get(`spcm.common.model.pcTemplateId`).d('协议模板'),
      lovCode: 'SPCM.PC_TEMPLATE',
      ignore: 'always',
      textField: 'templateName',
      dynamicProps: {
        lovPara: ({ record }) => ({
          enabledFlag: 1,
          pcTypeId: record.get('pcTypeId'),
          companyId: record.get('companyId'),
          templateStatus: 'END_APPROVAL',
          supplementFlag: record.get('supplementFlag') === 1 ? 1 : 0, // 后端接收参数要求为数字类型的布尔值
        }),
        disabled: ({ record }) =>
          !record.get('pcTypeId') || (editable && !isMaintain && !record.get('supplementFlag')),
        required: ({ record }) =>
          (editable || isMaintain) &&
          !!record.get('pcTypeId') &&
          !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(record.get('pcKindCode')),
      },
    },
    {
      name: 'pcTemplateId',
      bind: 'pcTemplateIdLov.pcTemplateId',
    },
    {
      name: 'templateName',
      bind: 'pcTemplateIdLov.templateName',
    },
    {
      name: 'pcAttachmentTemplateId',
      type: 'object',
      label: intl.get(`spcm.common.model.pcTemplateId.forAttachment`).d('附件合同模板'),
      lovCode: 'SPCM.PC_TEMPLATE',
      ignore: 'always',
      textField: 'templateName',
      dynamicProps: {
        lovPara: ({ record }) => ({
          enabledFlag: 1,
          pcTypeId: record.get('pcTypeId'),
          companyId: record.get('companyId'),
          templateStatus: 'END_APPROVAL',
          supplementFlag: record.get('supplementFlag') === 1 ? 1 : 0, // 后端接收参数要求为数字类型的布尔值
        }),
        disabled: ({ record }) => !record.get('pcTypeId') || !record.get('companyId'),
      },
      transformResponse: (value, record) => {
        return value
          ? {
              pcTemplateId: record.pcAttachmentTemplateId,
              templateName: record.pcAttachmentTemplateName,
            }
          : null;
      },
      transformRequest: (value) => value?.pcTemplateId,
    },
    {
      name: 'pcAttachmentTemplateName',
      bind: 'pcAttachmentTemplateId.templateName',
    },
    {
      name: 'templateUrlBeforeWildcardReplace',
      bind: 'pcAttachmentTemplateId.templateFileUrl',
    },
    {
      name: 'acceptType',
      type: 'string',
      label: intl.get(`spcm.common.model.checkType`).d('验收类型'),
      dynamicProps: {
        disabled: ({ record }) => record.get('supplementFlag') === 1,
        required: ({ record }) => (editable || isMaintain) && !!record.get('acceptFlag'),
        lookupCode: ({ record }) =>
          _linkFlag || record.get('_linkFlag') ? 'SPCM.ACCEPT_TYPE_NEW' : 'SPCM.ACCEPT_TYPE',
      },
    },
    {
      name: 'startDateActive',
      type: 'date',
      format: 'YYYY-MM-DD',
      label: intl.get(`spcm.common.model.startDateActive`).d('协议起始日期'),
      dynamicProps: {
        required: ({ record }) =>
          (editable || isMaintain) &&
          record.get('effectiveTimeFlag') &&
          !record.get('signEffectFlag'),
        disabled: ({ record }) => record.get('signEffectFlag') === 1,
        max: ({ record }) => record.get('endDateActive'),
      },
    },
    {
      name: 'endDateActive',
      type: 'date',
      format: 'YYYY-MM-DD',
      label: intl.get(`spcm.common.model.endDateActive`).d('协议终止日期'),
      dynamicProps: {
        required: ({ record }) =>
          (editable || isMaintain) &&
          record.get('effectiveTimeFlag') &&
          !record.get('signEffectFlag'),
        disabled: ({ record }) => record.get('signEffectFlag') === 1,
        min: ({ record }) => record.get('startDateActive'),
      },
    },
    {
      name: 'mainContractIdLov',
      type: 'object',
      label: intl.get(`spcm.common.model.mainContractId`).d('主协议'),
      lovCode: 'SPCM.CONTRACT',
      ignore: 'always',
      textField: 'pcNum',
      lovPara: {
        enabledFlag: 1,
        pcHeaderIdSet: pcHeaderId,
      },
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            enabledFlag: 1,
            pcHeaderIdSet: record.get('pcHeaderId'),
          };
        },
        // required: ({ record }) => (editable||isMaintain) && record.get('alterationFlag'),
      },
    },
    {
      name: 'mainContractId',
      bind: 'mainContractIdLov.pcHeaderId',
    },
    {
      name: 'mainPcNum',
      bind: 'mainContractIdLov.pcNum',
    },
    {
      name: 'pcSourceCode',
      type: 'string',
      label: intl.get('spcm.common.model.pcSourceCode').d('协议来源'),
      // transformResponse: (_, headerInfo) => headerInfo.pcSourceCodeMeaning,
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`hzero.common.remark`).d('备注'),
      validator: (value) => {
        if (value && value.length > 480) {
          return intl.get('hzero.common.validation.max', { max: 480 });
        }
        return true;
      },
    },
    {
      name: 'createByRealName',
      type: 'string',
      label: intl.get(`entity.roles.creator`).d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
    },
    {
      name: 'signEffectFlag',
      type: 'boolean',
      label: intl.get(`spcm.common.model.signedEffect`).d('签署即生效'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      name: 'effectiveTime',
      type: 'currency',
      label: intl.get(`spcm.common.model.effectiveTime`).d('有效时长'),
      dynamicProps: {
        required: ({ record }) => (editable || isMaintain) && record.get('signEffectFlag'),
        disabled: ({ record }) => record.get('signEffectFlag') !== 1,
      },
    },
    {
      name: 'contractPurpose',
      type: 'string',
      label: intl.get(`spcm.common.model.contractPurpose`).d('协议用途'),
      required: editable || isMaintain,
      lookupCode: 'SPCM.CONTRACT_PURPOSE',
      defaultValue: 'COMMON_PURCHASE',
    },
    {
      name: 'companyOrgIdLov',
      type: 'object',
      label: intl.get(`spcm.common.model.companyOrgName`).d('公司组织'),
      lovCode: 'SPFM.UNIT_G_C',
      ignore: 'always',
      textField: 'unitName',
      lovPara: {
        organizationId,
        levelPathFrom: 0,
        levelPathTo: 99999,
        unitTypeCode: 'G,C',
      },
    },
    {
      name: 'companyOrgId',
      bind: 'companyOrgIdLov.unitId',
    },
    {
      name: 'companyOrgName',
      bind: 'companyOrgIdLov.unitName',
    },
    {
      name: 'costAnchDepIdLov',
      type: 'object',
      label: intl.get(`spcm.common.model.costAnchDepDesc`).d('费用挂靠部门'),
      lovCode: 'SPFM.UNIT_G_C',
      ignore: 'always',
      textField: 'unitName',
      dynamicProps: {
        lovPara: ({ record }) => ({
          organizationId,
          levelPathFrom: 0,
          levelPathTo: 1,
          unitTypeCode: 'D',
          unitCompanyId: record.get('companyOrgId'),
        }),
        disabled: ({ record }) => !record.get('companyOrgId'),
      },
    },
    {
      name: 'costAnchDepId',
      bind: 'costAnchDepIdLov.unitId',
    },
    {
      name: 'costAnchDepDesc',
      bind: 'costAnchDepIdLov.unitName',
    },
    {
      name: 'overseasProcurement',
      type: 'boolean',
      label: intl.get(`spcm.common.model.overseasProcurement`).d('境外采购'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      dynamicProps: {
        disabled: ({ record }) => record.get('alterationFlag') === 1,
      },
    },
    {
      name: 'archiveCode',
      type: 'string',
      label: intl.get(`spcm.common.archiveCode`).d('归档码'),
      validator: (value) => {
        if (value && value.length > 120) {
          return intl.get('hzero.common.validation.max', { max: 120 });
        }
        return true;
      },
    },
    {
      name: 'terminationAttachmentUuid',
      type: 'string',
      label: intl.get(`spcm.common.model.terminationAttachment`).d('终止文件'),
    },
    {
      name: 'archiveAttachmentUuid',
      type: 'string',
      label: intl.get(`spcm.common.attachmentUuid`).d('归档文件'),
    },
    {
      name: 'globalFlag',
      type: 'boolean',
      label: intl.get(`spcm.common.model.common.globalFlag`).d('是否全局协议'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      name: 'termsName',
      type: 'string',
      label: intl.get('spcm.common.model.common.termId').d('付款条款'),
    },
    {
      name: 'signDescription',
      type: 'string',
      label: intl.get(`spcm.common.model.signDescription`).d('签订原因'),
    },
    {
      name: 'terminationReason',
      type: 'string',
      label: intl.get(`spcm.common.model.terminationReason`).d('终止原因'),
    },
    {
      name: 'signAddress',
      type: 'string',
      label: intl.get(`spcm.common.model.signAddress`).d('签署地点'),
    },
    {
      name: 'signatureTypeMeaning',
      type: 'string',
      label: intl.get(`spcm.common.signatureTypeMeaning`).d('签署方式'),
    },
    {
      name: 'paperDeliveryMethod',
      type: 'string',
      label: intl
        .get(`spcm.purchaseRequisitionCreation.model.paperDeliveryMethod`)
        .d('合同配送方式'),
      lookupCode: 'SPCM.PAPER_DELIVERY_METHOD',
    },
    {
      name: 'paperDeliveryInfo',
      type: 'string',
      label: intl.get(`spcm.common.model.paperDeliveryInfo`).d('合同配送信息'),
    },
    {
      name: 'legalContractNum',
      type: 'string',
      label: intl.get(`spcm.common.legalContractNum`).d('法务合同编号'),
    },
    {
      name: 'unitIdLov',
      type: 'object',
      label: intl.get('spcm.common.model.common.unitId').d('所属部门'),
      lovCode: 'SPRM.USER_UNIT',
      ignore: 'always',
      textField: 'unitName',
      dynamicProps: {
        disabled: ({ record }) => !record.get('companyId'),
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          companyId: record.get('companyId'),
        }),
      },
    },
    {
      name: 'unitId',
      bind: 'unitIdLov.unitId',
    },
    {
      name: 'unitName',
      bind: 'unitIdLov.unitName',
    },
    {
      name: 'creatorUnitId',
      type: 'object',
      label: intl.get('spcm.common.model.common.creatorUnitId').d('创建人所属部门'),
      lovCode: 'SPRM.USER_EMPLOYEE_ALL_UNIT',
      disabled: !pcHeaderId,
      transformResponse: (value, record) => {
        return value
          ? {
              unitId: record.creatorUnitId,
              unitName: record.creatorUnitName,
            }
          : null;
      },
      transformRequest: (value) => value?.unitId,
    },
    {
      name: 'creatorUnitName',
      bind: 'creatorUnitId.unitName',
    },
    {
      name: 'internalPostil',
      type: 'string',
      label: intl.get(`spcm.common.innerRemark`).d('内部批注'),
      validator: (value) => {
        if (value && value.length > 480) {
          return intl.get('hzero.common.validation.max', { max: 480 });
        }
        return true;
      },
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get(`spcm.common.view.message.comContractAttachment`).d('协议附件'),
    },
    {
      name: 'contractAttachmentUrl',
      type: 'attachment',
      transformRequest: (value) => {
        return isArray(value) ? value[0] : value;
      },
    },
    {
      name: 'purchaserAttachmentUuid',
      type: 'attachment',
      label: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
    },
    {
      name: 'pcHeaderElectronicSignatureAttachment',
      type: 'attachment',
      label: intl.get(`spcm.common.attachment.toBeSigned`).d('待签署附件'),
    },
    // 已签署附件
    {
      name: 'pcHeaderElectronicSignatureAttachmentIsSigned',
      type: 'string',
      label: intl.get(`spcm.common.attachment.Signed`).d('已签署附件'),
    },
    {
      name: 'taxIncludeAmountChinese',
      type: 'string',
      label: intl.get('spcm.common.model.taxIncludeAmount.chinese').d('大写协议总额'),
    },
    {
      name: 'amountChinese',
      type: 'string',
      label: intl.get('spcm.common.model.amount.chinese').d('大写不含税总额'),
    },
    {
      name: 'pcHeaderTaxAmountChinese',
      type: 'string',
      label: intl.get('spcm.common.model.pcHeaderTaxAmount.chinese').d('大写头税额'),
    },
    {
      name: 'totalQuantity',
      type: 'number',
      label: intl.get('spcm.common.model.total.basicQuantity').d('基本总数量'),
    },
    {
      name: 'totalSecondaryQuantity',
      type: 'number',
      label: intl.get('spcm.common.model.total.auxiliaryQuantity').d('辅助总数量'),
    },
    {
      name: 'contractCalculateMethod',
      type: 'string',
      label: intl.get('spcm.common.model.contractCalculateMethod').d('协议阶段计算方式'),
      lookupCode: 'SPCM_PC_CONTRACT_CALCULATE_METHOD',
    },
    {
      name: 'payPlanNum',
      type: 'string',
      label: intl.get(`sodr.workspace.model.common.newPaymentPlanNum`).d('付款计划编号'),
    },
    {
      name: 'cnfApplicability',
      type: 'string',
      label: intl.get('spcm.common.model.cnfApplicability').d('适用多组织协议标的可转订单策略'),
      lookupCode: 'SPCM.APPLICABILITY_CONTROL',
    },
    {
      name: 'controlApplicability',
      type: 'string',
      label: intl.get('spcm.common.model.controlApplicability').d('标的有其他适用范围是否可转订单'),
      lookupCode: 'SPCM.APPLICABILITY_NO_CONTROL',
      dynamicProps: {
        required: ({ record }) => record.get('cnfApplicability') === '2',
      },
      help: intl
        .get('spcm.common.view.message.controlApplicability')
        .d('包含其他适用组织的标的行转订单时，订单公司不支持更换，仅与协议头公司一致'),
    },
    {
      name: 'amountControlDimension',
      label: intl.get('spcm.common.model.field.amountControlDimension').d('协议金额控制维度'),
    },
    {
      name: 'manuallyModifyAmount',
      label: intl
        .get('spcm.common.model.field.manuallyModifyAmount')
        .d('是否允许手工维护协议金额上限'),
    },
    {
      name: 'limitAmountField',
      label: intl.get('spcm.common.field.limitAmountField').d('协议金额上限取值字段'),
    },
    {
      name: 'contractTemplateLang',
      lookupCode: 'HIAM.USER_LANGUAGE',
      label: intl.get('spcm.common.model.field.contractTemplateLang').d('协议模板语言环境'),
    },
    {
      name: 'amountControlType',
      label: intl.get('spcm.common.model.field.amountControlType').d('协议金额控制类型'),
    },
    {
      name: 'strategyNum',
      label: intl.get('spcm.common.model.field.strategyNum').d('协议金额控制策略编码'),
    },
    {
      name: 'maxContractAmount',
      type: 'number',
      min: 0,
      label: intl.get('spcm.common.field.maxContractAmount').d('协议总额上限'),
      dynamicProps: {
        required: ({ record }) =>
          editable &&
          record.get('amountControlDimension') === 'HEAD' &&
          record.get('manuallyModifyAmount') === '1',
      },
    },
    {
      name: 'maxContractAmountChinese',
      label: intl.get('spcm.common.model.field.maxContractAmountChinese').d('协议总额上限（大写）'),
    },
    {
      name: 'taxIncludeOccupiedAmount',
      type: 'number',
      label: intl
        .get('spcm.common.model.field.taxIncludeOccupiedAmount')
        .d('协议头订单已占用金额（含税）'),
    },
    {
      name: 'occupiedAmount',
      type: 'number',
      label: intl.get('spcm.common.field.occupiedAmount').d('协议头订单已占用金额（未税）'),
    },
    {
      name: 'amountField',
      lookupCode: 'SPCM.STRATEGY.AMOUNT_FIELD',
      help: intl
        .get('spcm.amountStrategy.model.fieldValueRules.amountFieldMsg')
        .d('取值自协议金额控制策略功能中的"金额取值字段"'),
      label: intl.get('spcm.amountStrategy.model.valueRules.amountField').d('金额取值字段'),
    },
    {
      name: 'occupyRecords',
      label: intl.get('spcm.common.model.common.occupyRecords').d('订单金额占用记录'),
    },
    {
      name: 'offlineMutualSignUuid',
      type: 'attachment',
      label: intl.get(`spcm.common.model.offlineMutualSignUuid`).d('线下双方签章文件'),
    },
    {
      name: 'originalDbTaxIncludeAmount',
      type: 'number',
      label: intl.get(`spcm.common.model.originalTaxTotalAmount`).d('原币协议总额'),
    },
    {
      name: 'originalDbAmount',
      type: 'number',
      label: intl.get(`spcm.common.model.originalNotTaxTotalAmount`).d('原币不含税总额'),
    },
    {
      name: 'originalDbTaxIncludeAmountChinese',
      label: intl.get(`spcm.common.model.originalTaxTotalAmountChinese`).d('原币协议总额（大写）'),
    },
    {
      name: 'originalDbAmountChinese',
      label: intl
        .get(`spcm.common.model.originalNotTaxTotalAmountChinese`)
        .d('原币不含税总额（大写）'),
    },
    {
      name: 'orderOccupiedAmountRatio',
      type: 'number',
      label: intl
        .get('spcm.common.model.field.orderOccupiedAmountRatio')
        .d('订单已占用金额比例（%）'),
      help: intl
        .get('spcm.common.model.field.orderOccupiedAmountRatioTip')
        .d('该字段计算逻辑为：（协议头订单已占用金额/协议总额上限）*100%'),
    },
    {
      name: 'electronicOrderType',
      label: intl.get('spcm.common.model.electricSignService').d('电签服务'),
      type: 'object',
      lovCode: 'SPCM.OPEN_ORDER_VIEW',
      textField: 'partnerCode',
      dynamicProps: {
        required: ({ record }) => {
          return Number(record.get('electricSignFlag')) === 1;
        },
      },
      transformRequest: (value) => value && value.partnerCode,
      transformResponse: (value, record) => {
        return value
          ? {
              partnerCode: record.electronicOrderType,
              partnerCodeMeaning: record.electronicOrderTypeMeaning,
            }
          : null;
      },
    },
    {
      name: 'electricSignOrder',
      label: intl.get('spcm.common.model.common.signNodeSignOrder').d('签署顺序'),
      lookupCode: 'SPCM.ELECTRIC_SIGN_ORDER',
      computedProps: {
        disabled: () => true,
      },
    },
    {
      name: 'silentSealPositionY',
      label: intl.get('spcm.common.model.common.silentSealPositionY').d('静默签骑缝章坐标'),
      type: 'number',
      min: 0,
      precision: 0,
      step: 1,
      computedProps: {
        disabled: ({ record, dataSet }) => {
          return !(
            Number(record.get('electricSignFlag')) === 1 &&
            ['ESIGN_SAAS', 'FDD_SAAS'].includes(dataSet.getState('sealType'))
          );
        },
      },
      help: intl
        .get('spcm.common.model.common.silentSealPositionMsg')
        .d('A4纸，Y坐标建议60–732，不填默认500'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams = {} } = data;
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/${url || `purchase-contract/${pcHeaderId}`}`,
        method: 'GET',
        data: queryParams,
      };
    },
  },
});

export default headerFormDS;

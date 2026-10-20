import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const listLineDS = () => ({
  // autoQuery: true,
  primaryKey: 'pcHeaderId',

  fields: [
    {
      name: 'version',
      type: 'number',
      label: intl.get(`spcm.common.model.common.version`).d('版本号'),
    },
    {
      name: 'pcStatusCode',
      type: 'string',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'pcNum',
      type: 'string',
      label: intl.get(`spcm.common.model.common.purchaseAgreementNum`).d('采购协议编号'),
    },
    {
      name: 'pcName',
      type: 'string',
      label: intl.get(`spcm.common.model.purchaseAgreementName`).d('采购协议名称'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`spcm.common.model.agreementObject`).d('协议对象'),
    },
    {
      name: 'pcKindCode',
      type: 'string',
      label: intl.get(`spcm.common.model.pcKindCode`).d('协议性质'),
    },
    {
      name: 'pcTypeId',
      type: 'string',
      label: intl.get(`spcm.common.model.common.pcType`).d('协议类型'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`entity.company.tag`).d('公司'),
    },
    {
      name: 'globalFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`spcm.common.model.common.globalFlag`).d('是否全局协议'),
    },
    {
      name: 'ouId',
      type: 'string',
      label: intl.get(`entity.business.tag`).d('业务实体'),
    },
    {
      name: 'purchaseOrgId',
      type: 'string',
      label: intl.get('entity.organization.class.purchase').d('采购组织'),
    },
    {
      name: 'purchaseAgentId',
      type: 'string',
      label: intl.get('spcm.common.model.common.agentName').d('采购员'),
    },
    {
      name: 'pcTemplateId',
      type: 'string',
      label: intl.get(`spcm.common.model.pcTemplateId`).d('协议模板'),
    },
    {
      name: 'createBy',
      type: 'string',
      label: intl.get(`entity.roles.creator`).d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
    },
    {
      name: 'confirmedDate',
      type: 'string',
      label: intl.get(`spcm.purchaseContractView.model.getDate`).d('生效日期'),
    },
    {
      name: 'pcSourceCode',
      type: 'string',
      label: intl.get(`spcm.common.model.agreementSource`).d('协议来源'),
    },
    {
      name: 'mainContractId',
      type: 'string',
      label: intl.get(`spcm.common.model.mainAgreementCode`).d('主协议编码'),
    },
    {
      name: 'archiveCode',
      type: 'string',
      label: intl.get(`spcm.common.archiveCode`).d('归档码'),
    },
    {
      name: 'operating',
      type: 'string',
      label: intl.get(`hzero.common.button.operating`).d('操作记录'),
    },
    {
      name: 'operator',
      type: 'string',
      label: intl.get('hzero.common.button.operator').d('操作'),
    },
  ],
  queryFields: [
    {
      name: 'pcNum',
      type: 'string',
      label: intl.get(`spcm.common.model.common.purchaseAgreementNum`).d('采购协议编号'),
    },
    {
      name: 'pcName',
      type: 'string',
      label: intl.get(`spcm.common.model.purchaseAgreementName`).d('采购协议名称'),
    },
    {
      name: 'pcStatusCode',
      type: 'string',
      label: intl.get('hzero.common.status').d('状态'),
      lookupCode: 'SPCM.CONTRACT.STATUS.CONTROL',
    },
    {
      name: 'companyLov',
      type: 'object',
      label: intl.get(`entity.company.tag`).d('公司'),
      lovCode: 'SPCM.USER_AUTH.COMPANY',
      ignore: 'always',
    },
    {
      name: 'companyId',
      bind: 'companyLov.companyId',
    },
    {
      name: 'supplierCompanyId',
      type: 'object',
      label: intl.get(`spcm.common.model.agreementObject`).d('协议对象'),
      lovCode: 'SPRM.SUPPLIER',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest: (value) => value && value.supplierCompanyId,
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierCompanyId.supplierCompanyName',
    },
    {
      name: 'supplierName',
      bind: 'supplierCompanyId.supplierName',
    },
    {
      name: 'supplierId',
      bind: 'supplierCompanyId.supplierId',
    },
    {
      name: 'pcKindCode',
      type: 'string',
      label: intl.get(`spcm.common.model.pcKindCode`).d('协议性质'),
      lookupCode: 'SPCM.CONTRACT.KIND',
    },
    {
      name: 'pcTypeLov',
      type: 'object',
      label: intl.get(`spcm.common.model.common.pcType`).d('协议类型'),
      lovCode: 'SPCM.PC_TYPE_ALL',
      ignore: 'always',
    },
    {
      name: 'pcTypeId',
      bind: 'pcTypeLov.pcTypeId',
    },
    {
      name: 'pcTemplateLov',
      type: 'object',
      label: intl.get(`spcm.common.model.pcTemplateId`).d('协议模板'),
      lovCode: 'SPCM.PC_TEMPLATE',
      ignore: 'always',
    },
    {
      name: 'pcTemplateId',
      bind: 'pcTemplateLov.pcTemplateId',
    },
    {
      name: 'creationDateFrom',
      type: 'dateTime',
      label: intl.get('hzero.common.date.creation.from').d('创建日期从'),
    },
    {
      name: 'creationDateTo',
      type: 'dateTime',
      label: intl.get('hzero.common.date.creation.to').d('创建日期至'),
    },
    {
      name: 'confirmedDateFrom',
      type: 'dateTime',
      label: intl.get('spcm.common.model.confirmedDateFrom').d('生效日期从'),
    },
    {
      name: 'confirmedDateTo',
      type: 'dateTime',
      label: intl.get('spcm.common.model.confirmedDateTo').d('生效日期至'),
    },
    {
      name: 'archiveCode',
      type: 'string',
      label: intl.get(`spcm.common.archiveCode`).d('归档码'),
    },
    {
      name: 'version',
      type: 'number',
      label: intl.get(`spcm.common.model.common.version`).d('版本号'),
    },
    {
      name: 'mainPcNum',
      type: 'string',
      label: intl.get(`spcm.common.model.mainAgreementCode`).d('主协议编码'),
    },
  ],

  transport: {
    read: ({ params }) => ({
      url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract-control/change/page`,
      method: 'GET',
      params: {
        ...params,
        customizeUnitCode: 'SPCM.CONTRACT.CONTROL.LIST,SPCM.CONTRACT.CONTROL.LIST.FILTER',
      },
    }),
  },
});

// 终止原因
const terminateDS = () => ({
  fields: [
    {
      name: 'terminationReason',
      type: 'string',
      label: intl.get(`spcm.common.model.terminationReason`).d('终止原因'),
      required: true,
      validator: (value) => {
        if (value && value.length > 480) {
          return intl.get('hzero.common.validation.max', { max: 480 });
        }
        return true;
      },
    },
    {
      name: 'terminationAttachmentUuid',
      type: 'string',
      label: intl.get(`spcm.common.model.terminationAttachment`).d('终止文件'),
    },
  ],
});

export { listLineDS, terminateDS };

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const modelPrompt = 'spcm.purchaseContractView.model';
const commonPrompt = 'spcm.common.model.common';

// 阶段-全部
const StageAllDS = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  primaryKey: 'pcStageId',
  pageSize: 20,
  fields: [
    {
      label: intl.get(`${modelPrompt}.pcStatusCode`).d('状态'),
      name: 'pcStatusCode',
      width: 85,
    },
    {
      label: intl.get(`${commonPrompt}.purchaseAgreementNum`).d('采购协议编号'),
      name: 'pcNum',
    },

    {
      label: intl.get(`${commonPrompt}.purchaseAgreementName`).d('采购协议名称'),
      name: 'pcName',
    },
    {
      label: intl.get(`spcm.workspace.supplierCompanyName`).d('供应商'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`spcm.workspace.model.companyName`).d('公司'),
      name: 'companyName',
    },
    {
      label: intl.get(`${commonPrompt}.pcKindCode`).d('协议性质'),
      name: 'pcKindCode',
    },
    {
      label: intl.get(`${commonPrompt}.pcType`).d('协议类型'),
      name: 'pcTypeId',
    },
    {
      label: intl.get(`${commonPrompt}.pcTemplateId`).d('协议模板'),
      name: 'pcTemplateId',
    },
    {
      label: intl.get('spcm.common.model.startDateActive').d('协议起始日期'),
      name: 'startDateActive',
    },
    {
      label: intl.get('spcm.common.model.endDateActive').d('协议终止日期'),
      name: 'endDateActive',
    },
    {
      name: 'stageCode',
      type: 'string',
      label: intl.get(`spcm.common.model.common.stageCode`).d('阶段编码'),
    },
    {
      name: 'stageName',
      type: 'string',
      label: intl.get(`spcm.common.model.common.stageName`).d('阶段名称'),
    },
    {
      name: 'prepaymentStage',
      type: 'boolean',
      label: intl.get(`spcm.common.model.common.prepaymentStage`).d('预付款阶段'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'milestoneTime',
      type: 'date',
      label: intl.get(`spcm.common.model.common.milestoneTime`).d('里程碑时间'),
    },
    {
      name: 'payRatio',
      type: 'number',
      label: `${intl.get(`spcm.common.model.common.payRatio`).d('付款比例')}(%)`,
    },
    {
      label: intl.get(`spcm.common.currencyCode`).d('原币币种'),
      name: 'supplierCurrencyCode',
    },
    {
      label: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
      name: 'purchaseCurrencyCode',
    },
    {
      name: 'costQuantity',
      type: 'number',
      label: intl.get(`spcm.common.model.common.supplierCostQuantity`).d('原币费用'),
    },
    {
      name: 'purchaseCostQuantity',
      type: 'number',
      label: intl.get('spcm.common.model.purchaseCostQuantity').d('本币费用'),
    },
    {
      name: 'typeIdLov',
      type: 'object',
      label: intl.get('spcm.common.model.common.typeId').d('付款方式'),
      required: true,
      lovCode: 'SPCM.PAYMENT_TYPE',
      ignore: 'always',
      textField: 'typeName',
    },
    {
      name: 'typeId',
      bind: 'typeIdLov.typeId',
    },
    {
      name: 'typeCode',
      bind: 'typeIdLov.typeCode',
    },
    {
      name: 'typeName',
      bind: 'typeIdLov.typeName',
    },
    {
      name: 'termIdLov',
      type: 'object',
      label: intl.get(`spcm.common.model.common.termId`).d('付款条款'),
      lovCode: 'SMDM.PAYMENT.TERM',
      ignore: 'always',
      textField: 'termName',
    },
    {
      name: 'termId',
      bind: 'termIdLov.termId',
    },
    {
      name: 'termName',
      bind: 'termIdLov.termName',
    },
    {
      label: intl.get(`spcm.common.model.common.purchaseOrg`).d('采购组织'),
      name: 'purchaseOrgId',
    },
    {
      label: intl.get(`spcm.common.model.ouName`).d('业务实体'),
      name: 'ouId',
    },
    {
      label: intl.get('spcm.common.model.common.agentName').d('采购员'),
      name: 'purchaseAgentId',
    },
    {
      label: intl.get(`entity.roles.creator`).d('创建人'),
      name: 'createdBy',
    },
    {
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
      name: 'creationDate',
    },
    {
      label: intl.get(`spcm.common.model.agreementSource`).d('协议来源'),
      name: 'pcSourceCode',
    },
  ],
  queryParameter: {
    workbenchFlag: '1',
    customizeUnitCode: 'SPCM.WORKSPACE_STAGE_ALL.LIST,SPCM.WORKSPACE_STAGE_ALL.SEARCH',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/workbench/stage/page`,
        method: 'GET',
      };
    },
  },
});

export { StageAllDS };

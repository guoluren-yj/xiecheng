/**
 * agreementDS - 协议DS
 * @date: 2020-12-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_SPCM, SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 协议列表DS
const agreementDS = () => ({
  pageSize: 20,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'version',
      label: intl.get(`spcm.common.model.common.version`).d('版本号'),
    },
    {
      name: 'pcStatusCodeMeaning',
      label: intl.get(`spcm.purchaseContractView.model.pcStatusCode`).d('状态'),
    },
    {
      name: 'pcNum',
      label: intl.get(`spcm.common.model.common.purchaseAgreementNum`).d('采购协议编号'),
    },
    {
      name: 'pcName',
      label: intl.get(`spcm.common.model.common.purchaseAgreementName`).d('采购协议名称'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`spcm.common.model.agreementObject`).d('协议对象'),
    },
    {
      name: 'pcKindCodeMeaning',
      label: intl.get(`spcm.common.model.common.pcKindCode`).d('协议性质'),
    },
    {
      name: 'pcTypeName',
      label: intl.get(`spcm.common.model.common.pcType`).d('协议类型'),
    },
    {
      name: 'companyName',
      label: intl.get(`spcm.common.model.common.companyName`).d('公司'),
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get(`spcm.common.model.common.supplierCompanyNum`).d('供应商编码'),
    },
    {
      name: 'globalFlag',
      label: intl.get(`spcm.common.model.common.globalFlag`).d('是否全局协议'),
    },
    {
      name: 'contractStage',
      label: intl.get('spcm.common.view.message.title.contractStage').d('协议阶段'),
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      label: intl.get(`spcm.common.model.common.amount`).d('协议总额'),
    },
    {
      name: 'executedAmount',
      type: 'number',
      label: intl.get(`spcm.common.model.common.executedAmount`).d('已执行金额'),
    },
    {
      name: 'toExecuteAmount',
      type: 'number',
      label: intl.get(`spcm.common.model.common.toExecuteAmount`).d('待执行金额'),
    },
    {
      name: 'acceptStatusMeaning',
      label: intl.get('spcm.common.model.common.contractAcceptStatus').d('协议验收状态'),
    },
    {
      name: 'acceptListNum',
      label: intl.get('spcm.common.model.common.contractAcceptListNum').d('协议验收单据'),
    },
    {
      name: 'ouName',
      label: intl.get(`spcm.common.model.common.ouName`).d('业务实体'),
    },
    {
      name: 'purchaseOrgName',
      label: intl.get('spcm.common.model.common.purchaseOrgName').d('采购组织'),
    },
    {
      name: 'purchaseAgentName',
      label: intl.get('spcm.common.model.common.agentName').d('采购员'),
    },
    {
      name: 'templateName',
      label: intl.get(`spcm.common.model.common.pcTemplateId`).d('协议模板'),
    },
    {
      name: 'createByRealName',
      label: intl.get(`spcm.common.model.common.createByRealName`).d('创建人'),
    },
    {
      name: 'signDate',
      type: 'date',
      label: intl.get(`spcm.purchaseContractView.model.signDate`).d('签订日期'),
    },
    {
      name: 'startDateActive',
      type: 'date',
      label: intl.get(`spcm.purchaseContractView.model.startDateActive`).d('生效日期'),
    },
    {
      name: 'endDateActive',
      type: 'date',
      label: intl.get(`spcm.purchaseContractView.model.endDateActive`).d('失效日期'),
    },
    {
      name: 'remainDate',
      label: intl.get(`spcm.common.model.remainDate`).d('剩余有效期'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get(`hzero.common.date.creation`).d('创建日期'),
    },
    {
      name: 'pcSourceCodeMeaning',
      label: intl.get(`spcm.common.model.agreementSource`).d('协议来源'),
    },
    {
      name: 'mainPcNum',
      label: intl.get(`spcm.common.model.mainAgreementCode`).d('主协议编码'),
    },
    {
      name: 'archiveCode',
      label: intl.get(`spcm.common.archiveCode`).d('归档码'),
    },
    {
      name: 'releaseDate',
      type: 'dateTime',
      label: intl.get(`spcm.common.releaseDate`).d('发布时间'),
    },
    {
      name: 'archiveAttachmentUuid',
      label: intl.get(`spcm.common.attachmentUuid`).d('归档文件'),
    },
    {
      name: 'operator',
      label: intl.get('hzero.common.button.operator').d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/life-cycles/agreement`,
        method: 'GET',
        data: filterNullValueObject({ ...params, ...other }),
      };
    },
  },
});

// 协议阶段DS
const agreementStageDS = () => ({
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      label: intl.get(`spcm.common.model.common.stageCode`).d('阶段编码'),
      name: 'stageCode',
    },
    {
      label: intl.get(`spcm.common.model.common.stageName`).d('阶段名称'),
      name: 'stageName',
    },
    {
      label: intl.get(`spcm.common.model.common.milestoneTime`).d('里程碑时间'),
      name: 'milestoneTime',
      type: 'dateTime',
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
      label: intl.get(`spcm.common.exchangeRate`).d('汇率（本币/原币）'),
      name: 'exchangeRate',
    },
    {
      label: intl.get(`spcm.common.model.supplierCostQuantity`).d('原币费用'),
      name: 'costQuantity',
    },
    {
      label: intl.get('spcm.common.model.purchaseCostQuantity').d('本币费用'),
      name: 'purchaseCostQuantity',
    },
    {
      label: intl.get('spcm.common.model.common.termId').d('付款条款'),
      name: 'termName',
    },
    {
      label: intl.get('spcm.common.model.common.typeId').d('付款方式'),
      name: 'typeName',
    },
    {
      label: intl.get('hzero.common.explain').d('说明'),
      name: 'remark',
    },
    {
      label: intl.get('spcm.common.model.common.acceptStatus').d('验收状态'),
      name: 'acceptStatusMeaning',
    },
    {
      label: intl.get('spcm.common.model.common.acceptListNum').d('验收单据'),
      name: 'acceptListNum',
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { pcHeaderId } = {} } = dataSet;
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/stage/page`,
        method: 'GET',
      };
    },
  },
});

// 验收单据DS
const acceptDocumentDS = () => ({
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      label: intl.get(`spcm.common.model.common.orderSeq`).d('序号'),
      name: 'lineNum',
    },
    {
      label: intl.get(`spcm.common.model.common.pcStatusCode`).d('状态'),
      name: 'statusCodeMeaning',
    },
    {
      label: intl.get(`spcm.common.model.common.acceptListNumber`).d('验收单据编号'),
      name: 'acceptListNum',
    },
    {
      label: intl.get(`spcm.common.model.common.acceptListTitle`).d('验收单据标题'),
      name: 'title',
    },
    {
      label: intl.get(`spcm.common.model.common.acceptedQuantity`).d('本次验收数量'),
      name: 'acceptedQuantity',
    },
    {
      label: intl.get(`spcm.common.model.common.accepterUserName`).d('验收人'),
      name: 'acceptorName',
    },
    {
      label: intl.get(`spcm.common.model.common.acceptDate`).d('验收日期'),
      name: 'acceptDate',
      type: 'date',
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { pcHeaderId, acceptType } = {} } = dataSet;
      // none, 无需验收
      // target, 按标的验收
      // stage, 按阶段验收
      const interfaceName =
        acceptType === 'target'
          ? `contract-report/receiving/subject-accept/detail`
          : `contract-report/receiving/stage-accept/detail`;
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/${interfaceName}`,
        method: 'GET',
        data: { pcHeaderId, detailFlag: 0 },
      };
    },
  },
});

// 操作记录DS
const optionRecordDS = () => ({
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      label: intl.get(`spfm.certificationApproval.model.operateRecord.processUser`).d('操作人'),
      name: 'processUserName',
    },
    {
      label: intl.get(`spfm.certificationApproval.model.operateRecord.processDate`).d('操作时间'),
      name: 'processedDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.certificationApproval.model.actionDetail.processStatus`).d('动作'),
      name: 'processTypeMeaning',
    },
    {
      label: intl.get(`spfm.certificationApproval.model.common.handleRemark`).d('操作说明'),
      name: 'processRemark',
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { pcHeaderId } = {} } = dataSet;
      return {
        url: `/spcm/v1/${organizationId}/purchase-contract-action/${pcHeaderId}/page`,
        method: 'GET',
      };
    },
  },
});
export { agreementDS, agreementStageDS, acceptDocumentDS, optionRecordDS };

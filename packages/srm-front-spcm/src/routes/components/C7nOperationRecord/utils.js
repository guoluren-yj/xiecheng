/**
 * 操作记录描述
 */
import intl from 'utils/intl';

import { processTypeCodeDescMap } from './constants';

const getComputedColor = (action) => {
  switch (action) {
    case 'WORKFLOW_APPROVED':
    case 'FUNCTIONAL_APPROVED':
    case 'EXTERNAL_APPROVAL_APPROVED':
    case 'WORKFLOW_APPROVAL_APPROVED':
    case 'EXPORT_INTERFACE_APPROVED':
    case 'FUNCTIONAL_EFFECTED_APPROVED':
      return '#47B881';
    case 'WORKFLOW_REJECTED':
    case 'FUNCTIONAL_REJECTED':
    case 'FUNCTIONAL_EFFECTED_REJECTED':
    case 'EXTERNAL_APPROVAL_REJECTED':
    case 'WORKFLOW_APPROVAL_REJECTED':
    case 'EXPORT_INTERFACE_REJECTED':
      return '#F56349';
    default:
      return '#E5E5E5';
  }
};

const renderOperationDesc = (item) => {
  let desc = '';
  switch (processTypeCodeDescMap[item.processTypeCode]) {
    case 'operation':
      desc = `${intl.get('spcm.common.view.message.changeDescription').d('变更说明')}`;
      break;
    case 'approval':
      desc = `${intl.get('spcm.common.view.message.approvalResult').d('审批结果为')}: `;
      break;
    default:
      break;
  }
  return desc;
};

const getComputedRegExpValue = (value, item) => {
  const mappings = value?.match(/{([^{}]*)}/g);
  if (!mappings) return value;
  let newValue = value;
  mappings.forEach((mappingItem) => {
    const key = mappingItem.match(/{([^{}]*)}/)[1];
    if (item[key]) {
      newValue = newValue.replace(mappingItem, item[key]);
    }
  });
  return newValue === value ? null : newValue;
};

const getProcessOperationAction = (operation, operationMeaning, processRemark) => {
  const realNameTitle = `{processUserName} ({loginName}) `;
  const rfxTitle = `【${intl.get(`spcm.common.view.message.contract`).d('协议')}】`;

  const processTypeCodeActionMap = {
    PENDING: [
      realNameTitle,
      intl.get('spcm.common.view.message.createAction').d('新建了'),
      rfxTitle,
    ], // 新建
    SUBMITTED: [
      realNameTitle,
      intl.get('spcm.common.view.message.submitAction').d('提交了'),
      rfxTitle,
    ], // 确认
    CONFIRMED: [
      realNameTitle,
      intl.get('spcm.common.view.message.comfirmed').d('确认了'),
      rfxTitle,
    ],
    DELETED: [realNameTitle, intl.get('spcm.common.view.message.deleted').d('删除了'), rfxTitle],
    // 发布
    PUBLISHED: [
      realNameTitle,
      intl.get('spcm.common.view.message.releaseAction').d('发布了'),
      rfxTitle,
    ],
    APPROVED: [
      realNameTitle,
      intl.get('spcm.common.view.message.sealApproval').d('批准采方进行用章'),
    ], // 工作流审批通过
    REJECTED: [
      realNameTitle,
      intl.get('spcm.common.view.message.workflowRefused').d('拒绝了'),
      rfxTitle,
    ], // 工作流审拒绝
    // 作废协议
    CANCELLATION: [
      realNameTitle,
      intl.get('spcm.common.view.message.abolished').d('作废了'),
      rfxTitle,
    ],
    // 补充协议中
    REPLENISHING: [
      realNameTitle,
      intl.get('spcm.common.view.message.implemented').d('执行了'),
      `【${intl.get('spcm.common.title.contractReplenish').d('补充协议')}】`,
    ],
    // 拒绝协议
    SUPPLIER_REJECTED: [
      realNameTitle,
      intl.get('spcm.common.view.message.rejectedOnConfirm').d('确认时驳回了'),
      rfxTitle,
      intl.get('spcm.common.view.message.supplier.rejectedReason').d('拒绝理由'),
      `【${processRemark}】`,
    ],
    // 协议签署
    SIGN_CONTRACT: [
      realNameTitle,
      intl.get('spcm.common.view.message.implemented').d('执行了'),
      `【${intl.get('spcm.common.view.message.signContract').d('供方用章')}】`,
    ],
    // 归档审批中
    ARCHIVE_TO_APPROVAL: [
      realNameTitle,
      intl.get('spcm.common.view.message.submitAction').d('提交了'),
      `【${intl.get('spcm.common.view.message.filedApproval').d('协议归档')}】`,
    ],
    // 协议用章
    CONTRACT_SEAL: [
      realNameTitle,
      intl.get('spcm.common.view.message.implemented').d('执行了'),
      `【${intl.get('spcm.common.view.message.execSeal').d('采方用章')}】`,
    ],
    // 确认终止
    TERMINATION: [
      realNameTitle,
      intl.get('spcm.common.view.message.confirmTerminate').d('确认终止了'),
      rfxTitle,
    ],
    // 变更协议
    PROTOCOL_CHANGE: [
      realNameTitle,
      intl.get('spcm.common.view.message.protocolChange').d('变更了'),
      rfxTitle,
    ],
    // 补充完成
    SUPPLEMENT_COMPLETE: [
      realNameTitle,
      intl.get('spcm.common.view.message.supplemenComplete').d('补充完成了'),
      rfxTitle,
    ],
    // 确认协议中
    APPROVAL_PENDING: [
      realNameTitle,
      intl.get('spcm.common.view.message.submitAction').d('提交了'),
      `【${intl.get('spcm.common.view.message.approvalPending').d('确认后审批')}】`,
    ],
    // 已生效
    EFFECTED: [realNameTitle, intl.get('spcm.common.view.message.effected').d('已生效')],
    // 拒绝终止
    TERMINATION_REJECT: [
      realNameTitle,
      intl.get('spcm.common.view.message.workflowRefused').d('拒绝了'),
      `【${intl.get('spcm.common.view.message.terminationReject').d('协议终止')}】`,
    ],
    // 终止协议
    TERMINATION_CONFIRM: [
      realNameTitle,
      intl.get('spcm.common.view.message.initiated').d('发起了'),
      `【${intl.get('spcm.common.view.message.terminationReject').d('协议终止')}】`,
    ],
    // 已归档
    ARCHIVE: [realNameTitle, intl.get('spcm.common.view.message.archive').d('归档了'), rfxTitle],
    // 作废待审批
    INVALID_TO_APPROVAL: [
      realNameTitle,
      intl.get('spcm.common.view.message.submitAction').d('提交了'),
      `【${intl.get('spcm.common.view.message.invalidToApproval').d('协议作废')}】`,
    ],
    // 变更审批中
    CHANGE_TO_APPROVAL: [
      realNameTitle,
      intl.get('spcm.common.view.message.submitAction').d('提交了'),
      `【${intl.get('spcm.common.view.message.changeToApproval').d('协议变更')}】`,
    ],
    // 终止审批中
    TERMINATION_TO_APPROVAL: [
      realNameTitle,
      intl.get('spcm.common.view.message.submitAction').d('提交了'),
      `【${intl.get('spcm.common.view.message.terminationReject').d('协议终止')}】`,
    ],
    // 撤回
    REVOCATION: [
      realNameTitle,
      intl.get('spcm.common.view.message.revokeAction').d('撤回了'),
      rfxTitle,
    ],
    // 盖章退回
    STAMPED_BACK: [
      realNameTitle,
      intl.get('spcm.common.view.message.returned').d('退回了'),
      `【${intl.get('spcm.common.view.message.sealAgreement').d('协议盖章')}】`,
    ],
    // 供应方确认
    PURCHASER_SIGN_CONTRACT: [
      realNameTitle,
      intl.get('spcm.common.view.message.implemented').d('执行了'),
      // `【${intl.get('spcm.common.view.message.purchaseSignContract').d('采方协议确认')}】`,
      `【${intl.get('spcm.common.view.message.supplierSignContract').d('供方协议确认')}】`,
    ],
    // 供应方确认
    SUPPLIER_SIGN_CONTRACT: [
      realNameTitle,
      intl.get('spcm.common.view.message.implemented').d('执行了'),
      `【${intl.get('spcm.common.view.message.supplierSignContract').d('供方协议确认')}】`,
    ],
    // 盖章完成
    STAMPED_COMPLETED: [
      realNameTitle,
      intl.get('spcm.common.view.message.stampedCompleted').d('完成了'),
      `【${intl.get('spcm.common.view.message.sealAgreement').d('协议盖章')}】`,
    ],
    // 转交
    TRANSFER: [
      realNameTitle,
      intl.get('spcm.common.view.message.deliverFromAction').d('将单据由'),
      intl.get('spcm.common.view.message.deliverToAction').d('转给了'),
    ],
    // 功能审批通过
    FUNCTIONAL_APPROVED: [
      realNameTitle,
      intl.get('spcm.common.view.message.lastApprove').d('最终审批了'),
      rfxTitle,
    ],
    // 功能审批拒绝
    FUNCTIONAL_REJECTED: [
      realNameTitle,
      intl.get('spcm.common.view.message.lastApprove').d('最终审批了'),
      rfxTitle,
    ],
    // 解约签章
    START_TERMINATION: [
      realNameTitle,
      intl.get('spcm.common.view.message.initiated').d('发起了'),
      `【${intl.get('spcm.common.view.message.startTermination').d('解约签章')}】`,
    ],
    // 采方解约用章
    PURCHASE_TERMINATE_SIGN: [
      realNameTitle,
      intl.get('spcm.common.view.message.implemented').d('执行了'),
      `【${intl.get('spcm.common.view.message.purchaseTerminateSign').d('采方解约用章')}】`,
    ],
    // 供方解约用章
    SUPPLIER_TERMINATE_SIGN: [
      realNameTitle,
      intl.get('spcm.common.view.message.implemented').d('执行了'),
      `【${intl.get('spcm.common.view.message.supplierTerminateSign').d('供方解约用章')}】`,
    ],
    // 解约完成
    TERMINATE_COMPLETED: [
      realNameTitle,
      intl.get('spcm.common.view.message.stampedCompleted').d('完成了'),
      `【${intl.get('spcm.common.view.message.terminateCompleted').d('协议解约')}】`,
    ],
    // 待生效
    TO_BE_VALID: [
      realNameTitle,
      intl.get('spcm.common.view.message.comfirmed').d('确认了'),
      rfxTitle,
      null,
      intl.get('spcm.common.view.message.toBeValid').d('，协议待生效'),
    ],
    // 拒绝生效
    TO_BE_VALID_WITHDREW: [
      realNameTitle,
      intl.get('spcm.common.view.message.withdrewEffectiveness').d('确认生效时撤回了'),
      rfxTitle,
    ],
    // 提交了 协议生效审批
    EFFECTED_TO_APPROVAL: [
      realNameTitle,
      intl.get('spcm.common.view.message.submitAction').d('提交了'),
      `【${intl.get('spcm.common.view.message.effectiveApproval').d('协议生效审批')}】`,
    ],
    // 撤回了【协议生效审批】
    EFFECTED_TO_APPROVAL_REWOKE: [
      realNameTitle,
      intl.get('spcm.common.view.message.revokeAction').d('撤回了'),
      `【${intl.get('spcm.common.view.message.effectiveApproval').d('协议生效审批')}】`,
    ],
    FUNCTIONAL_EFFECTED_APPROVED: [
      realNameTitle,
      intl.get('spcm.common.view.message.carryOn').d('进行'),
      `【${intl.get('spcm.common.view.message.effectiveApproval').d('协议生效审批')}】`,
    ],
    FUNCTIONAL_EFFECTED_REJECTED: [
      realNameTitle,
      intl.get('spcm.common.view.message.carryOn').d('进行'),
      `【${intl.get('spcm.common.view.message.effectiveApproval').d('协议生效审批')}】`,
    ],
    // 智能提取
    SMART_FETCH: [
      realNameTitle,
      intl.get('spcm.common.view.message.used').d('使用了'),
      `【${operationMeaning}】`,
    ],
    // 替换文件
    REPLACE: [
      realNameTitle,
      intl.get('spcm.common.view.message.used').d('使用了'),
      `【${intl.get('spcm.common.button.replaceFile').d('替换文件')}】`,
    ],
    // 重新提取
    RE_FETCH: [
      realNameTitle,
      intl.get('spcm.common.view.message.used').d('使用了'),
      `【${operationMeaning}】`,
    ],
    // 智能审查
    SMART_CHECK: [
      realNameTitle,
      intl.get('spcm.common.view.message.used').d('使用了'),
      `【${operationMeaning}】`,
    ],
    // 协议用章添加签署人
    CHAPTER_APPEND_SIGNER: [
      realNameTitle,
      intl.get('spcm.common.view.message.implemented').d('执行了'),
      null,
      null,
      `【${processRemark}】`,
    ],
    DEFAULT: [realNameTitle, operationMeaning],
  };
  return processTypeCodeActionMap[operation] || processTypeCodeActionMap.DEFAULT;
};

export { getComputedColor, renderOperationDesc, getComputedRegExpValue, getProcessOperationAction };

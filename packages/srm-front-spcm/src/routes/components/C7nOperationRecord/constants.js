/*
 * @Description: 流程对应的图标
 * @Date: 2022-04-21 12:21:15
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
const defaultType = 'check';

const processTypeCodeIconMap = {
  PENDING: 'add', // 新建
  DELETED: 'delete', // 删除
  PUBLISHED: 'publish2', // 发布
  REJECTED: 'cancel', // 审批拒绝
  CANCELLATION: 'cancel', // 作废协议
  TERMINATION_REJECT: 'cancel', // 拒绝终止
  CONFIRMED: 'check_circle', // 确认协议
  APPROVED: 'check_circle', // 审批通过
  SUPPLEMENT_COMPLETE: 'check_circle', // 补充完成
  STAMPED_COMPLETED: 'check_circle', // 盖章完成
  TERMINATE_COMPLETED: 'check_circle', // 解约完成
  REPLENISHING: 'done_all', // 补充协议中
  SIGN_CONTRACT: 'done_all', // 协议签署
  CONTRACT_SEAL: 'done_all', // 协议用章
  TERMINATION_CONFIRM: 'done_all', // 终止协议
  PURCHASER_SIGN_CONTRACT: 'done_all', // 供应方确认
  SUPPLIER_SIGN_CONTRACT: 'done_all', // 供应方确认
  START_TERMINATION: 'done_all', // 解约签章
  PURCHASE_TERMINATE_SIGN: 'done_all', // 采方解约用章
  SUPPLIER_TERMINATE_SIGN: 'done_all', // 供方解约用章
  REVOCATION: 'reply', // 撤回
  SUPPLIER_REJECTED: 'reply', // 拒绝协议
  STAMPED_BACK: 'reply', // 盖章退回
  PROTOCOL_CHANGE: 'mode_edit', // 变更协议
  TERMINATION: 'not_interested', // 确认终止
  ARCHIVE: 'folder_open2', // 已归档
  TRANSFER: 'call_missed_outgoing', // 转交
  FUNCTIONAL_APPROVED: 'authorize', // 功能审批通过
  FUNCTIONAL_REJECTED: 'authorize', // 功能审批拒绝
  WORKFLOW_APPROVED: 'authorize', // 工作流通过
  WORKFLOW_REJECTED: 'authorize', // 工作流拒绝
  FUNCTIONAL_EFFECTED_APPROVED: 'authorize', // 生效审批通过
  EXTERNAL_APPROVAL_APPROVED: 'authorize', // 外部审批流通过
  EXTERNAL_APPROVAL_REJECTED: 'authorize', // 外部审批流拒绝
  FUNCTIONAL_EFFECTED_REJECTED: 'authorize', // 生效审批拒绝
  WORKFLOW_APPROVAL_APPROVED: 'authorize', // 工作流审批（统一对接）通过
  WORKFLOW_APPROVAL_REJECTED: 'authorize', // 工作流审批（统一对接）拒绝
  EXPORT_INTERFACE_APPROVED: 'authorize', // 外部系统审批（统一对接）通过
  EXPORT_INTERFACE_REJECTED: 'authorize', // 外部系统审批（统一对接）拒绝
  CHAPTER_APPEND_SIGNER: 'authorize', // 协议用章追加签署人
  DEFAULT: defaultType, // 默认
};

const defaultDesc = 'operation';
const processTypeCodeDescMap = {
  PROTOCOL_CHANGE: 'operation', // 发布
  APPROVED: 'approval', // 发布审批拒绝
  DEFAULT: defaultDesc, // 默认
};

export { processTypeCodeIconMap, processTypeCodeDescMap };

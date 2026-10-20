/**
 * utils
 * 操作记录 - 公共方法
 * @date: 2022-04-04
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

export const ACTION_ICONS: string[] = [
  "add",
  "check",
  "publish2",
  "publish_cancel",
  "authorize",
  "cancel",
  "not_interested",
  "mode_edit",
  "autorenew",
  "delete",
  "check_circle",
  "relation",
  "how_to_vote",
  "move_to_inbox",
  "local_shipping",
  "record_test",
  "reply",
  "done_all",
  "auto_complete",
  "enhanced_encryption-o",
  "finished",
  "not_interested",
  "flash_on",
  "flash_off",
  "monetization_on-o",
  "person_pin-o",
  "assignment_turned_in-o",
  "remove_circle_outline",
  "operation_subtask",
  "call_missed_outgoing",
  "verified_user-o",
  "cancel_presentation",
  "contact_support",
  "publish-o",
  "get_app-o",
  "inventory",
  "arrow_circle_up-o",
  "arrow_circle_down-o",
  "account_balance_wallet-o",
];

const ORDER_TYPES = [
  {
    "value": "NEW",
    "description": "新建",
    "icon": "add",
  },
  {
    "value": "DELETED",
    "description": "已删除",
    "icon": "delete",
  },
  {
    "value": "PURCHASER_SUBMITTED",
    "description": "采购方已提交",
    "icon": "check",
  },
  {
    "value": "SUPPLIER_SUBMITTED",
    "description": "供应商已提交",
    "icon": "check",
  },
  {
    "value": "WFL_WITHDRAWN",
    "description": "工作流已撤回",
    "icon": "reply",
  },
  {
    "value": "APPROVAL_REJECTED",
    "description": "审批拒绝",
    "icon": "reply",
  },
  {
    "value": "PURCHASER_PUBLISHED",
    "description": "采购方已发布",
    "icon": "publish2",
  },
  {
    "value": "SUPPLIER_PUBLISHED",
    "description": "供应商已发布",
    "icon": "publish2",
  },
  {
    "value": "WITHDRAWN",
    "description": "已撤回",
    "icon": "reply",
  },
  {
    "value": "PURCHASER_REJECTED",
    "description": "采购方已拒绝",
    "icon": "reply",
  },
  {
    "value": "SUPPLIER_REJECTED",
    "description": "供应商已拒绝",
    "icon": "reply",
  },
  {
    "value": "PURCHASER_FEEDBACK",
    "description": "采购方已反馈",
    "icon": "record_test",
  },
  {
    "value": "SUPPLIER_FEEDBACK",
    "description": "供应商已反馈",
    "icon": "record_test",
  },
  {
    "value": "PART_PROCESSED",
    "description": "部分处理",
    "icon": "check",
  },
  {
    "value": "CONFIRMED",
    "description": "已确认",
    "icon": "check",
  },
  {
    "value": "CLOSE_APPROVAL",
    "description": "关闭审批中",
    "icon": "not_interested",
  },
  {
    "value": "CLOSED",
    "description": "已关闭",
    "icon": "not_interested",
  },
];

const WORKFLOW_TYPES = [
  {
    "value": "COMMIT",
    "description": "提交",
    "icon": "check",
  },
  {
    "value": "REVOKE",
    "description": "撤销",
    "icon": "reply",
  },
  {
    "value": "STOP",
    "description": "终止",
    "icon": "cancel_presentation",
  },
  {
    "value": "SUSPENDED",
    "description": "挂起中",
    "icon": "enhanced_encryption-o",
  },
  {
    "value": "APPROVED",
    "description": "同意 - 已完成",
    "icon": "check",
  },
  {
    "value": "REJECTED",
    "description": "拒绝 - 已完成",
    "icon": "reply",
  },
  {
    "value": "APPROVAL",
    "description": "审批中",
    "icon": "authorize",
  },
];


export function actionTypeGetActionIcon(actionType: string): (string | null) {
  const type = [...ORDER_TYPES, ...WORKFLOW_TYPES].find(n => n.value === actionType);
  if(type) {
    return type.icon;
  }
  const lowerCaseType = actionType.toLocaleLowerCase();
  return ACTION_ICONS.find(i => lowerCaseType.includes(i)) || null;
}

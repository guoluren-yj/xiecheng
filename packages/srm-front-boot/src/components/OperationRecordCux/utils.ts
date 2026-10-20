/**
 * utils
 * 操作记录 - 公共方法
 */

import request from 'utils/request';
import { statusIconTypeItem } from './interfaceAll';


const GENERAL_TYPES = [
  {
    "value": "RENEW",
    "description": "更新",
    "icon": "update",
  },
  {
    "value": "NEW",
    "description": "新建",
    "icon": "add",
  },
  {
    "value": "SUBMIT",
    "description": "提交",
    "icon": "check",
  },
  {
    "value": "REJECTED",
    "description": "拒绝",
    "icon": "reply",
  },
  {
    "value": "SUBMIT",
    "PUBLISHED": "发布",
    "icon": "publish2",
  },
  {
    "value": "FEEDBACK",
    "description": "反馈",
    "icon": "record_test",
  },
  {
    "value": "APPROVED",
    "description": "审批通过",
    "icon": "check_circle",
  },
  {
    "value": "APPROVALING",
    "description": "审批中",
    "icon": "authorize",
  },
  {
    "value": "APPROVE_REJECTED",
    "description": "审批拒绝",
    "icon": "cancel",
  },
];

export function actionTypeGetActionIcon(actionType: string, statusIconTypes: Array<statusIconTypeItem> = []) {
  const type = [...GENERAL_TYPES, ...statusIconTypes];
  const currentType = type.find(item => item.value === actionType);

  return currentType?.icon || '';
}

// 查询审批历史数据
export async function fetchHistoryApproval(url: string, method: string, params: any) {
  return request(url, {
    method,
    query: params,
  });
}
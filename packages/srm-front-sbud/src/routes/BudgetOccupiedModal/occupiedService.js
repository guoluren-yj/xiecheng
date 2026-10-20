/*
 * amountUsageService - 图片管理
 * @date: 2023-07-
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const prefix = `/sbdm/v1`;
/**
 * 查询列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryBudgetList(params) {
  return request(`${prefix}/${organizationId}/budget-line/by-document`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 获取明细行金额
 * @param {单条数据DTO} Object
 */
 export async function fetchLineAmount(budgetLineId) {
    return request(`${prefix}/${organizationId}/budget-line/amount/${budgetLineId}`, {
      method: 'GET',
    });
  }
  
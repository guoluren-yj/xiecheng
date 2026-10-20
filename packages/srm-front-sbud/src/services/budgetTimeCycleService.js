/*
 * @Description:
 * @Date: 2020-07-24 10:26:19
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SPRM}/v1`;
const organizationId = getCurrentOrganizationId();

/**
 * 查询时间周期动态列
 */
export async function getBudgetItem() {
  return request(`${prefix}/${organizationId}/budget-item/listForDocumentDate`, {
    method: 'GET',
  });
}

/**
 * 保存规则
 * @param {勾选数据} list
 */
export async function save(list) {
  return request(`${prefix}/${organizationId}/budget-period-sets`, {
    method: 'POST',
    body: list,
  });
}

/**
 * 保存规则详情
 * @param {勾选数据} list
 */
export async function saveCycelDetail(list) {
  return request(`${prefix}/${organizationId}/budget-periods`, {
    method: 'POST',
    body: list,
  });
}

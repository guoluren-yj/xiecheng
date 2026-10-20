/*
 * @Date: 2023-11-03 10:18:58
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

// 保存
export async function saveScoreDetail(params) {
  const { customizeUnitCode, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/saveFeedback`, {
    method: 'POST',
    body: rest,
    query: { customizeUnitCode },
  });
}

// 确认
export async function confirmScoreDetail(params) {
  const { customizeUnitCode, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/confirm`, {
    method: 'POST',
    body: rest,
    query: { customizeUnitCode },
  });
}

// 评分明细
export async function queryScoreDetail({ evalRespRule, evalLineId }) {
  return request(
    `${SRM_SSLM}/v1/${tenantId}/kpi-eval-header-datas/eval-manage/line/${evalRespRule}/${evalLineId}`,
    {
      method: 'GET',
    }
  );
}

// 申诉
export async function submitComplaint(params) {
  const { newList, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-line/appeal`, {
    method: 'POST',
    body: newList,
    query: { customizeUnitCode },
  });
}

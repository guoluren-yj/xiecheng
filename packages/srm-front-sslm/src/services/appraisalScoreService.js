/*
 * @Date: 2023-10-23 15:35:16
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

// 根据不同考评颗粒度+维度，查询评分信息左侧数据
export async function fetchScoreLeft({ dimension, evalHeaderId, ...rest }) {
  const type = dimension === 'CA' ? 'category' : dimension === 'IT' ? 'item' : 'supplier';
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-line/${type}/${evalHeaderId}`, {
    method: 'GET',
    query: rest,
  });
}

// 查询列表页数量
export async function queryListCount(params) {
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/evaluate/count`, {
    method: 'GET',
    query: params,
  });
}

// 保存评分
export async function saveScore({ customizeUnitCode, ...params }) {
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-dtl-resps`, {
    method: 'PUT',
    body: params,
    query: { customizeUnitCode },
  });
}

// 提交评分
export async function submitScore({ customizeUnitCode, ...params }) {
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-dtl-resps/submit`, {
    method: 'PUT',
    body: params,
    query: { customizeUnitCode },
  });
}

// 判断权重是否相同
export async function weightSameJudge(params) {
  const { evalHeaderId, customizeUnitCode, ...body } = params;
  return request(
    `${SRM_SSLM}/v1/${tenantId}/eval-dtl-resps/evaluate/current-user-weight-is-same/${evalHeaderId}/post`,
    {
      method: 'POST',
      query: { customizeUnitCode },
      body,
    }
  );
}

// 转交评分人
export async function transmitScorer(params) {
  const { evalHeaderId, customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-dtl-resps/batch-save-transform/${evalHeaderId}`, {
    method: 'POST',
    body,
    query: { customizeUnitCode },
  });
}

// 放弃评分
export async function giveUpScore(params) {
  const { evalHeaderId, customizeUnitCode, body } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-dtl-resps/${evalHeaderId}/batch-abandon`, {
    method: 'POST',
    body,
    query: { customizeUnitCode },
  });
}

// 撤回评分
export async function revokeScore(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${tenantId}/eval-headers/eval-manage/score-cancel`, {
    method: 'POST',
    body,
    query: { customizeUnitCode },
  });
}

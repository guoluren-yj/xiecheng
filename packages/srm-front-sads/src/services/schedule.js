import request from 'utils/request';
/**
 * 启用或禁用标签数据
 * @export
 * @param {*} params
 * @returns
 */
export async function updateEnable(params) {
  return request(`/sdap/v1/jobs`, {
    method: 'PUT',
    body: params,
  });
}

// 执行
export function excuteJob(params) {
  return request(`/sdap/v1/jobs/jobExecute`, {
    method: 'GET',
    query: params,
  });
}

// 执行
export function terminateJob(logId) {
  return request(`/sdap/v1/cron-logs/stop/${logId}`, {
    method: 'GET',
  });
}

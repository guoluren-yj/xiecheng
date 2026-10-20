/**
 * service - 快捷回复
 * @date: 2021-7-21
 * @version: 1.0.0
 * @author: xshen
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_HWFP } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${HZERO_HWFP}/v1`;

// 查询快捷回复
export async function queryQuickReply() {
  return request(`${prefix}/${getCurrentOrganizationId()}/activiti/task/fast-reply?type=ALL`, {
    method: 'GET',
  });
}

// 保存快捷回复
export async function saveQuickReply(value) {
  return request(`${prefix}/${getCurrentOrganizationId()}/activiti/task/fast-reply`, {
    method: 'POST',
    body: { content: value },
  });
}

// 删除快捷回复
export async function deleteQuickReply(value) {
  return request(
    `${prefix}/${getCurrentOrganizationId()}/activiti/task/fast-reply?commentId=${value}`,
    {
      method: 'DELETE',
    }
  );
}

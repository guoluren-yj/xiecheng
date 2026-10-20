/**
 * agentButtonList - Agent 按钮列表服务层
 * @date: 2026-05-22
 * @version: 0.0.1
 */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const isTenant = isTenantRoleLevel();
const organizationId = getCurrentOrganizationId();

/**
 * 查询单个 Agent 按钮详情
 * @param {number|string} id - 按钮 ID
 */
export async function fetchAgentButtonDetail(id) {
  return request(
    isTenant
      ? `${SRM_PLATFORM}/v1/${organizationId}/agent-button-infos/detail/${id}`
      : `${SRM_PLATFORM}/v1/agent-button-infos/detail/${id}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 新建/更新 Agent 按钮
 * @param {object} params - 按钮数据
 */
export async function saveAgentButton(params) {
  return request(
    isTenant
      ? `${SRM_PLATFORM}/v1/${organizationId}/agent-button-infos/save`
      : `${SRM_PLATFORM}/v1/agent-button-infos/save`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * docFlowDefinitionDs.js 单据流节点定义 service
 * @date: 2021-08-23
 * @author: yukbiu <yubiao.qiu@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */

import request from 'utils/request';
import { SRM_DATA_PROCESS } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag
  ? `${SRM_DATA_PROCESS}/v1/${organizationId}`
  : `${SRM_DATA_PROCESS}/v1`;

function delDocFlowDefinition(data) {
  const { nodeId } = data;
  return request(`${SRM_DATA_PROCESS}/v1/node-definitions/${nodeId}`, {
    method: 'DELETE',
  });
}

async function importNewNodeSer(params) {
  return request(`${requestUrlPre}/node-definitions/reference`, {
    method: 'GET',
    query: params,
  });
}

export { delDocFlowDefinition, importNewNodeSer };

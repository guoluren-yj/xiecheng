import request from 'utils/request';
import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 查询状态的节点信息
export async function fetchPlanAsnAPI(params) {
    return request(`${SRM_SLOD}/v1/${organizationId}/delivery/plan/${params.nodeConfigId}/last-roll-plan?fromPoLineLocationId=${params.fromPoLineLocationId}&campKey=${params.campKey}`, {
      method: 'GET',
    });
  }
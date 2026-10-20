import request from 'utils/request';
import { SRM_SSTA, SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;
const spcmPrefix = `${SRM_SPCM}/v1/${tenantId}`;

// 查询审批记录数据
export async function fetchApprovalData(query: Record<'primaryId' | 'documentType', any>) {
  const { primaryId, documentType } = query;
  let url= `${apiPrefix}/settle-headers/ssta-historyApproval-batch`;
  if (documentType === 'SRM_SPCM_RULE') {
    url = `${spcmPrefix}/rule-actions//approval/${primaryId}`;
  }
  return request(url, {
    method: 'GET',
    query,
  });
}

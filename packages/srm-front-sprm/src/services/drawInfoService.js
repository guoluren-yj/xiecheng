import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 *查询物料记录
 * @async
 * @function queryReqApprove
 * @param {obj} params.itemReqHeaderId
 * @returns fetch Promise
 */
export async function queryDrawInfo(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/drawings/view/list`, {
    method: 'GET',
    query: {
      ...params,
      customizeUnitCode: 'SMDM_MATERIELQUERY_DETAIL.DRAWING_INFO',
    },
  });
}

// 外部附件下载
// export async function rederctUrl(params) {
//   return request(`/sitf/v1/${organizationId}/ext-file-download`, {
//     method: 'GET',
//     query: params,
//     responseType: 'blob',
//   });
// }

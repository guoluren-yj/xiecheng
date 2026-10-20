/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-10 16:02:28
 * @FilePath: /srm-front-sslm/src/services/supplierEvaluationWorkbenchServices.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询整单页签单据数量
 * @export
 * @returns
 */
export async function getManageCount() {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/count`, {
    method: 'POST',
  });
}

/*
 * @Description: PartsRecognitionManage - 零件承认管理
 * @Date: 2020-05-20
 * @author: ZXM <ximin.zhang02@hand-china.com>
 * @Copyright: Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function handleSave(data) {
  return request(`${SRM_MDM}/v1/${organizationId}/budget-accounts/batch-save`, {
    body: [data],
    method: 'POST',
  });
}

import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

interface saveSubRelationParams {
  subRelationCurId: string | number,
  subRelationId?: string | number,
  subRelationNum?: string | number,
  subRelationItemCurList?: Array<object>,
  customizeUnitCode?: string,
};

// 保存替代方案当前表
export async function saveCurrent(params: saveSubRelationParams) {
  const { customizeUnitCode, ...otherParams } = params || {};
  return request(`${SRM_MDM}/v1/${organizationId}/sub-relation-cur/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: filterNullValueObject(otherParams),
  });
}

// 发布替代方案当前表
export async function releaseCurrent(params: saveSubRelationParams) {
  const { customizeUnitCode, ...otherParams } = params || {};
  return request(`${SRM_MDM}/v1/${organizationId}/sub-relation-cur/release`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: filterNullValueObject(otherParams),
  });
}

// 复制替代方案当前表 copy
export async function copyCurrent(subRelationCurId: string | number) {
  return request(`${SRM_MDM}/v1/${organizationId}/sub-relation-cur/copy`, {
    method: 'POST',
    body: {subRelationCurId},
  });
}

// 解锁替代方案当前表unlock
export async function unlockCurrent(subRelationCurId: string | number) {
  return request(`${SRM_MDM}/v1/${organizationId}/sub-relation-cur/unlock`, {
    method: 'POST',
    body: {subRelationCurId},
  });
}

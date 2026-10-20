import request from 'utils/request';
import { SRM_HPFM } from '@/utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

export const getCommonService = (params) => {
  return request(`${SRM_HPFM}/v1/${getCurrentOrganizationId()}/lov-favourite`, {
    method: 'GET',
    query: params,
  });
};

export const addCommonService = (params) => {
  return request(`${SRM_HPFM}/v1/${getCurrentOrganizationId()}/lov-favourite/add`, {
    method: 'POST',
    body: params,
  });
};

export const removeCommonService = (params) => {
  return request(`${SRM_HPFM}/v1/${getCurrentOrganizationId()}/lov-favourite/remove`, {
    method: 'POST',
    body: params,
  });
};

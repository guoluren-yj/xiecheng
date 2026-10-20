import request from 'utils/request';
// import { SRM_DATA_SDAT } from '@/utils/config';

export async function fetchExport(params) {
  return request(`/hfle/v1/0/files/download/compress/urls-and-uuids/group`, {
    method: 'POST',
    body: params,
  });
}

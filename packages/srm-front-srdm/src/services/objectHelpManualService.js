import request from 'utils/request';
import { HZERO_SRDM } from '@/common/config';

export async function getDocumentMarkDown(markDown) {
  return request(`${HZERO_SRDM}/v1/documents/content?code=${markDown}`, {
    method: 'GET',
    responseType: 'text',
  });
}

export async function getSearchContent(keyword) {
  return request(`${HZERO_SRDM}/v1/document/search/${keyword}`, {
    method: 'GET',
  });
}

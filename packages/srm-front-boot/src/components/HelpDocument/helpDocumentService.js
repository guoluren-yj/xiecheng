/**
 * service - HelpDocument
 * @date: 2023-2-20
 * @version: 1.0.0
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 */
import request from 'utils/request';

export async function getDocumentMarkDown({ markKey, service }) {
  return request(`/${service}/v1/helper-document/${markKey}?service=${service}`, {
    method: 'GET',
    responseType: 'text',
  });
}

export async function getSearchContent({ keyword, service }) {
  return request(`/${service}/v1/helper-document/search/${keyword}`, {
    method: 'GET',
  });
}

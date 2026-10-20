/**
 * service - MarmotHelpManual
 * @date: 2022-5-30
 * @version: 1.0.0
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';

export async function getDocumentMarkDown(markDown) {
  return request(`/ssc/v1/document/${markDown}`, {
    method: 'GET',
    responseType: 'text',
  });
}

export async function getSearchContent(keyword) {
  return request(`/ssc/v1/document/search/${keyword}`, {
    method: 'GET',
  });
}

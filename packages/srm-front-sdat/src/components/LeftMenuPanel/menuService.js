/**
 * 左侧 menu 组件接口请求
 * @date: 2022-03-04
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Zhenyun
 */
import request from 'utils/request';

/**
 * fetchList: 查询数据列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchList(params) {
  return request(`${params.fetchUrl}`, {
    method: 'GET',
    query: {
      ...params,
      fetchUrl: '',
      size: 30,
    },
  });
}
